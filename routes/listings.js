const express = require("express");
const router = express.Router();
const userData = require("../models/User");
const carListing = require("../models/CarListing");
const { isLoggedIn } = require("../middleware/auth");
const { geocodeAddress, getDistanceVolledig, getDistanceKm } = require("../services/geocode");

const apiKey = process.env.APIKEY;

router.get("/distance-trip/:listingId", isLoggedIn, async (req, res) => {
  try {
    const listing = await carListing.findById(req.params.listingId)
      .populate("userId", "adres")
      .populate("passagiers", "adres");

    if (!listing) {
      return res.status(404).json({ error: "Listing niet gevonden" });
    }

    if (!listing.userId?.adres) {
      return res.status(400).json({ error: "Bestuurder heeft geen adres" });
    }

    //eventId ophalen via Ticektmaster API
    const tmUrl = `https://app.ticketmaster.com/discovery/v2/events/${listing.eventId}.json?apikey=${apiKey}`;
    const tmResponse = await fetch(tmUrl);
    const tmData = await tmResponse.json();

    const venue = tmData._embedded?.venues?.[0];
    if (!venue) {
      return res.status(400).json({ error: "Venue niet gevonden bij event" });
    }

    const concertAddress = `${venue.name}, ${venue.city?.name}, ${venue.country?.name}`;

    //geocode driver
    const driverCoords = await geocodeAddress(listing.userId.adres);

    //geocode passagiers (allemaal)
    const passengerCoords = [];
    for (const passenger of listing.passagiers) {
      if (passenger?.adres) {
        const coords = await geocodeAddress(passenger.adres);
        passengerCoords.push(coords);
      }
    }

    //geocode concert
    const concertCoords = await geocodeAddress(concertAddress);

    //route bestaat uit: driver -> passengers -> concert -> passengers omgekeerd -> driver
    const coordsArray = [
      [driverCoords.lon, driverCoords.lat],
      ...passengerCoords.map(p => [p.lon, p.lat]),
      [concertCoords.lon, concertCoords.lat],
      ...passengerCoords.slice().reverse().map(p => [p.lon, p.lat]),
      [driverCoords.lon, driverCoords.lat]
    ];

    const distanceKm = await getDistanceVolledig(coordsArray);

    res.json({
      distanceKm: Math.round(distanceKm * 10) / 10,
      passengerCount: passengerCoords.length
    });

  } catch (error) {
    console.error("DISTANCE TRIP ERROR:", error);
    res.status(500).json({ error: "Afstand berekenen mislukt" });
  }
});

//functie om afstanden te berekenen die nodig zijn voor de kostenberekening
router.get("/distance", isLoggedIn, async (req, res) => {
  try {
    const venue = req.query.venue;
    const city = req.query.city;
    const country = req.query.country;

    if (!venue || !city || !country) {
      return res.status(400).json({ error: "Venue/city/country ontbreekt" });
    }

    //gebruiker ophalen
    const user = await userData.findById(req.session.userId);
    if (!user || !user.adres) {
      return res.status(400).json({ error: "Gebruiker heeft geen adres ingevuld" });
    }

    const userAddress = user.adres;
    const eventAddress = `${venue}, ${city}, ${country}`;

    //geocode beide adressen
    const fromCoords = await geocodeAddress(userAddress);
    const toCoords = await geocodeAddress(eventAddress);

    //afstand berekenen
    const distanceKm = await getDistanceKm(fromCoords, toCoords);

    res.json({
      from: userAddress,
      to: eventAddress,
      distanceKm: Math.round(distanceKm * 10) / 10
    });

    console.log(distanceKm);

  } catch (error) {
    console.error("DISTANCE ERROR:", error);
    res.status(500).json({ error: "Afstand berekenen mislukt" });
  }
});

router.get("/auto-aanbieden", isLoggedIn, async (req, res)=>{
  const eventId = req.query.eventId;
  const user = await userData.findById(req.session.userId);
  res.render('auto-aanbieden.ejs', { eventId, user });
});

router.post("/autoaanbieden", isLoggedIn, async (req, res) => {
  try {
    const listingData = {
      userId: req.session.userId, // koppelen met user
      adres: req.body.adres,
      auto: req.body.auto,
      hoeveel: req.body.hoeveel,
      brandstof: req.body.brandstof,
      eventId: req.body.eventId,
      stad: req.body.stad
    };
    await carListing.create(listingData);
    res.redirect(`/buddy-zoeken?eventId=${req.body.eventId}`);
  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het opslaan van je listing. Probeer het opnieuw!" });
  }
});

router.get("/buddy-zoeken", isLoggedIn, async (req, res) => {
  try {
    const eventId = req.query.eventId;

    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json?apikey=${apiKey}`
    );

    const data = await response.json();

    const event = {
      id: data.id,
      artist: data.name,
      date: data.dates?.start?.localDate || "Onbekend",
      time: data.dates?.start?.localTime || "Onbekend",
      venue: data._embedded?.venues?.[0]?.name || "Onbekend",
      city: data._embedded?.venues?.[0]?.city?.name || "",
      country: data._embedded?.venues?.[0]?.country?.name || "",
      image: data.images?.[0]?.url || ""
    };

    const listings = await carListing
      .find({ eventId })
      .populate("userId", "voornaam leeftijd totaalRating reviewCount stad");

    res.render("buddy-zoeken.ejs", { listings, event });

  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het laden van de listings." });
  }
});

router.get("/listing/:listingId", isLoggedIn, async (req, res) => {
  try {
    const listing = await carListing
      .findById(req.params.listingId)
      .populate("userId", "voornaam leeftijd auto totaalRating")
      .populate("passagiers", "voornaam leeftijd auto totaalRating");

    if (!listing) {
      return res.send("Listing not found");
    }

    res.render("listing.ejs", { listing });

  } catch (error) {
    console.error(error);
   res.render("error.ejs", { error: "Error bij het laden van de listing." });
  }
});

router.post("/addToListing", isLoggedIn, async (req, res) => {
  try {
    const listingId = req.body.listingId;
    const userId = req.session.userId;

    const listing = await carListing.findById(listingId);

    if (!listing) {
      return res.render("error.ejs", { error: "Listing niet gevonden." });
    }

    if (listing.userId.toString() === userId) {
      return res.render("error.ejs", { error: "Je bent de owner van deze listing." });
    }

    await carListing.findByIdAndUpdate(listingId, {
      $addToSet: { passagiers: userId }
    });

    res.redirect(`/listing/${listingId}`);

  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het joinen van de listing." });
  }
});

module.exports = router;

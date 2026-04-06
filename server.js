const express = require("express");
const mongoClient = require("mongodb");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const app = express();
const port = 2020;
const apiKey = process.env.APIKEY;
const orsKey = process.env.ORSKEY;
const sessionKey = process.env.SESSIONKEY

app.use(express.static("static"));
app.set('view engine', 'ejs');
app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env["sessionKey"] || '2eKey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.dbPassword,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

function isLoggedIn(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
}

//middleware, als er om een userid gevraagd wordt wordt deze gepakt.
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await userData.findById(req.session.userId);
      res.locals.loggedInUser = user;
    } catch (err) {
      console.error(err);
      res.locals.loggedInUser = null;
    }
  } else {
    res.locals.loggedInUser = null;
  }
  next();
});

async function geocodeAddress(address) {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${orsKey}&text=${encodeURIComponent(address)}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error("Adres niet gevonden: " + address);
  }

  const coords = data.features[0].geometry.coordinates;
  return { lon: coords[0], lat: coords[1] };
}

app.get("/distance-trip/:listingId", isLoggedIn, async (req, res) => {
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

    // Concert ophalen via Ticketmaster eventId
    const tmUrl = `https://app.ticketmaster.com/discovery/v2/events/${listing.eventId}.json?apikey=${apiKey}`;
    const tmResponse = await fetch(tmUrl);
    const tmData = await tmResponse.json();

    const venue = tmData._embedded?.venues?.[0];
    if (!venue) {
      return res.status(400).json({ error: "Venue niet gevonden bij event" });
    }

    const concertAddress = `${venue.name}, ${venue.city?.name}, ${venue.country?.name}`;

    // geocode driver
    const driverCoords = await geocodeAddress(listing.userId.adres);

    // geocode passagiers (allemaal)
    const passengerCoords = [];
    for (const passenger of listing.passagiers) {
      if (passenger?.adres) {
        const coords = await geocodeAddress(passenger.adres);
        passengerCoords.push(coords);
      }
    }

    // geocode concert
    const concertCoords = await geocodeAddress(concertAddress);

    // route opbouwen:
    // driver -> passengers -> concert -> passengers reversed -> driver
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

async function getDistanceVolledig(coordinatesArray) {
  const url = `https://api.openrouteservice.org/v2/directions/driving-car`;

  const body = {
    coordinates: coordinatesArray
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": orsKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("Geen route gevonden");
  }

  const meters = data.routes[0].summary.distance;
  return meters / 1000;
}

async function getDistanceKm(fromCoords, toCoords) {
  const url = `https://api.openrouteservice.org/v2/directions/driving-car`;

  const body = {
    coordinates: [
      [fromCoords.lon, fromCoords.lat],
      [toCoords.lon, toCoords.lat]
    ]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": orsKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("Geen route gevonden");
  }

  const meters = data.routes[0].summary.distance;
  return meters / 1000;
}

app.get("/distance", isLoggedIn, async (req, res) => {
  try {
    const venue = req.query.venue;
    const city = req.query.city;
    const country = req.query.country;

    if (!venue || !city || !country) {
      return res.status(400).json({ error: "Venue/city/country ontbreekt" });
    }

    // gebruiker ophalen
    const user = await userData.findById(req.session.userId);
    if (!user || !user.adres) {
      return res.status(400).json({ error: "Gebruiker heeft geen adres ingevuld" });
    }

    const userAddress = user.adres;
    const eventAddress = `${venue}, ${city}, ${country}`;

    // geocode beide adressen
    const fromCoords = await geocodeAddress(userAddress);
    const toCoords = await geocodeAddress(eventAddress);

    // afstand berekenen
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

app.get("/events", async (req, res) => {

  //30 aankomende events in NL
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?size=100&sort=date,asc&classificationName=music&countryCode=NL&apikey=${apiKey}`;

  try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.fault) {
          console.error("API ERROR:", data.fault);
          return res.status(400).json({ error: "API key werkt niet of geen toegang" });
      }

      if (!data._embedded || !data._embedded.events) {
          return res.json([]);
      }

      const events = data._embedded.events;

      const filteredEvents = events.filter(event => {
        const isMusic = event.classifications?.some(c => c.segment?.name.toLowerCase() === "music");
      
        const unwanted = ["parking", "permit", "parking permit", "seats", "comfort seats"];
        const nameLower = event.name.toLowerCase();
        const isValidName = !unwanted.some(word => nameLower.includes(word));
      
        return isMusic && isValidName;
      });

      const infoEvents = filteredEvents.map(event => ({
          id: event.id,
          artist: event.name,
          genre: event.classifications?.[0]?.genre?.name || "Onbekend",
          date: event.dates?.start?.localDate || "Onbekend",
          time: event.dates?.start?.localTime || "Onbekend",
          venue: event._embedded?.venues?.[0]?.name || "Onbekend",
          city: event._embedded?.venues?.[0]?.city?.name || "",
          country: event._embedded?.venues?.[0]?.country?.name || "",
          url: event.url,
          image: event.images?.find(img => img.ratio === "16_9" && img.width > 1000)?.url 
           || event.images?.[0]?.url 
           || ""
      }));

      res.json(infoEvents);

  } catch (error) {
      console.error("SERVER ERROR:", error);
      res.status(500).json({ error: "API request mislukt" });
  }
});

app.get(`/artist/:artist`, async (req, res) => {

    const artist = req.params.artist;
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(artist)}&size=100&sort=date,asc&classificationName=music&countryCode=NL&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.fault) {
            console.error("API ERROR:", data.fault);
            return res.status(400).json({ error: "API key werkt niet of geen toegang" });
        }

        if (!data._embedded || !data._embedded.events) {
            return res.json([]);
        }

        const events = data._embedded.events;
        
        const filteredEvents = events.filter(event => {
          const isMusic = event.classifications?.some(c => c.segment?.name.toLowerCase() === "music");
        
          const unwanted = ["parking", "permit", "parking permit"];
          const nameLower = event.name.toLowerCase();
          const isValidName = !unwanted.some(word => nameLower.includes(word));
        
          return isMusic && isValidName;
        });

      const infoEvents = filteredEvents.map(event => ({
          id: event.id,
          artist: event.name,
          genre: event.classifications?.[0]?.genre?.name || "Onbekend",
          date: event.dates?.start?.localDate || "Onbekend",
          time: event.dates?.start?.localTime || "Onbekend",
          venue: event._embedded?.venues?.[0]?.name || "Onbekend",
          city: event._embedded?.venues?.[0]?.city?.name || "",
          country: event._embedded?.venues?.[0]?.country?.name || "",
          url: event.url,
          image: event.images?.find(img => img.ratio === "16_9" && img.width > 1000)?.url 
           || event.images?.[0]?.url 
           || ""
      }));

        res.json(infoEvents);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "API request mislukt" });
    }

});


app.get("/login", (req, res)=> {
    res.render('login.ejs');
});

app.get("/error"), (req, res) => {
    res.render('error.ejs')
}

app.get("/user/:id", isLoggedIn, async (req, res) => {
  try {
    const profileUser = await userData.findById(req.params.id);
    const loggedInUser = await userData.findById(req.session.userId);

    const reviews = await reviewData
      .find({ reviewee: req.params.id })
      .populate("reviewer", "username")
      .limit(3)
      
    res.render("user.ejs", { user: profileUser, loggedInUser, reviews });
  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het inloggen." });
  }
});

app.get("/register", (req, res)=>{
    res.render('register.ejs');
});

app.get("/accountinfo", isLoggedIn, async (req, res) => {
    const user = await userData.findById(req.session.userId);
    res.render('accountinfo.ejs', { user });
});


app.get("/gekozen-concert", (req, res)=>{
        const event = {
        id: req.query.id,
        artist: req.query.name,
        date: req.query.date,
        time: req.query.time,
        venue: req.query.venue,
        city: req.query.city,
        country: req.query.country,
        image: req.query.image
        }
        res.render('gekozen-concert.ejs', {event});
});


app.get("/auto-aanbieden", isLoggedIn, (req, res)=>{
  const eventId = req.query.eventId;
  res.render('auto-aanbieden.ejs', { eventId });
});


app.get("/review/:userId", isLoggedIn, async (req, res) => {
  try {
    const reviewedUser = await userData.findById(req.params.userId);
    if (!reviewedUser) return res.send("Gebruiker niet gevonden");
    res.render('review.ejs', { reviewedUser, userId: req.params.userId });
  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het laden van de review pagina." });
  }
});

// https://www.youtube.com/watch?v=ZhqOp1Dkuso
mongoose.connect(process.env.dbPassword);
const userScheme = new mongoose.Schema({
    username: String,
    userId: String,
    voornaam: String,
    achternaam: String,
    adres: String,
    telefoonnummer: String,
    email: String,
    wachtwoord: String,
    leeftijd: String,
    rijbewijs: String,
    auto: String,
    rijden: String,
    reviewCount: { type: Number, default: 0 },
    favorieten: { type: [String], default: [] },
    totaalRating: { type: Number, default: 0},
});

const carListingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "userdata" },
  listingId: String,
  auto: String,
  hoeveel: Number,
  brandstof: String,
  eventId: String,
  passagiers: [{ type: mongoose.Schema.Types.ObjectId, ref: "userdata" }]
});

const reviewScheme = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "userdata" },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "userdata" },
  rating: Number,
  review: String,
});

const reviewData = mongoose.model("reviewData", reviewScheme)
const userData = mongoose.model("userdata", userScheme);
const carListing = mongoose.model("CarListing", carListingSchema);

//Registeren, checkt of het emailadres al bestaat, encrypt het wachtwoord en stuurt naar de DB
app.post("/register", async (req, res) => {
  try {
    const registerData = {
      username: req.body.username,
      userId: req.session.userId,
      voornaam: req.body.voornaam,
      achternaam: req.body.achternaam,
      adres: req.body.adres,
      telefoonnummer: req.body.telefoonnummer,
      email: req.body.email,
      wachtwoord: req.body.wachtwoord,
      reviewCount: 0
    };

    const existingUser = await userData.findOne({ username: registerData.username });
    if (existingUser) return res.send("Username is already registered!");

    const hashedPassword = await bcrypt.hash(registerData.wachtwoord, 10);
    registerData.wachtwoord = hashedPassword;

    await userData.create(registerData);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render("error.ejs", { error: "Error bij het registeren." });
  }
});

//login, checkt of het wachtwoord & email al bestaat en stuurt op basis daarvan door.
app.post("/login", async (req, res) => {
  try {
    const loginData = {
        username: req.body.username,
        wachtwoord: req.body.wachtwoord
    };

    const user = await userData.findOne({ username: loginData.username });
    if (!user) return res.send("Username not registered");

    const match = await bcrypt.compare(loginData.wachtwoord, user.wachtwoord);
    if (!match) return res.send("Incorrect wachtwoord");

    req.session.userId = user._id;
    res.redirect("/");

  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het inloggen." });
  }
});

// accountinfo werkend maken dmv sessions
app.post("/accountinfo", isLoggedIn, async (req, res) =>  {
    try {
      const accountData = {
      username: req.body.username,
      adres: req.body.adres,
      leeftijd: req.body.leeftijd,
      rijbewijs: req.body.rijbewijs,
      auto: req.body.auto,
      rijden: req.body.rijden,
    };
        // user sessionID vinden en dorosturen
    await userData.findByIdAndUpdate(req.session.userId, accountData, { new: true });
    res.redirect("/");
  } catch (error) {
    console.error(error)
    res.render("error.ejs", { error: "Error bij het laden van je accountinfo." });
  }
});


app.post("/autoaanbieden", isLoggedIn, async (req, res) => {
  try {
    const listingData = {
      userId: req.session.userId, // koppelen met user
      adres: req.body.adres,
      auto: req.body.auto,
      hoeveel: req.body.hoeveel,
      brandstof: req.body.brandstof,
      eventId: req.body.eventId
    };
    await carListing.create(listingData);
    res.redirect(`/buddy-zoeken?eventId=${req.body.eventId}`);
  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het opslaan van je listing. Probeer het opnieuw!" });
  }
});

app.get("/buddy-zoeken", isLoggedIn, async (req, res) =>{
  try {
    const event = {
        id: req.query.eventId,
        artist: req.query.name,
        date: req.query.date,
        time: req.query.time,
        venue: req.query.venue,
        city: req.query.city,
        country: req.query.country,
        image: req.query.image
        }
    const eventId = req.query.eventId; 
    const listings = await carListing
      .find({ eventId })
      .populate("userId", "voornaam leeftijd totaalRating reviewCount "); // callt de user info voor de ejs pagina.
    res.render("buddy-zoeken.ejs", { listings, event });
  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het laden van de listings." });
}});

app.get("/", async (req, res) => {
  try {
    const user = await userData.findById(req.session.userId); 
    res.render("index.ejs", { user });

  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het laden van de index." });
  }
});

// https://stackoverflow.com/questions/7342957/how-do-you-round-to-one-decimal-place-in-javascript
app.post("/review/:userId", isLoggedIn, async (req, res) => {
  try {
    const newReview = {
      reviewer: req.session.userId, 
      reviewee: req.params.userId,
      rating: Number(req.body.rating),
      review: req.body.review,
    };
    await reviewData.create(newReview);
    // average rating vastleggen. ChatGPT heeft de totaal rating som gemaakt.
    const reviews = await reviewData.find({ reviewee: req.params.userId });
    const totaalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const gemiddeldeRating = Number((totaalRating / reviews.length).toFixed(1))
    
    await userData.updateOne( { _id: req.params.userId }, { $set: { totaalRating: gemiddeldeRating }, $inc: { reviewCount: 1 } }
)
    res.redirect(`/user/${req.params.userId}`); 
  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het opslaan van je review." });
  }
}) 

// FAVORIET FUNCTIE

app.post("/addToFav",isLoggedIn, async (req, res) =>{
  try{
    const userId = req.session.userId;
    const eventId= req.body.eventId;
    await userData.findByIdAndUpdate(userId, {
      $addToSet: { favorieten: eventId }
    });
  }
  catch(err){
    console.log("error")
    res.status(500).json({error: "Kon niet toevoegen"});
  }

  // https://www.geeksforgeeks.org/mongodb/mongodb-addtoset-operator/"The $addToSet operator in MongoDB is used to add a value to an array and if the value already exists in the array then this operator will do nothing."
  
});

// EIND FAVORIET


app.get("/listing/:listingId", isLoggedIn, async (req, res) => {
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

app.post("/addToListing", isLoggedIn, async (req, res) => {
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

// app.get("/favConcerts", isLoggedIn, async (req, res) => {
//   const user = await userData.findById(req.session.userId);
//   const events = user.favorieten;
//   try {
//     const listEvents = events.map(event => ({
//       artist: event.name,
//       image: event.images?.find(img => img.ratio === "16_9" && img.width > 1000)?.url
//     }))
//     res.send("user", {favs: listEvents});
//   }
//   catch (error) {
//     console.error(error);
//     res.send("Geen concerten gevonden")
//   }
// })

// this shit dont work man idk

app.get("/favorieten", isLoggedIn, async (req, res) => {
  console.log("Session userId:", req.session.userId);
  
  const user = await userData.findById(req.session.userId)
  console.log("User:", user);
  const favorieten = user.favorieten || []

  console.log(user);
  console.log("user.favorieten:", user.favorieten);
  const events = await Promise.all(
    favorieten.map(async (id) => {
      id = id.trim();
      try {
        const response = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${apiKey}`
        );
        const data = await response.json();
        const artist = data.name
        || data._embedded?.attractions?.[0]?.name
        || "Unknown";

        const image = data.images?.[0]?.url
        || data._embedded?.attractions?.[0]?.images?.[0]?.url
        || "../images/imagenotfound.png";
        
        return {
          id: id,
          artist,
          image,
        };

        
      } catch (err) {
        console.error("Could not fetch", id);
        return null;
      }
    })
  );
  console.log(events);
  res.json({
    favorieten: events.filter(e => e !== null)
  });
});
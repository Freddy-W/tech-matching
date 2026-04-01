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

app.use(express.static("static"));
app.set('view engine', 'ejs');
app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.render("index");
});

app.use(session({
  secret: process.env.SESSIONKEY,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.dbPassword,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.get("/events", async (req, res) => {

  //10 aankomende events in NL
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

      const formattedEvents = filteredEvents.map(event => ({
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

      res.json(formattedEvents);

  } catch (error) {
      console.error("SERVER ERROR:", error);
      res.status(500).json({ error: "API request mislukt" });
  }
});

app.get(`/artist/:artist`, async (req, res) => {

    const artist = req.params.artist;

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(artist)}&size=10&sort=date,asc&classificationName=music&countryCode=NL&apikey=${apiKey}`;

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

      const formattedEvents = filteredEvents.map(event => ({
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

        res.json(formattedEvents);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "API request mislukt" });
        console.error("SERVER ERROR:", error);
        res.status(500).json({ error: "Server fout" });
    }

});

// FAVORIET FUNCTIE

// const plusButton = document.querySelector("#plusButton"); //BUTTON BESTAAT NOG NIET
// plusButton.EventListener('click', addConcert);

app.patch("/userdatas/:id", async (req, res) =>{
  const userId = req.session.userId;
  const eventId = req.params.id;
  await db.collection('userdatas').updateOne(
  { _id: userId },
  { $addToSet: { favorieten: eventId } });
  // https://www.geeksforgeeks.org/mongodb/mongodb-addtoset-operator/"The $addToSet operator in MongoDB is used to add a value to an array and if the value already exists in the array then this operator will do nothing."
  
});

// EIND FAVORIET

app.get("/login", (req, res)=>{
    res.render('login.ejs');
});

app.get("/register", (req, res)=>{
    res.render('register.ejs');
});

function isLoggedIn(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.get("/accountinfo", isLoggedIn, (req, res)=>{
  res.render('accountinfo.ejs');
});

app.get("/buddyzoeken", (req, res)=> {
    res.render('buddy-zoeken.ejs');
})

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
    favorieten: String,
});

const carListingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "userdata" },
  auto: String,
  hoeveel: Number,
  rijden: String,
  brandstof: String,
  eventId: String
});
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
      wachtwoord: req.body.wachtwoord
    };

    const existingUser = await userData.findOne({ username: registerData.username });
    if (existingUser) return res.send("Username is already registered!");

    const hashedPassword = await bcrypt.hash(registerData.wachtwoord, 10);
    registerData.wachtwoord = hashedPassword;

    await userData.create(registerData);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send("Error registering user");
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
    if (!user) return res.send("Email not registered");

    const match = await bcrypt.compare(loginData.wachtwoord, user.wachtwoord);
    if (!match) return res.send("Incorrect wachtwoord");

    req.session.userId = user._id;
    res.redirect("/");

  } catch (error) {
    console.error(error);
    res.send("Error logging in");
  }
});

// accountinfo werkend maken dmv sessions
app.post("/accountinfo", async (req, res) =>  {
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
    res.send("Error")
  }
});

app.post("/autoaanbieden", isLoggedIn, async (req, res) => {
  try {
    const listingData = {
      userId: req.session.userId, // Koppeling met user
      auto: req.body.auto,
      hoeveel: req.body.hoeveel,
      rijden: req.body.rijden,
      brandstof: req.body.brandstof,
      eventId: req.body.eventId
    };
    await carListing.create(listingData);
    res.redirect(`/buddy-zoeken?eventId=${req.body.eventId}`);
  } catch (error) {
    console.error(error);
    res.send("Error bij opslaan listing");
  }
});

app.get("/buddy-zoeken", isLoggedIn, async (req, res)=>{
  try {
    const eventId = req.query.eventId; 
    const listings = await carListing
      .find({ eventId })
      .populate("userId", "voornaam"); // voegt de user info toe
    res.render("buddy-zoeken.ejs", { listings });
  } catch (error) {
    console.error(error);
    res.send("Error loading rides");
}});

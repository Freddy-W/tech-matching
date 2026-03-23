const express = require("express");
const mongoClient = require("mongodb");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const session = require('express-session');

const app = express();
const port = 2020;
app.use(express.static("static"));
app.set('view engine', 'ejs');

app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const MongoStore = require('connect-mongo').default;

app.use(session({
  secret: 'process.env.SESSIONKEY',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.dbPassword,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.get(`/artist/:artist`, async (req, res) => {

    const artist = encodeURIComponent(req.params.artist);

    const url = `https://rest.bandsintown.com/artists/${artist}?app_id=${apiKey}`;

    try {

        const response = await fetch(url);
        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "API request mislukt" });

    }

});

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

app.get("/", (req, res)=>{
    res.render('index.ejs');
});


mongoose.connect(process.env.dbPassword);

const dataScheme = new mongoose.Schema({
    voornaam: String,
    achternaam: String,
    adres: String,
    telefoonnummer: String,
    email: String,
    wachtwoord: String,
});

const Data = mongoose.model("Data", dataScheme);
app.post("/register", async (req, res) => {
  try {
    const loginData = {
      voornaam: req.body.voornaam,
      achternaam: req.body.achternaam,
      adres: req.body.adres,
      telefoonnummer: req.body.telefoonnummer,
      email: req.body.email,
      wachtwoord: req.body.wachtwoord
    };

    const existingUser = await Data.findOne({ email: loginData.email });
    if (existingUser) return res.send("Email is already registered!");

    const hashedPassword = await bcrypt.hash(loginData.wachtwoord, 10);
    loginData.wachtwoord = hashedPassword;

    await Data.create(loginData);
    res.render('index.ejs');
  } catch (err) {
    console.error(err);
    res.send("Error registering user");
  }
});

app.post("/login", async (req, res) => {
  try {
    const loginData = {
        email: req.body.email,
        wachtwoord: req.body.wachtwoord
    };

    const user = await Data.findOne({ email: loginData.email });
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
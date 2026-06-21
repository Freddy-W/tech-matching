const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const userData = require("../models/User");
const upload = require("../middleware/upload");

//Registeren, checkt of het emailadres al bestaat, encrypt het wachtwoord en stuurt naar de DB
router.post("/register", upload.single('profielfoto'), async (req, res) => {
  try {
    const registerData = {
      username: req.body.username,
      userId: req.session.userId,
      voornaam: req.body.voornaam,
      achternaam: req.body.achternaam,
      adres: req.body.adres,
      plaats: req.body.plaats,
      leeftijd: req.body.leeftijd,
      telefoonnummer: req.body.telefoonnummer,
      email: req.body.email,
      wachtwoord: req.body.wachtwoord,
      profielfoto: req.file ? { data: req.file.buffer, contentType: req.file.mimetype } : undefined,
      rijbewijs: req.body.rijbewijs,
      auto: req.body.auto,
      reviewCount: 0
    };

    if (await userData.findOne({ username: registerData.username }))
      return res.render('register.ejs', { error: 'Gebruikersnaam wordt al gebruikt! Probeer een andere.' });
    if (await userData.findOne({ email: registerData.email }))
      return res.render('register.ejs', { error: 'E-mail wordt al gebruikt! Probeer een andere.' });

    const hashedPassword = await bcrypt.hash(registerData.wachtwoord, 10);
    registerData.wachtwoord = hashedPassword;

    await userData.create(registerData);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('register.ejs', { error: 'Er ging iets mis, probeer opnieuw.' });
  }
});

//login, checkt of het wachtwoord & email al bestaat en stuurt op basis daarvan door.
router.post("/login", async (req, res) => {
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

module.exports = router;

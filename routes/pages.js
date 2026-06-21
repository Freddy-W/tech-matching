const express = require("express");
const router = express.Router();
const userData = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const user = await userData.findById(req.session.userId);
    res.render("index.ejs", { user });

  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het laden van de index." });
  }
});

router.get("/login", (req, res)=> {
    res.render('login.ejs');
});

router.get("/register", (req, res)=>{
    res.render('register.ejs', { error: '' });
});

router.get("/error", (req, res) => {
    res.render('error.ejs', { error: "Er is een fout opgetreden." });
});

//informatie uit API halen voor gekozen concert
router.get("/gekozen-concert", (req, res)=>{
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

module.exports = router;

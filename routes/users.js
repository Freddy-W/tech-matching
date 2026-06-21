const express = require("express");
const router = express.Router();
const userData = require("../models/User");
const reviewData = require("../models/Review");
const { isLoggedIn } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/pfp/:userId", async (req, res) => {
  try {
    const user = await userData.findById(req.params.userId);
    if (!user || !user.profielfoto?.data) return res.redirect('/images/pfp.jpg');
    res.set('Content-Type', user.profielfoto.contentType);
    res.send(user.profielfoto.data);
  } catch {
    res.redirect('/images/pfp.jpg');
  }
});

router.get("/user/:id", isLoggedIn, async (req, res) => {
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

router.get("/accountinfo", isLoggedIn, async (req, res) => {
    const user = await userData.findById(req.session.userId);
    res.render('accountinfo.ejs', { user, error: '' });
});

// accountinfo werkend maken dmv sessions
router.post("/accountinfo", isLoggedIn, upload.single('profielfoto'), async (req, res) =>  {
    try {
      const accountData = {
      username: req.body.username,
      adres: req.body.adres,
      plaats: req.body.plaats,
      leeftijd: req.body.leeftijd,
      rijbewijs: req.body.rijbewijs,
      auto: req.body.auto,
      rijden: req.body.rijden,
    };
    if (req.file) {
      accountData.profielfoto = { data: req.file.buffer, contentType: req.file.mimetype };
    }

    const user = await userData.findById(req.session.userId);
    if (accountData.username !== user.username && await userData.findOne({ username: accountData.username }))
      return res.render('accountinfo.ejs', { user, error: 'Gebruikersnaam wordt al gebruikt! Probeer een andere.' });
    if (req.body.email !== user.email && await userData.findOne({ email: req.body.email }))
      return res.render('accountinfo.ejs', { user, error: 'E-mail wordt al gebruikt! Probeer een andere.' });

    await userData.findByIdAndUpdate(req.session.userId, accountData, { new: true });
    res.redirect("/");
  } catch (error) {
    console.error(error)
    res.render("error.ejs", { error: "Error bij het laden van je accountinfo." });
  }
});

module.exports = router;

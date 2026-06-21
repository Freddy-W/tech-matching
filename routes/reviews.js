const express = require("express");
const router = express.Router();
const userData = require("../models/User");
const reviewData = require("../models/Review");
const { isLoggedIn } = require("../middleware/auth");

router.get("/review/:userId", isLoggedIn, async (req, res) => {
  try {
    const reviewedUser = await userData.findById(req.params.userId);
    if (!reviewedUser) return res.send("Gebruiker niet gevonden");
    res.render('review.ejs', { reviewedUser, userId: req.params.userId });
  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het laden van de review pagina." });
  }
});

// https://stackoverflow.com/questions/7342957/how-do-you-round-to-one-decimal-place-in-javascript
router.post("/review/:userId", isLoggedIn, async (req, res) => {
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
    const gemiddeldeRating = Number((totaalRating / reviews.length).toFixed(1));

    await userData.updateOne( { _id: req.params.userId }, { $set: { totaalRating: gemiddeldeRating }, $inc: { reviewCount: 1 } }
);
    res.redirect(`/user/${req.params.userId}`);
  } catch (error) {
    console.error(error);
    res.render("error.ejs", { error: "Error bij het opslaan van je review." });
  }
});

module.exports = router;

const mongoose = require("mongoose");

const reviewScheme = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "userdata" },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "userdata" },
  rating: Number,
  review: String,
});

module.exports = mongoose.model("reviewData", reviewScheme);

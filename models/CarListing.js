const mongoose = require("mongoose");

const carListingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "userdata" },
  listingId: String,
  auto: String,
  hoeveel: Number,
  brandstof: String,
  eventId: String,
  stad: String,
  passagiers: [{ type: mongoose.Schema.Types.ObjectId, ref: "userdata" }]
});

module.exports = mongoose.model("CarListing", carListingSchema);

const mongoose = require("mongoose");

const userScheme = new mongoose.Schema({
    username: String,
    userId: String,
    voornaam: String,
    achternaam: String,
    adres: String,
    plaats: String,
    telefoonnummer: String,
    email: String,
    wachtwoord: String,
    leeftijd: String,
    rijbewijs: String,
    auto: String,
    rijden: String,
    profielfoto: { data: Buffer, contentType: String },
    reviewCount: { type: Number, default: 0 },
    favorieten: { type: [String], default: [] },
    totaalRating: { type: Number, default: 0},
});

// modelnaam "userdata" blijft gelijk i.v.m. refs in andere schema's
module.exports = mongoose.model("userdata", userScheme);

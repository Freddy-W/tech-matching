const express = require("express");
const router = express.Router();
const userData = require("../models/User");
const { isLoggedIn } = require("../middleware/auth");

const apiKey = process.env.APIKEY;

// FAVORIET FUNCTIE

router.post("/addToFav", isLoggedIn, async (req, res) =>{
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

router.get("/favorieten", isLoggedIn, async (req, res) => {
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

module.exports = router;

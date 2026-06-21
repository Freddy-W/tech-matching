const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const session = require('express-session');
const MongoStore = require('connect-mongo').default;

// database verbinding opzetten
require("./config/db");

const { loadUser } = require("./middleware/auth");

const app = express();
const port = 2020;

app.use(express.static("static"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env["sessionKey"] || '2eKey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.dbPassword,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// ingelogde gebruiker beschikbaar maken in alle views
app.use(loadUser);

app.post("/toggleFav", isLoggedIn, async (req, res) => {
  const userId = req.session.userId;
  const eventId = req.body.eventId;

  const user = await userData.findById(userId);

  if (user.favorieten.includes(eventId)) {
    await userData.findByIdAndUpdate(userId, {
      $pull: { favorieten: eventId }
    });

    // res.json({ favoriet: false })
    // res.redirect('/gekozen-concert?id=' + eventId);
  } else {
    await userData.findByIdAndUpdate(userId, {
      $addToSet: { favorieten: eventId }
    });

    // res.json({ favoriet: true })
    // res.redirect('/gekozen-concert?id=' + eventId);
  }
});

// app.post("/addToFav",isLoggedIn, async (req, res) =>{
//   try{
//     const userId = req.session.userId;
//     const eventId= req.body.eventId;
//     await userData.findByIdAndUpdate(userId, {
//       $addToSet: { favorieten: eventId }
//     });
//   }
//   catch(err){
//     console.log("error")
//     res.status(500).json({error: "Kon niet toevoegen"});
//   }

//   // https://www.geeksforgeeks.org/mongodb/mongodb-addtoset-operator/"The $addToSet operator in MongoDB is used to add a value to an array and if the value already exists in the array then this operator will do nothing."
  
// });

// app.post("/removeFromFav", isLoggedIn, async (req, res) => {
//   try {
//     const userId = req.session.userId;
//     const eventId = req.body.eventId;

//     await userData.findByIdAndUpdate(userId, {
//       $pull: { favorieten: eventId }
//     });

//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Kon niet verwijderen" });
//   }
// });

// EIND FAVORIET

// routes per onderwerp
app.use(require("./routes/pages"));
app.use(require("./routes/auth"));
app.use(require("./routes/users"));
app.use(require("./routes/events"));
app.use(require("./routes/listings"));
app.use(require("./routes/reviews"));
app.use(require("./routes/favorites"));

app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});

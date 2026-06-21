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

const userData = require("../models/User");

// beschermt routes die ingelogd moeten zijn
function isLoggedIn(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
}

// middleware: als er een userId in de sessie zit, wordt de ingelogde user opgehaald
async function loadUser(req, res, next) {
  if (req.session.userId) {
    try {
      const user = await userData.findById(req.session.userId);
      res.locals.loggedInUser = user;
    } catch (err) {
      console.error(err);
      res.locals.loggedInUser = null;
    }
  } else {
    res.locals.loggedInUser = null;
  }
  next();
}

module.exports = { isLoggedIn, loadUser };

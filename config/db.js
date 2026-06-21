const mongoose = require("mongoose");

// https://www.youtube.com/watch?v=ZhqOp1Dkuso
mongoose.connect(process.env.dbPassword);

module.exports = mongoose;

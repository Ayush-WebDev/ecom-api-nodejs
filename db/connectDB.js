const mongoose = require("mongoose");

const connectDB = (pathURI) => {
  return mongoose.connect(pathURI);
};

module.exports = connectDB;

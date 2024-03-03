const mongoose = require("mongoose");

const userSchma = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    dateOfBirth: Date,
    image: String,
    gender: Number,
  });



const User = mongoose.model("User", userSchma);
module.exports = User;

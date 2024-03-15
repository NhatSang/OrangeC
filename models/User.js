const mongoose = require("mongoose");

const userSchma = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  image: { type: String, default: "" },
  gender: { type: String, enum: ["male", "female"] },
});

const User = mongoose.model("User", userSchma);
module.exports = User;

const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;

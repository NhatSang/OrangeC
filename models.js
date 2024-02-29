const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema({
  username: String,
  password: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
const Account = mongoose.model("Account", accountSchema);
const userSchma = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  dateOfBirth: Date,
  image: String,
  gender: Number,
});
const User = mongoose.model("User", userSchma);
const friendRequestSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  state: Number, // o: pending; 1: accepted; 2: rejected
});
const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
const messageSchema = new mongoose.Schema({
  content: String,
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);
const stickerSchema = new mongoose.Schema({
  urlImage: String,
});
const Sticker = mongoose.model("Sticker", stickerSchema);
module.exports = { Account, User, FriendRequest, Message, Sticker };

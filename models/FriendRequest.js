const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    state: Number, // o: pending; 1: accepted; 2: rejected
  });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
module.exports = FriendRequest;
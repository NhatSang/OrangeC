const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    content: String,
    // senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    senderId: String,
    receiverId: String,
    createAt: { type: Date, default: Date.now },
  });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {type:String, enum:["text","image","video","file","sticker","first"], default:"first"},
    contentMessage: { type: String, default: "" },
    //4 url type: image, video, file
    urlType: { type: Array, default: [] },
    createAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    reaction: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, enum: ["like", "love", "haha", "wow", "sad", "angry","delete"], default: "delete"},
      },
    ],
    isSeen: { type: Boolean, default: false },
    isReceive: { type: Boolean, default: false },
    isSend: { type: Boolean, default: false },
    typeFile: { type: String, default: "" },
    fileName: { type: String, default: "" },
    
  });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
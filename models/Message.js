const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {type:String, enum:["text","image","video","file","sticker"], default:"text"},
    contentMessage: { type: String, default: "" },
    //4 url type: image, video, file
    urlType: { type: Array, default: [] },
    createAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    reaction: { type: String, default: "" },
    isSeen: { type: Boolean, default: false },
    isReceive: { type: Boolean, default: false },
    isSend: { type: Boolean, default: false },
    
  });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
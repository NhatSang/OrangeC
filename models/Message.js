const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    content: {type:String,required:true},
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {type:String, enum:["text","image","video","file"]},
    createAt: { type: Date, default: Date.now },
  });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
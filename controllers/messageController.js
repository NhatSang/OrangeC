const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");
const User = require("../models/User");
const Conversation = require("../models/Conversation");

//get all message by id conversation
const getAllMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  console.log(conversationId);
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }
  const messages = await Message.find({ conversationId });
  return res.status(200).json({ success: true, data: messages });
});

module.exports = {
  getAllMessage,
};
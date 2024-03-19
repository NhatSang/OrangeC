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

const createMessage = asyncHandler(async (msg) => {
  const message = new Message({
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    type: msg.type,
    contentMessage: msg.contentMessage,
    urlType: msg.urlType,
    createAt: msg.createAt,
    isDeleted: msg.isDeleted,
    reaction: msg.reaction,
    isSeen: msg.isSeen,
    isReceive: msg.isReceive,
    isSend: msg.isSend,
  });
  await message.save();
  await Conversation.updateOne(
    { _id: msg.conversationId },
    { $push: { messages: message._id } }
  );
});

module.exports = {
  getAllMessage,
  createMessage,
};
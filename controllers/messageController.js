const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { uploadFile } = require("../service/file.service");


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

const createMessage = async (msg) => {
  try {
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

      return message;
  } catch (error) {
      console.error("Error creating message:", error);
      console.log(error);
      throw error;
  }
};

//lấy 20 tin nhắn gần nhất
const getLastMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }
  const messages = await Message.find({ conversationId }).sort({ createAt: -1 }).limit(20);
  messages.reverse();
  return res.status(200).json({ success: true, data: messages });
});

//lấy tất cả tin nhắn trừ 20 tin nhắn gần nhất
const getMoreMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }
  const messages = await Message.find({ conversationId }).sort({ createAt: -1 }).skip(20);
  messages.reverse();
  return res.status(200).json({ success: true, data: messages });
});

const uploadFiles = asyncHandler(async (req, res) => {
  console.log(req.file);
  try {
    const file = req.file;
    console.log(file);
    const url = await uploadFile(file);
    return res.status(200).json({ success: true, data: url });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// create reaction message
const createReaction = asyncHandler(async ({messageId,userId,reactType}) =>{
  // const {messageId,userId,reactType} = req.body;
  const message = await Message.findById(messageId);
  consolo.log(message);
  // if(!message) {
  //   throw new Error("Khong tim thay msg!")
  // }
  // const existingReaction = message.reaction.find(reaction => reaction.userId.toString() === userId.toString());
  // if(existingReaction){
  //   existingReaction.type = reactType;
  // }else {
  //   message.reaction.push({userId,type:reactType});
  // }
  // await message.save();
})

module.exports = {
  getAllMessage,
  createMessage,
  uploadFiles,
  createReaction,
  getLastMessage,
  getMoreMessage,
};
const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");
const User = require("../models/User");
const Conversation = require("../models/Conversation");


const getConversationByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    
    // Step 1: Tìm tất cả các cuộc trò chuyện mà người dùng tham gia và không phải là nhóm
    const conversations = await Conversation.find({ members: userId, isGroup: false });

    if (!conversations || conversations.length === 0) {
        return res.status(404).json({ success: false, message: "No conversations found" });
    }
    // Step 2: Lặp qua danh sách các cuộc trò chuyện và lấy thông tin người nhận và tin nhắn cuối cùng của mỗi cuộc trò chuyện
    const conversationsWithLastMessage = await Promise.all(conversations.map(async (conversation) => {
        const lastMessage = await Message.findOne({ conversationId: conversation._id })
                                            .sort({ createdAt: -1 })
                                            .populate('receiverId')
                                            .exec();
        return {
            conversation: conversation,
            lastMessage: lastMessage
        };
    }));
    return res.status(200).json({ success: true, data: conversationsWithLastMessage });
});


//create conversation 1-1 and create message
const createConversation = asyncHandler(async (req, res) => {
  const { senderId, receiverId } = req.body;
  const conversation = await Conversation.findOne({
    members: { $all: [senderId, receiverId] },
  });
  if (conversation) {
    return res.status(200).json({ success: true, data: conversation });
  }
  const newConversation = new Conversation({
    members: [senderId, receiverId],
  });
  await newConversation.save();
  return res.status(200).json({ success: true, data: newConversation });
});

// create conversation group
// const createConversationGroup = asyncHandler(async (req, res) => {
//   const { members, nameGroup } = req.body;
//   const newConversation = new Conversation({
//     members,
//     nameGroup,
//     isGroup: true,
//   });
//   await newConversation.save();
//   return res.status(200).json({ success: true, data: newConversation });
// });

module.exports = {
    createConversation,
    getConversationByUserId,
};
const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");
const User = require("../models/User");
const Conversation = require("../models/Conversation");

const getConversationByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Step 1: Tìm tất cả các cuộc trò chuyện mà người dùng tham gia và không phải là nhóm
    const conversations = await Conversation.find({
      members: userId,
      isGroup: false,
    }).exec();

    //   if (!conversations || conversations.length === 0) {
    //       return res.status(200).json({ success: false, data: [] });
    //   }

    // Step 2: Lặp qua danh sách các cuộc trò chuyện và lấy thông tin người nhận và tin nhắn cuối cùng của mỗi cuộc trò chuyện
    const conversationsWithLastMessage = [];
    for (const conversation of conversations) {
      if (conversation.messages.length > 0) {
        lastMessage = await Message.findOne({
          conversationId: conversation._id,
        })
          .sort({ createAt: -1 })
          .populate("senderId")
          .populate("receiverId")
          .exec();
      }
      conversationsWithLastMessage.push({
        conversation: conversation,
        lastMessage: lastMessage,
      });
    }

    return res
      .status(200)
      .json({ success: true, data: conversationsWithLastMessage });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, data: [] });
  }
});

const createConversation = asyncHandler(async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    // Kiểm tra xem cuộc trò chuyện đã tồn tại giữa sender và receiver chưa
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (conversation) {
      // Nếu cuộc trò chuyện đã tồn tại, trả về dữ liệu cuộc trò chuyện đã tồn tại
      return res.status(200).json({ success: true, data: conversation });
    }
    // Nếu cuộc trò chuyện chưa tồn tại, tạo một cuộc trò chuyện mới
    const newConversation = new Conversation({
      members: [senderId, receiverId],
      messages: [],
    });
    // Lưu cuộc trò chuyện mới vào cơ sở dữ liệu
    await newConversation.save();
    // Tạo tin nhắn mới và thiết lập conversationId
    const message = new Message({
      conversationId: newConversation._id,
      senderId,
      receiverId,
    });
    // Lưu tin nhắn mới vào cơ sở dữ liệu
    await message.save();
    // Thêm tin nhắn mới vào danh sách tin nhắn của cuộc trò chuyện
    newConversation.messages.push(message);
    // Lưu lại cuộc trò chuyện với tin nhắn mới vào cơ sở dữ liệu
    await newConversation.save();

    // Trả về dữ liệu của cuộc trò chuyện mới tạo
    return res.status(200).json({ success: true, data: newConversation });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

const addConversation = async (c) => {
  try {
    const conversation = new Conversation({
      nameGroup: c.nameGroup,
      isGroup: c.isGroup,
      members: c.members,
      messages: [],
    });
    await conversation.save();
    return conversation;
  } catch (error) {
    console.log("error create conversation: ", error);
    throw error;
  }
};

module.exports = {
  createConversation,
  getConversationByUserId,
  addConversation,
};

const express = require("express");
const Router = express.Router();
const {
  createConversation,
  getConversationByUserId,
  getAllConversationByUserId,
  uploadAvatarGroup,
} = require("../controllers/conversationController");

Router.post("/addconversation", createConversation);
//param userId
Router.get("/conversation/:userId", getConversationByUserId);
Router.get("/allConversations/:userId", getAllConversationByUserId);
Router.post("/uploadAvatarGroup", uploadAvatarGroup);
module.exports = Router;

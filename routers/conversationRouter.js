const express = require('express')
const Router = express.Router();
const { createConversation,getConversationByUserId } = require('../controllers/conversationController');

Router.post('/addconversation', createConversation);
//param userId
Router.get('/conversation/:userId', getConversationByUserId);
module.exports = Router;
const express = require('express')
const Router = express.Router();
const { createConversation,getConversationByUserId } = require('../controllers/conversationController');

Router.post('/conversation', createConversation);
Router.get('/conversation', getConversationByUserId);
module.exports = Router;
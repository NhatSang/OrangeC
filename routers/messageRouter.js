const express = require('express')
const Router = express.Router();
const { getAllMessage } = require('../controllers/messageController');

//get message theo conversationId 
Router.get('/messages/:conversationId', getAllMessage);
module.exports = Router;
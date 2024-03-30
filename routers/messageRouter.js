const express = require('express')
const Router = express.Router();
const { getAllMessage ,uploadFiles,createReaction} = require('../controllers/messageController');
const upload = require('../middlewares/uploadMiddleware');

//get message theo conversationId 
Router.get('/messages/:conversationId', getAllMessage);
Router.post('/files/upload', upload ,uploadFiles);
Router.post('/message/reaction',createReaction);
module.exports = Router;
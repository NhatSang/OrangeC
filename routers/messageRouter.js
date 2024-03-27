const express = require('express')
const Router = express.Router();
const { getAllMessage ,uploadFiles} = require('../controllers/messageController');
const upload = require('../middlewares/uploadMiddleware');

//get message theo conversationId 
Router.get('/messages/:conversationId', getAllMessage);
Router.post('/files/upload', upload ,uploadFiles);
module.exports = Router;
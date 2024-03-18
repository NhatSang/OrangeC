const express = require('express')
const Router = express.Router();
const { getAllMessage } = require('../controllers/messageController');

Router.get('/messages', getAllMessage);
module.exports = Router;
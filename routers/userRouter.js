const express = require('express')
const Router = express.Router();
const { getAllUser,register,login,refreshToken } = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyMiddleware');

Router.get('/users', getAllUser);
Router.post('/auth/refresh', refreshToken);
Router.post('/auth/register', register);
Router.post('/auth/login', login);

module.exports = Router;
const express = require('express')
const Router = express.Router();
const { getAllUser,register,login,refreshToken,findUsers,uploadAvatar,checkInfo,editProfile,changePassword,changePassword1 } = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyMiddleware');

Router.get('/allusers', getAllUser);
Router.post('/auth/refresh', refreshToken);
Router.post('/auth/register', register);
Router.post('/auth/login', login);
Router.get("/users",findUsers);
Router.post('/uploadAvatar',uploadAvatar);
Router.post('/checkInfo',checkInfo);
Router.post('/editProfile',editProfile);
Router.post('/changePassword',changePassword);
Router.post('/changePassword1',changePassword1);

module.exports = Router;
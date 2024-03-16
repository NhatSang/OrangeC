const express = require('express')
const Router = express.Router();
const { getAllUser, createUser, updateUser, deleteUser,register,login } = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyMiddleware');

Router.get('/users',verifyToken, getAllUser);
Router.post('/user', createUser);
Router.put('/user/:id', updateUser);
Router.delete('/user/:id', deleteUser);
Router.post('/auth/register', register);
Router.post('/auth/login', login);

module.exports = Router;
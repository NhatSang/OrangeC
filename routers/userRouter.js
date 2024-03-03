const express = require('express')
const Router = express.Router();
const { getAllUser, createUser, updateUser, deleteUser,register,login } = require('../controllers/userController');

Router.get('/users', getAllUser);
Router.post('/user', createUser);
Router.put('/user/:id', updateUser);
Router.delete('/user/:id', deleteUser);
Router.post('/register', register);
Router.post('/login', login);

module.exports = Router;
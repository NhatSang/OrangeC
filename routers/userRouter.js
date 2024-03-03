const express = require('express')
const Router = express.Router();
const { getAllUser, createUser, updateUser, deleteUser } = require('../controllers/userController');

Router.get('/users', getAllUser);
Router.post('/users', createUser);
Router.put('/users/:id', updateUser);
Router.delete('/users/:id', deleteUser);

module.exports = Router;
const express = require('express')
const Router = express.Router();
const { getAllAccount, createAccount, updateAccount, deleteAccount } = require('../controllers/accountController');

Router.get('/accounts', getAllAccount);
Router.post('/accounts', createAccount);
Router.put('/accounts/:id', updateAccount);
Router.delete('/accounts/:id', deleteAccount);

module.exports = Router;
const express = require('express')
const Router = express.Router();
const { verifycation,forgotPassword} = require('../controllers/authController');

Router.post('/verifycation', verifycation);
Router.post('/forgotpassword', forgotPassword);

module.exports = Router;
const express = require('express')
const Router = express.Router();
const { verifycation} = require('../controllers/authController');

Router.post('/verifycation', verifycation);

module.exports = Router;
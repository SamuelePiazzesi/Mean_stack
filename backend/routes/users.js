const express = require('express');

const UsersController = require('../controllers/users');

const router = express.Router();

router.post('/signup', UsersController.createUser );

router.post('/login', UsersController.loginUser );

module.exports = router;

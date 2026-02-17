const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { auth } = require('../middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', auth, authController.getMe);

module.exports = router;

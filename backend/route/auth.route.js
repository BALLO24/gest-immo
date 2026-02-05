const express = require('express');
const authController = require('../controller/auth.controller');
const router = express.Router();

// Routes d'authentification
router.post('/register', authController.registerAgence);
router.post('/login', authController.loginAgence);
// router.get('/profile', authController.getAgenceProfile);
// router.put('/profile', authController.updateAgenceProfile);
// router.delete('/profile', authController.deleteAgence);
module.exports = router;
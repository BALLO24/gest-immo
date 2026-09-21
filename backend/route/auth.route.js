const { authenticateToken } = require("../middleware/auth");
const express = require('express');
const authController = require('../controller/auth.controller');
const router = express.Router();

router.post('/register', authController.registerAgence);
router.post('/login', authController.login);
// CORRIGÉ : ces routes étaient commentées car req.agenceId n'existait jamais.
// Elles fonctionnent maintenant avec req.user posé par authenticateToken.
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/profile/password', authenticateToken, authController.changePassword); // AJOUT
router.delete('/profile', authenticateToken, authController.deleteMyAccount);

module.exports = router;

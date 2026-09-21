const express = require('express');
const rateLimit = require('express-rate-limit'); // npm install express-rate-limit
const contactController = require('../controller/contact.controller');
const router = express.Router();

// AJOUT : limite les abus (spam) sur ces routes publiques d'envoi d'email —
// 5 messages par IP toutes les 15 minutes.
const contactLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: { success: false, message: "Trop de messages envoyés, réessayez plus tard." },
});

router.post('/support', contactLimiter, contactController.contacterSupport);
router.post('/agence/:agenceId', contactLimiter, contactController.contacterAgence);

module.exports = router;

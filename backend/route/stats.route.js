const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const statsController = require('../controller/stats.controller');
const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin'), statsController.getStats);

module.exports = router;

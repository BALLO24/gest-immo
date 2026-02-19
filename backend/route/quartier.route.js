const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const express = require('express');
const quartierController = require('../controller/quartier.controller');
const router=express.Router();
router.post('/new', quartierController.addQuartier);
router.get('/',quartierController.getAllQuartiers);
router.delete('/delete/:id', quartierController.deleteQuartier);
module.exports=router;
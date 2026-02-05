const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const express = require('express');
const quartierController = require('../controller/quartier.controller');
const router=express.Router();
router.post('/new',authenticateToken, authorizeRoles("admin"), quartierController.addQuartier);
router.get('/',quartierController.getAllQuartiers);
router.delete('/delete/:id',authenticateToken, authorizeRoles("admin"), quartierController.deleteQuartier);
module.exports=router;
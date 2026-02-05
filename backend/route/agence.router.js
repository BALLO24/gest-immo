const express=require('express');
const agenceController=require('../controller/agence.controller');
const router=express.Router();
router.post('/new',agenceController.addAgence);
router.get('/',agenceController.getAllAgences);
router.delete('/delete/:id',agenceController.deleteAgence);
module.exports=router;
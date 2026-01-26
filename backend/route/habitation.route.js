const express = require("express");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const habitationController = require("../controller/habitation.controller");
const router = express.Router();
router.post("/new",upload.fields([
    {name: 'images', maxCount: 3},
    {name:"video", maxCount:1},
]), habitationController.addHabitation);

router.post("/", habitationController.getAllHabitations);
module.exports = router;
const express = require('express');
const secondscheduleController = require('./secondschedule.controller');
const { upload } = require("../../services/fileupload");

const router = express.Router();

// Routes for Second Schedule entries
router.post('/addLegalEntry', secondscheduleController.addLegalEntry);
router.put('/updateLegalEntry/:id', secondscheduleController.updateLegalEntry);
router.get('/getLegalEntries/:categoryId?', secondscheduleController.getLegalEntries);
router.post("/importLegalEntries/:id", upload.single('upload'), secondscheduleController.importLegalEntries);

module.exports = router;

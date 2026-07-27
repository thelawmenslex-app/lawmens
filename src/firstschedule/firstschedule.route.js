const express = require('express');
const { validate } = require('../../middleware/validation');
const firstscheduleController = require('./firstschedule.controller');
const { addLegalEntry, updateLegalEntry, addSection, addSubsection, addContent } = require('./firstschedule.validation');
const { auth } = require("../../middleware/auth.middleware");
const { upload } = require("../../services/fileupload");

const router = express.Router();

// Routes for Legal Entries
router.post('/addLegalEntry', validate(addLegalEntry), firstscheduleController.addLegalEntry);
router.put('/updateLegalEntry/:id', validate(updateLegalEntry), firstscheduleController.updateLegalEntry);

// Routes for Sections
/*router.post('/addSection', validate(addSection), firstscheduleController.addSection);
router.post('/addSubsection', validate(addSubsection), firstscheduleController.addSubSection);
router.post('/addUndersection/:subsectionId', validate(addSubsection), firstscheduleController.addUnderSection);*/

// Routes for Content
//router.post('/addContent/:subsectionId/:undersectionId', validate(addContent), firstscheduleController.addContent);

// Routes for Retrieving Data
router.get('/getLegalEntries/:categoryId?', firstscheduleController.getLegalEntries);
/*router.get('/getSections', auth, firstscheduleController.getSections);
router.get('/getSubSections/:sectionId', auth, firstscheduleController.getSubSections);
router.get('/getUnderSections/:subsectionId', auth, firstscheduleController.getUndersections);
router.get('/getContent/:subsectionId/:underSectionId/:page', auth, firstscheduleController.getContent);*/

// Additional Routes
router.post("/caseFilter", firstscheduleController.caseFilter);
router.post("/importLegalEntries/:id", upload.single('upload'), firstscheduleController.importLegalEntries);

// Export the router
module.exports = router;

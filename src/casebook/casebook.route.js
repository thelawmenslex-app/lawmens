const express = require('express');
const { validate } = require('../../middleware/validation');
const caseBookController = require('./casebook.controller');
const { addCategory, addSection, addSubsection, addUndersection, addContent } = require('./casebook.validation');
const { auth } = require("../../middleware/auth.middleware");
const { checkPremiumAccess } = require("../../middleware/trial.middleware");
const {upload}=require("../../services/fileupload");
const router = express.Router();
router.post('/addsns', validate(addCategory), caseBookController.addSsn);
router.post('/addsection/:ssnId', validate(addSection), caseBookController.addSection);
// router.post('/addcontent/:ssnId/:sectionId', validate(addContent), caseBookController.addSectionContent);
router.post('/addsubsction', validate(addSubsection), caseBookController.addSubSection);
router.post('/addundersection/:subsectionId', validate(addSection), caseBookController.addUnderSection);
 router.post('/addcontent/:subsectionId/:undersectionId', validate(addContent), caseBookController.addContent);
router.get('/', caseBookController.getcases);
router.get('/getchilds',auth, caseBookController.getcases);
router.post("/casefilter", auth, checkPremiumAccess, caseBookController.caseFilter);
router.get("/getSections/:snsId",auth, checkPremiumAccess, caseBookController.getSections);
router.get("/getSubSections/:sectionId",auth, checkPremiumAccess, caseBookController.getSubSections);
router.get("/getUnderSections/:subsectionId",auth, checkPremiumAccess, caseBookController.getUndersections);
router.get("/getContent/:subsectionId/:underSectionId/:page",auth, checkPremiumAccess, caseBookController.getContent);
router.get("/act/:page",caseBookController.getAct)
router.get("/getsectionContent/:chapterId/:sectionId/:page",auth, checkPremiumAccess, caseBookController.getSectionContent)
router.get("/share/:chapterId/:sectionId/",auth, checkPremiumAccess, caseBookController.sharePdf)
router.get("/comparison/:categoryId", auth, checkPremiumAccess, caseBookController.getComparisonTable);
router.post("/importcases/:id",upload.single('upload'),caseBookController.importCaseBook)
router.post("/import-json/:categoryId", auth, caseBookController.importJson)
module.exports = router;

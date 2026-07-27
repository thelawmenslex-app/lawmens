const express = require('express');
const minoractController = require('./minoract.controller');
const { auth } = require("../../middleware/auth.middleware");

const router = express.Router();

// Public routes (require standard user auth)
router.get('/', auth, minoractController.getMinorActs);
router.get('/:id', auth, minoractController.getMinorActSections);

module.exports = router;

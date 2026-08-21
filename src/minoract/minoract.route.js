const express = require('express');
const minoractController = require('./minoract.controller');

const router = express.Router();

// Public minor acts routes for mobile readers & guests
router.get('/', minoractController.getMinorActs);
router.get('/pdf/:id', minoractController.streamMinorActPDF);
router.get('/:id', minoractController.getMinorActSections);

module.exports = router;

const express = require('express');
const { validate } = require('../../middleware/validation');
const categoryController = require('./profession.controller');
const { addCategory } = require('./profession.validation');
const router = express.Router();
const { auth } = require("../../middleware/auth.middleware")
router.post('/', auth, validate(addCategory), categoryController.addEndUse);
router.get('/', categoryController.getEndUses);
module.exports = router;

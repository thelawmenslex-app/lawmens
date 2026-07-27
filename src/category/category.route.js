const express = require('express');
const { validate } = require('../../middleware/validation');
const categoryController = require('./category.controller');
const { addCategory } = require('./category.validation');
const router = express.Router();
const { auth } = require("../../middleware/auth.middleware")
router.post('/', auth, validate(addCategory), categoryController.addEndUse);
router.get('/', auth, categoryController.getEndUses);
router.get('/:categoryId', auth, categoryController.getEndUseById);
module.exports = router;

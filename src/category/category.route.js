const express = require('express');
const { validate } = require('../../middleware/validation');
const categoryController = require('./category.controller');
const { addCategory } = require('./category.validation');
const router = express.Router();
const { auth } = require("../../middleware/auth.middleware");

router.post('/', auth, validate(addCategory), categoryController.addEndUse);
router.get('/', categoryController.getEndUses);
router.get('/:categoryId', categoryController.getEndUseById);

module.exports = router;

const express = require('express');
const { validate } = require('../../middleware/validation');
const categoryController = require('./subscription.controller');
const { addCategory } = require('./subscription.validation');
const router = express.Router();
const { auth } = require("../../middleware/auth.middleware")
router.post('/', auth, categoryController.addEndUse);
router.get('/', auth, categoryController.getEndUses);
router.post("/subscribe",auth,validate(addCategory),categoryController.planSubscribe)
router.get("/userPlans",auth,categoryController.userPlans)
module.exports = router;

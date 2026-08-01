const express = require('express');
const { validate } = require('../../middleware/validation');
const categoryController = require('./subscription.controller');
const { addCategory } = require('./subscription.validation');
const router = express.Router();
const { auth } = require("../../middleware/auth.middleware");

router.post('/', auth, categoryController.addEndUse);
router.get('/', auth, categoryController.getEndUses);
router.post("/subscribe", auth, validate(addCategory), categoryController.planSubscribe);
router.get("/userPlans", auth, categoryController.userPlans);
router.get("/plans", categoryController.getAvailablePlans);
router.post("/verify-google-play", auth, categoryController.verifyGooglePlaySubscription);
router.get("/status", auth, categoryController.getSubscriptionStatus);

module.exports = router;

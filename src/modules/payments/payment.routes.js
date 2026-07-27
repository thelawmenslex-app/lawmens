const router = require('express').Router();
const { auth } = require('../../../middleware/auth.middleware');
const paymentController = require('./payment.controller');

// Restrict all payment endpoints to authenticated users
router.use(auth);

// Create order
router.post('/create-order', paymentController.createOrder);

// Verify signature
router.post('/verify-payment', paymentController.verifyPayment);

// Mobile In-App Purchase Verification
router.post('/verify-mobile-purchase', paymentController.verifyMobilePurchase);

module.exports = router;

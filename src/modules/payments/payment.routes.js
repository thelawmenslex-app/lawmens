const router = require('express').Router();
const { auth } = require('../../../middleware/auth.middleware');
const paymentController = require('./payment.controller');

// Optional auth for order creation and verification (supports both guest and authenticated users)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        return auth(req, res, (err) => {
            next();
        });
    }
    next();
};

// 1. Create Razorpay Order
router.post('/create-order', optionalAuth, paymentController.createOrder);

// 2. Verify Razorpay Payment signature
router.post('/verify-payment', optionalAuth, paymentController.verifyPayment);

// 3. Webhook listener for async events
router.post('/webhook', paymentController.handleWebhook);

// 4. Mobile In-App Purchase Verification (authenticated)
router.post('/verify-mobile-purchase', auth, paymentController.verifyMobilePurchase);

module.exports = router;

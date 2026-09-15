const router = require('express').Router();
const { auth } = require('../../../middleware/auth.middleware');
const paymentController = require('./payment.controller');

// Optional auth for subscription activation (supports both guest and authenticated users)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        return auth(req, res, (err) => {
            next();
        });
    }
    next();
};

// 1. Render web checkout page
router.get('/checkout-page', paymentController.renderCheckoutPage);

// 2. Direct Subscription Activation / Verification
router.post('/verify-payment', optionalAuth, paymentController.activateOrVerifySubscription);
router.post('/activate', optionalAuth, paymentController.activateOrVerifySubscription);

// 3. Mobile In-App Purchase Verification (authenticated)
router.post('/verify-mobile-purchase', auth, paymentController.verifyMobilePurchase);

module.exports = router;

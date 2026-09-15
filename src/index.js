const router = require('express').Router();
const paymentController = require('./modules/payments/payment.controller');

// Subscription activation endpoints
router.post('/verify-payment', paymentController.activateOrVerifySubscription);
router.post('/payments/verify-payment', paymentController.activateOrVerifySubscription);
router.post('/payments/activate', paymentController.activateOrVerifySubscription);

// eslint-disable-next-line import/no-dynamic-require
router.use('/v' + (process.env.VERSION || '1'), require('./routes/v' + (process.env.VERSION || '1') + '/routes'));

router.use('/v1/sync', require('./modules/sync/sync.routes'));

module.exports = router;

const router = require('express').Router();
const paymentController = require('./modules/payments/payment.controller');

// Direct /api endpoints for standard Razorpay checkout
router.post('/create-order', paymentController.createOrder);
router.post('/verify-payment', paymentController.verifyPayment);
router.post('/payments/create-order', paymentController.createOrder);
router.post('/payments/verify-payment', paymentController.verifyPayment);

// eslint-disable-next-line import/no-dynamic-require
router.use('/v' + (process.env.VERSION || '1'), require('./routes/v' + (process.env.VERSION || '1') + '/routes'));

router.use('/v1/sync', require('./modules/sync/sync.routes'));

module.exports = router;

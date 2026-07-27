const router = require('express').Router();
const userRoute = require('../../users/user.routes');
const categoryRoute = require('../../category/category.route')
const caseRoute = require('../../casebook/casebook.route');
const subscription=require("../../subscription/subscription.route");
const profession=require("../../profession/profession.route");
const firstschedule=require("../../firstschedule/firstschedule.route");
const secondschedule=require("../../secondschedule/secondschedule.route");
const adminRoute = require('../../modules/admin/admin.routes');
const paymentRoute = require('../../modules/payments/payment.routes');
const syncRoute = require('../../modules/sync/sync.routes');
const minoractRoute = require('../../minoract/minoract.route');

router.use('/user', userRoute);
router.use('/category', categoryRoute);
router.use('/cases', caseRoute)
router.use('/subscription',subscription);
router.use("/profession",profession)
router.use("/firstschedule",firstschedule)
router.use("/secondschedule",secondschedule)
router.use('/admin', adminRoute);
router.use('/payments', paymentRoute);
router.use('/sync', syncRoute);
router.use('/minoract', minoractRoute);
module.exports = router;
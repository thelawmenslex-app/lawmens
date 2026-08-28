const router = require("express").Router();
const { register, login, otpFunctionality, forgotVerification, changePassword, getProfile, profileUpdate,profileVerification,addBookMarks,getBookMark,googleLogin ,getPrivacyPolicy, getNotifications, getPublicSignupConfig, submitQuery, getUserQueries, updateFcmToken} = require("./user.controller");
const { validate } = require("../../middleware/validation");
const { register: signup, login: userLogin, otp, forgot, profile } = require("./user.validations");
const { auth } = require("../../middleware/auth.middleware");
router.get("/signup-config", getPublicSignupConfig);
router.post("/register", validate(signup), register);
router.post("/login", validate(userLogin), login);
router.post("/otp", validate(otp), otpFunctionality);
router.post("/verification", validate(otp), forgotVerification);
router.post("/profileverification",auth, validate(otp), profileVerification);
router.put("/forgotpassword", validate(forgot), changePassword);
const { checkPremiumAccess } = require("../../middleware/trial.middleware");
router.put("/profile", auth, validate(profile), profileUpdate);
router.get("/profile", auth, getProfile);
router.put("/bookmark", auth, checkPremiumAccess, addBookMarks);
router.get("/bookMark", auth, checkPremiumAccess, getBookMark);
router.post("/google", googleLogin);
router.get("/privacypolicy",getPrivacyPolicy);
router.post("/notifications/:id/read", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const User = require('../models/user');
        await User.findByIdAndUpdate(userId, { $addToSet: { readNotifications: id } });
        const { sendResponse } = require('../../utils/common_functions');
        return sendResponse(res, true, 200, 'Notification marked as read.');
    } catch (err) {
        const { errorHandler } = require('../../utils/common_functions');
        return errorHandler(err, res);
    }
});

router.get("/notifications", (req, res, next) => {
    if (req.headers.authorization) {
        return auth(req, res, next);
    }
    req.profile = { _id: null, isPremium: false };
    next();
}, getNotifications);
router.post("/query", auth, submitQuery);
router.get("/query/my", auth, getUserQueries);
router.post("/fcm-token", auth, updateFcmToken);

module.exports = router;
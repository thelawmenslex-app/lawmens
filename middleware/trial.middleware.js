const { sendResponse } = require('../utils/common_functions');

const checkPremiumAccess = (req, res, next) => {
    const profile = req.profile;
    
    if (!profile) {
        return sendResponse(res, false, 401, 'Unauthorized. Please login.');
    }

    // Admins, Editors, Moderators, and Support bypass restriction
    const administrativeRoles = ['Admin', 'Super Admin', 'Editor', 'Moderator', 'Support'];
    if (administrativeRoles.includes(profile.role)) {
        return next();
    }

    // User is Premium (One-time payment completed)
    if (profile.isPremium) {
        return next();
    }

    // Check if the user is within their 7-day free trial
    const isTrialActive = profile.trialEndDate && new Date() < new Date(profile.trialEndDate);

    if (isTrialActive) {
        // Free trial users can access content navigation, search filtering, schedules, and sync
        const requestPath = req.originalUrl || req.url || "";
        const allowedRoutes = [
            '/cases/getsectionContent',
            '/cases/casefilter',
            '/cases/getSections',
            '/cases/getSubSections',
            '/cases/getUnderSections',
            '/cases/getContent',
            '/cases/comparison',
            '/firstschedule/getLegalEntries',
            '/sync/pull',
            '/sync/push',
            '/user/notifications'
        ];
        
        const isAllowed = allowedRoutes.some(route => requestPath.includes(route));
        if (isAllowed) {
            return next();
        }
        return sendResponse(res, false, 403, 'Trial restriction: This feature is locked during your 7-day free trial. Please unlock Premium Lifetime Access to continue.');
    }

    // Access Expired
    return sendResponse(res, false, 402, 'Premium access required. Your 7-day free trial has expired. Please complete the one-time purchase to continue accessing premium features.');
};

module.exports = { checkPremiumAccess };

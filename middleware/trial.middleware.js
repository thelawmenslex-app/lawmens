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
    const now = new Date();
    const trialEnd = profile.trialEndDate 
        ? new Date(profile.trialEndDate) 
        : (profile.createdAt ? new Date(new Date(profile.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
        
    const isTrialActive = now < trialEnd;

    if (isTrialActive) {
        // Free trial users get full access to all features during their 7-day free trial!
        return next();
    }

    // Access Expired after 7-day trial
    return sendResponse(res, false, 402, 'Your 7-day free trial has completed. Please upgrade to Premium to continue enjoying unlimited legal access.');
};

module.exports = { checkPremiumAccess };

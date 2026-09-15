const { sendResponse } = require('../utils/common_functions');

// Check for features requiring full Premium Membership (e.g. Criminal Minor Acts, Books other than IPC/BNS, Schedules, Notes, Bookmarks)
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

    // User is Premium (active subscription)
    if (profile.isPremium) {
        return next();
    }

    // Trial users cannot access premium-only features
    return sendResponse(res, false, 403, 'Subscribe to Premium to access this feature.', { isPremiumRequired: true });
};

// Check for baseline app access (10-day trial or active premium)
const checkTrialOrPremiumAccess = (req, res, next) => {
    const profile = req.profile;
    
    if (!profile) {
        return sendResponse(res, false, 401, 'Unauthorized. Please login.');
    }

    const administrativeRoles = ['Admin', 'Super Admin', 'Editor', 'Moderator', 'Support'];
    if (administrativeRoles.includes(profile.role)) {
        return next();
    }

    if (profile.isPremium) {
        return next();
    }

    // Check if the user is within their 10-day free trial
    const now = new Date();
    const trialEnd = profile.trialEndDate 
        ? new Date(profile.trialEndDate) 
        : (profile.createdAt ? new Date(new Date(profile.createdAt).getTime() + 10 * 24 * 60 * 60 * 1000) : new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000));
        
    const isTrialActive = now < trialEnd;

    if (isTrialActive) {
        return next();
    }

    // Access Expired after 10-day trial
    return sendResponse(res, false, 402, 'Your 10-day free trial has expired. Please upgrade to Premium to continue.');
};

module.exports = { 
    checkPremiumAccess,
    checkTrialOrPremiumAccess
};

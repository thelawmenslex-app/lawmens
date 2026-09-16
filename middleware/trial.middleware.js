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

// Check for baseline app access (dynamic trial or active premium)
const checkTrialOrPremiumAccess = async (req, res, next) => {
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

    try {
        const Settings = require('../src/models/settings');
        const setting = await Settings.findOne().lean();
        const appTrialDays = Number(setting?.trialDays) || 10;

        const now = new Date();
        const trialStart = profile.trialStartDate ? new Date(profile.trialStartDate) : (profile.createdAt ? new Date(profile.createdAt) : now);
        const trialEnd = new Date(trialStart.getTime() + appTrialDays * 24 * 60 * 60 * 1000);
        
        const isTrialActive = now < trialEnd;

        if (isTrialActive) {
            return next();
        }

        // Access Expired after trial
        return sendResponse(res, false, 402, `Your ${appTrialDays}-day free trial has expired. Please upgrade to Premium to continue.`);
    } catch (err) {
        return next();
    }
};

module.exports = { 
    checkPremiumAccess,
    checkTrialOrPremiumAccess
};

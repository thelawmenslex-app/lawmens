const { sendResponse } = require('../utils/common_functions');

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.profile || !allowedRoles.includes(req.profile.role)) {
            return sendResponse(res, false, 403, 'Access denied. Insufficient permissions.');
        }
        next();
    };
};

module.exports = { checkRole };

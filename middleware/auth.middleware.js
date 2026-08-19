/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
const passport = require('passport');
const { USER } = require('../utils/constants');
const subscription = require('../src/models/subscription');

const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
    if (err && err.message === 'session_terminated') {
        return reject({
            statusCode: 403,
            status: false,
            message: 'session_terminated',
            data: 'Your session has been terminated because you logged in on another device.',
        });
    }
    if (err || info || !user) {
        return reject({
            statusCode: 401,
            status: false,
            message: 'Please authenticate',
            data: 'Authentication code not matching',
        });
    }
    req.userId = user._id;
    req.profile = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        bookMarks: !user.bookMarks || user.bookMarks && !user.bookMarks.length ? [] : user.bookMarks,
        subscriptionId:user?.subscriptionId,
        professionId:user.professionId?user.professionId:"",
        role: user.role || 'User',
        isPremium: user.isPremium || false,
        trialEndDate: user.trialEndDate ? user.trialEndDate : (user.createdAt ? new Date(new Date(user.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        createdAt: user.createdAt
    }
    resolve();
};

const auth = (req, res, next) => {
    return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(
            req,
            res,
            next,
        );
    })
        .then(() => next())
        .catch((err) => res.status(401).send(err));
    // .catch((err) => next(err));
};

module.exports = { auth, };

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const userModel = require('../src/models/user');

const jwtOptions = {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
    try {
        const user = await userModel.findOne({
            _id: payload.token.id,
            isActive: true,
        });
        if (payload.token.rm && user) {
            user.rm = payload.token.rm;
        }
        if (!user) return done(null, false);

        // Single Device Login Verification
        if (user.currentDeviceId && payload.token.deviceId && user.currentDeviceId !== payload.token.deviceId) {
            return done(new Error('session_terminated'), false);
        }

        done(null, user);
    } catch (error) {
        done(error, false);
    }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
    jwtStrategy,
};

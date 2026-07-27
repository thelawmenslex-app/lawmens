const { Schema, model } = require('mongoose');
const { OTPVERIFICATION } = require('../../utils/constants');
const otpVerificationSchema = Schema(
    {
        phoneNumber: { type: String },
        email: { type: Object },
        otp: { type: String },
        phoneNumberStatus: { type: String, enum: ['pending', 'verified'], default: 'pending' },
        emailStatus: { type: String, enum: ['pending', 'verified'], default: 'pending' },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
module.exports = model(OTPVERIFICATION, otpVerificationSchema);

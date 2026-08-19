const Otp = require('../models/otpverification');

const createOtp = async (data) => {
    const otp = await Otp.create(data);
    return otp;
}

const getOtp = async (condition) => {
    const otp = await Otp.findOne(condition).lean();
    return otp;
}

const updateStatus = async (condition, value) => {
    const otp = await Otp.findOneAndUpdate(condition, value);
    return otp;
}

module.exports = {
    createOtp,
    getOtp,
    updateStatus
}
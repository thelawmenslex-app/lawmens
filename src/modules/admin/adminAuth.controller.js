const User = require('../../models/user');
const AuditLog = require('../../models/auditLog');
const { sendResponse, errorHandler, decryptPassword, encryptPassword, generateToken, generateOTP } = require('../../../utils/common_functions');
const { sendEmail } = require('../../../services/email.service');
const { sendWhatsAppOTP } = require('../../../services/whatsapp.service');
const pug = require('pug');

// Admin Login
const login = async (req, res) => {
    try {
        const { email, password, deviceId } = req.body;
        if (!email || !password) {
            return sendResponse(res, false, 400, 'Email and password are required.');
        }

        const user = await User.findOne({ email, isDeleted: { $ne: true } });
        if (!user) {
            return sendResponse(res, false, 404, 'Account not found.');
        }

        const adminRoles = ['Super Admin', 'Admin', 'Editor', 'Moderator', 'Support', 'Finance Manager'];
        if (!adminRoles.includes(user.role)) {
            return sendResponse(res, false, 403, 'Access denied. Unauthorized role.');
        }

        if (!user.isActive) {
            return sendResponse(res, false, 403, 'Account is suspended. Please contact support.');
        }

        const isMatch = await decryptPassword(password, user.password);
        if (!isMatch) {
            return sendResponse(res, false, 400, 'Invalid credentials.');
        }

        const devId = deviceId || `admin_device_${Date.now()}`;
        user.currentDeviceId = devId;
        user.lastActive = new Date();
        await user.save();

        const token = generateToken({ id: user._id, deviceId: devId });

        // Audit Log for Admin Login
        await AuditLog.create({
            userId: user._id,
            action: 'admin_login',
            details: { email: user.email, role: user.role, ip: req.ip, userAgent: req.headers['user-agent'] },
            ipAddress: req.ip
        });

        const responseData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            token
        };

        return sendResponse(res, true, 200, 'Admin login successful.', responseData);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Admin Forgot Password (Send OTP)
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return sendResponse(res, false, 400, 'Email is required.');
        }

        const user = await User.findOne({ email, isDeleted: { $ne: true } });
        if (!user) {
            return sendResponse(res, false, 404, 'Admin not found.');
        }

        const adminRoles = ['Super Admin', 'Admin', 'Editor', 'Moderator', 'Support', 'Finance Manager'];
        if (!adminRoles.includes(user.role)) {
            return sendResponse(res, false, 403, 'Unauthorized access.');
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpCreatedOn = new Date();
        await user.save();

        const content = pug.renderFile('./views/otp.pug', { otp });
        try {
            await sendEmail(email, content, 'Admin Password Reset Verification');
        } catch (emailErr) {
            console.error("Email sending failed:", emailErr.message);
            console.log(`[DEV ONLY] Admin OTP for ${email} is: ${otp}`);
        }

        if (user.phoneNumber) {
            try {
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                await sendWhatsAppOTP({ phone: user.phoneNumber, otp, name: fullName || 'Admin' });
            } catch (waErr) {
                console.error("Admin WhatsApp OTP dispatch failed:", waErr.message);
            }
        }

        return sendResponse(res, true, 200, 'Reset OTP sent successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Admin Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return sendResponse(res, false, 400, 'Email and OTP are required.');
        }

        const user = await User.findOne({ email, isDeleted: { $ne: true } });
        if (!user) {
            return sendResponse(res, false, 404, 'User not found.');
        }

        const currentDate = new Date();
        const timeDiff = Math.floor((currentDate.getTime() - user.otpCreatedOn.getTime()) / 1000) / 60; // in minutes
        if (user.otp === otp && timeDiff <= 10) {
            return sendResponse(res, true, 200, 'OTP verified successfully.');
        } else {
            return sendResponse(res, false, 400, 'Invalid or expired OTP.');
        }
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Admin Reset Password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return sendResponse(res, false, 400, 'All fields are required.');
        }

        const user = await User.findOne({ email, isDeleted: { $ne: true } });
        if (!user) {
            return sendResponse(res, false, 404, 'User not found.');
        }

        const currentDate = new Date();
        const timeDiff = Math.floor((currentDate.getTime() - user.otpCreatedOn.getTime()) / 1000) / 60;
        if (user.otp !== otp || timeDiff > 10) {
            return sendResponse(res, false, 400, 'Invalid or expired OTP verification.');
        }

        user.password = await encryptPassword(newPassword);
        user.otp = null; // Clear OTP
        await user.save();

        // Audit Log
        await AuditLog.create({
            userId: user._id,
            action: 'admin_password_reset',
            details: { email: user.email },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Password reset successful.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

module.exports = {
    login,
    forgotPassword,
    verifyOtp,
    resetPassword
};

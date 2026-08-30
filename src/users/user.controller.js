const { sendWhatsAppOTP } = require('../services/whatsapp.service');
const { sendResponse, errorHandler, encryptPassword, generateToken, decryptPassword, generateOTP } = require('../../utils/common_functions');
const userService = require("./user.services");
const { createOtp, getOtp, updateStatus } = require("../otp/otp.services");
const { sendEmail } = require("../../services/email.service");
const { getBookMarks } = require("../casebook/casebook.service")
const { getHistory } = require("../category/category.service")
const pug = require("pug")
const register = async (req, res) => {
    try {
        const { body: data } = req;
        const checkUser = await userService.getUser({ $or: [{ email: data.email }, { phoneNumber: data.phoneNumber }] })
        if (checkUser && checkUser.email && data.email && checkUser.email === data.email) {
            return sendResponse(res, false, 200, 'Email already registered.');
        }
        if (checkUser && checkUser.phoneNumber && data.phoneNumber && checkUser.phoneNumber.toString() === data.phoneNumber.toString()) {
            return sendResponse(res, false, 200, 'Phone number already registered.',);
        }
        data.password = await encryptPassword(data.password);
        const user = await userService.createUser(data);
        const deviceId = data.deviceId || `device_${Date.now()}`;
        await userService.updateUser({ _id: user._id }, { currentDeviceId: deviceId });
        const token = generateToken({ id: user._id, deviceId: deviceId });
        const response = {
            "firstName": user.firstName,
            "lastName": user.lastName,
            "password": user.password,
            "email": user.email,
            "phoneNumber": user.phoneNumber,
            "_id": user._id,
            token: token
        }
        return sendResponse(res, true, 200, 'Registration successfull.', response);
    } catch (error) {
        return errorHandler(error, res);
    }
}

const login = async (req, res) => {
    try {
        const { body: data } = req;
        const checkType = data.userName.includes('@')
        const options = {};
        if (checkType) {
            options.email = data.userName
        } else {
            options.phoneNumber = data.userName
        }

        if (!checkType && isNaN(data.userName)) {
            return sendResponse(res, false, 200, 'Please use valid mobile number or email.');
        }
        const checkUser = await userService.getUser(options);
        if (!checkUser) {
            return sendResponse(res, false, 200, 'Please register to contibue.');
        }
        if (checkUser && !checkUser.password) {
            return sendResponse(res, false, 200, 'Invalid password.');
        }
        if (checkUser) {
            originalPassword = await decryptPassword(data.password, checkUser.password);
            if (!originalPassword)
                return sendResponse(res, false, 200, 'Invalid password.');
        }
        const deviceId = data.deviceId || `device_${Date.now()}`;
        await userService.updateUser({ _id: checkUser._id }, { currentDeviceId: deviceId });
        checkUser.token = generateToken({ id: checkUser._id, deviceId: deviceId });
        delete checkUser.password;
        delete checkUser.createdAt;
        delete checkUser.updatedAt;
        delete checkUser.otp;
        delete checkUser.isActive;
        delete checkUser.otpCreatedOn;
        delete checkUser?.bookMarks
        return sendResponse(res, true, 200, 'Login successfull.', checkUser);
    } catch (error) {
        return errorHandler(error, res);
    }
}

const otpFunctionality = async (req, res) => {
    try {
        const { body: data } = req;
        const checkUser = await userService.getUser({ $or: [{ email: data.email }, { phoneNumber: data.phoneNumber }] })
        if (checkUser && checkUser.email && checkUser.email === data.email) {
            return sendResponse(res, false, 200, 'Email already registered.');
        }
        if (checkUser && checkUser.phoneNumber && checkUser.phoneNumber.toString() === data.phoneNumber) {
            return sendResponse(res, false, 200, 'Phone number already registered.');
        }
        const checkOtp = await getOtp({ email: data.email });
        if (!checkUser && data.type && data.type === "send") {
            const otp = generateOTP();
            if (!checkOtp) {
                await createOtp({ email: data.email, otp: otp });
            } else {
                await updateStatus({ email: data.email }, { otp: otp, emailStatus: 'pending' });
            }
            const content = pug.renderFile('./views/otp.pug', { otp: otp });
            try {
                await sendEmail(data.email, content, 'otp verification');
            } catch (emailErr) {
                console.error("Email sending failed:", emailErr.message);
            }
            if (data.phoneNumber) {
                try {
                    await sendWhatsAppOTP({ phone: data.phoneNumber, otp: otp, name: data.firstName || 'New User' });
                } catch (waErr) {
                    console.error("WhatsApp OTP dispatch failed:", waErr.message);
                }
            }
            return sendResponse(res, true, 200, 'Otp sent successfull.');
        }
        if (!checkUser && checkOtp && data.type && data.type === "verify") {
            const currentDate = new Date();
            const time = Math.floor((currentDate.getTime() - checkOtp.updatedAt.getTime()) / 1000) / 60;
            if (checkOtp.otp && checkOtp.otp === data.otp && time && time <= 5) {
                await updateStatus({ email: data.email }, { otp: "", emailStatus: 'verified' });
                return sendResponse(res, true, 200, 'Email verified successfully');
            } else {
                return sendResponse(res, false, 200, 'Invalid OTP.');
            }
        }
    } catch (error) {
        return errorHandler(error, res);
    }
}


const forgotVerification = async (req, res) => {
    try {
        const { body: data } = req;
        const checkUser = await userService.getUser({ $or: [{ email: data.email }] })
        if (checkUser) {
            if (data.type && data.type === "send") {
                const otp = generateOTP();
                await userService.updateUser({ _id: checkUser._id }, { otp: otp, otpCreatedOn: new Date() });
                const content = pug.renderFile('./views/otp.pug', { otp: otp });
                try {
                    await sendEmail(data.email, content, 'otp verification');
                } catch (emailErr) {
                    console.error("Email sending failed:", emailErr.message);
                    console.log(`[DEV ONLY] Forgot OTP for ${data.email} is: ${otp}`);
                }
                if (checkUser.phoneNumber) {
                    try {
                        const fullName = `${checkUser.firstName || ''} ${checkUser.lastName || ''}`.trim();
                        await sendWhatsAppOTP({ phone: checkUser.phoneNumber, otp: otp, name: fullName || 'User' });
                    } catch (waErr) {
                        console.error("WhatsApp OTP dispatch failed:", waErr.message);
                    }
                }
                return sendResponse(res, true, 200, 'Otp sent successfull.',);
            }

            if (data.type && data.type === "verify") {

                const currentDate = new Date();
                const time = Math.floor((currentDate.getTime() - checkUser.otpCreatedOn.getTime()) / 1000) / 60;
                if (checkUser.otp && checkUser.otp === data.otp && time && time <= 5) {
                    await userService.updateUser({ email: data.email }, { otp: "" });
                    return sendResponse(res, true, 200, 'Email verified successfully');
                } else {
                    return sendResponse(res, false, 200, 'Invalid OTP.');
                }
            }
        } else {
            return sendResponse(res, false, 200, 'Please register to continue.');
        }
    } catch (error) {
        return errorHandler(error, res);
    }
}

const profileVerification = async (req, res) => {
    try {
        const { body: data, userId } = req;
        const checkUser = await userService.getUser({ email: data.email })
        if (checkUser && checkUser._id.toString() === userId.toString()) {
            return sendResponse(res, false, 200, 'Email already associated to you.',);
        }
        if (!checkUser) {
            if (data.type && data.type === "send") {
                const otp = generateOTP();
                await userService.updateUser({ _id: userId }, { otp: otp, otpCreatedOn: new Date() });
                const content = pug.renderFile('./views/otp.pug', { otp: otp });
                try {
                    await sendEmail(data.email, content, 'otp verification');
                } catch (emailErr) {
                    console.error("Email sending failed:", emailErr.message);
                    console.log(`[DEV ONLY] Profile verification OTP for ${data.email} is: ${otp}`);
                }
                const activeUser = await userService.getUser({ _id: userId });
                if (activeUser && activeUser.phoneNumber) {
                    try {
                        const fullName = `${activeUser.firstName || ''} ${activeUser.lastName || ''}`.trim();
                        await sendWhatsAppOTP({ phone: activeUser.phoneNumber, otp: otp, name: fullName || 'User' });
                    } catch (waErr) {
                        console.error("WhatsApp OTP dispatch failed:", waErr.message);
                    }
                }
                return sendResponse(res, true, 200, 'Otp sent successfull.',);
            }

            if (data.type && data.type === "verify") {
                const checkUser = await userService.getUser({ _id: userId })
                const currentDate = new Date();
                const time = Math.floor((currentDate.getTime() - checkUser.otpCreatedOn.getTime()) / 1000) / 60;
                if (checkUser.otp && checkUser.otp === data.otp && time && time <= 5) {
                    await userService.updateUser({ _id: userId }, { otp: "" });
                    return sendResponse(res, true, 200, 'Email verified successfully');
                } else {
                    return sendResponse(res, false, 200, 'Invalid OTP.');
                }
            }
        } else {
            return sendResponse(res, false, 200, 'Email already exists.');
        }
    } catch (error) {
        return errorHandler(error, res);
    }
}

const changePassword = async (req, res) => {
    try {
        const { body: data } = req;
        const checkUser = await userService.getUser({ $or: [{ email: data.email }] })
        if (checkUser) {
            let originalPassword = false
            if (checkUser.password) {
                originalPassword = await decryptPassword(data.password, checkUser.password);
            }
            if (originalPassword) {
                return sendResponse(res, false, 200, 'Password must be differ from old password.');
            } else {
                data.password = await encryptPassword(data.password);
                await userService.updateUser({ _id: checkUser._id }, { password: data.password });

                return sendResponse(res, true, 200, 'Password changed.',);
            }
        } else {
            return sendResponse(res, false, 200, 'Please register to continue.');
        }
    } catch (error) {
        return errorHandler(error, res);
    }
}

const profileUpdate = async (req, res) => {
    try {
        const { body: data, userId } = req;
        const checkUser = await userService.getUser({ $or: [{ _id: { $ne: userId }, email: data.email }, { _id: { $ne: userId }, phoneNumber: data.phoneNumber }] })
        if (checkUser && checkUser.email && data.email && checkUser.email === data.email) {
            return sendResponse(res, false, 200, 'Email already exists.');
        }
        if (checkUser && checkUser.phoneNumber && data.phoneNumber && checkUser.phoneNumber.toString() === data.phoneNumber.toString()) {
            return sendResponse(res, false, 200, 'Phone number already exists.',);
        }
        await userService.updateUser({ _id: userId }, data);
        return sendResponse(res, true, 200, 'Profile updated.',);
    } catch (error) {
        return errorHandler(error, res);
    }
}

const getProfile = async (req, res) => {

    console.log("Profile was called");
    try {
        const { userId, profile } = req;
        // const users = await userService.getSettings()
        // const about = await userService.getcms();
        // const searchCount = await getHistory({ isActive: true });
        const [users, cms, searchCount] = await Promise.all([userService.getSettings(), userService.getcms(), getHistory({ userId: userId, isActive: true })])
        profile.contact = users
        profile.about = cms.find(item => item.type === "about")?.content
        profile.privacy = cms.find(item => item.type === "privacy")?.content
        profile.disclaimer = { content: cms.find(item => item.type === "disclaimer")?.content, email: users.email }
        profile.count = { current: searchCount, total: Number(process.env.COUNT) }
        delete profile.bookMarks
        return sendResponse(res, true, 200, 'Profile data', profile);

    } catch (error) {
        return errorHandler(error, res);
    }
}
const getBookMark = async (req, res) => {
    try {
        const { userId, profile } = req;
        if (profile.bookMarks.length) {
            const users = await getBookMarks(profile.bookMarks)
            return sendResponse(res, true, 200, 'Bookmarks  available.', users);
        } else {
            return sendResponse(res, true, 200, 'Bookmarks not available.', []);
        }


    } catch (error) {
        return errorHandler(error, res);
    }
}

const addBookMarks = async (req, res) => {
    try {
        const { userId, body: data } = req;
        let updateData = null
        let message = null
        let options = null
        if (!data.status) {
            delete data.status
            options = { _id: userId, 'bookMarks.sectionId': { $eq: data.sectionId } }
            updateData = { $pull: { bookMarks: data } };
            message = "Bookmark removed successfully."
        } else {
            delete data.status
            options = { _id: userId, 'bookMarks.sectionId': { $ne: data.sectionId } }
            updateData = { $push: { bookMarks: data } };
            message = "Bookmark saved successfully."
        }

        const users = await userService.updateUser(options, updateData)
        return sendResponse(res, true, 200, message);

    } catch (error) {
        return errorHandler(error, res);
    }
}

const googleLogin = async (req, res) => {
    try {
        const { body: data } = req;
        if (!data || !data.email) {
            return sendResponse(res, false, 400, 'Google account email is required.');
        }

        const cleanEmail = data.email.trim().toLowerCase();
        const checkUser = await userService.getUser({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } });
        if (checkUser) {
            // Existing user -> direct login to Home
            const deviceId = data.deviceId || `device_${Date.now()}`;
            await userService.updateUser({ _id: checkUser._id }, { currentDeviceId: deviceId });
            const token = generateToken({ id: checkUser._id, deviceId: deviceId });

            const response = {
                isNewUser: false,
                firstName: checkUser.firstName || data.firstName || 'User',
                lastName: checkUser.lastName || data.lastName || '',
                email: checkUser.email,
                phoneNumber: checkUser.phoneNumber || '',
                _id: checkUser._id,
                token: token
            };

            return sendResponse(res, true, 200, 'Login successfull.', response);
        } else {
            // New Google user -> return Google info so user can complete remaining details (phone & profession)
            return sendResponse(res, true, 200, 'New Google account. Please complete remaining registration details.', {
                isNewUser: true,
                email: cleanEmail,
                firstName: data.firstName || '',
                lastName: data.lastName || ''
            });
        }
    } catch (error) {
        return errorHandler(error, res);
    }
};
const getPrivacyPolicy = async (req, res) => {
    try {
        const cms = await userService.getcms()

        console.log('---------CMS Data:----------', cms); // Log CMS data
        const privacy = cms.find(item => item.type === "privacy")?.content
        return sendResponse(res, true, 200, 'Privacy Policy', { privacy: privacy });

    } catch (error) {
        return errorHandler(error, res);
    }
}
const getNotifications = async (req, res) => {
    try {
        const { profile } = req;
        const isTrialActive = profile.trialEndDate && new Date() < new Date(profile.trialEndDate);
        
        let userGroup = 'trial';
        if (profile.isPremium) {
            userGroup = 'premium';
        } else if (!isTrialActive) {
            userGroup = 'expired';
        }

        const PushNotification = require('../models/pushNotification');
        const notifications = await PushNotification.find({
            status: 'sent',
            $or: [
                { targetGroup: 'all' },
                { targetGroup: userGroup },
                { targetUserId: profile._id }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(25)
        .lean();

        return sendResponse(res, true, 200, 'Notifications retrieved.', notifications);
    } catch (error) {
        return errorHandler(error, res);
    }
}

const getPublicSignupConfig = async (req, res) => {
    try {
        const SignupConfig = require('../models/signupConfig');
        let configs = await SignupConfig.find({ isEnabled: true }).sort({ order: 1 });
        if (!configs || configs.length === 0) {
            // Return standard enabled defaults
            configs = [
                { fieldKey: 'firstName', label: 'First Name', fieldType: 'text', isRequired: true, isEnabled: true, order: 1, placeholder: 'Enter first name' },
                { fieldKey: 'lastName', label: 'Last Name', fieldType: 'text', isRequired: true, isEnabled: true, order: 2, placeholder: 'Enter last name' },
                { fieldKey: 'email', label: 'Email Address', fieldType: 'email', isRequired: true, isEnabled: true, order: 3, placeholder: 'Enter email address' },
                { fieldKey: 'phoneNumber', label: 'Phone Number', fieldType: 'number', isRequired: true, isEnabled: true, order: 4, placeholder: 'Enter 10-digit mobile number' },
                { fieldKey: 'password', label: 'Password', fieldType: 'text', isRequired: true, isEnabled: true, order: 5, placeholder: 'Enter password' },
                { fieldKey: 'professionId', label: 'Profession', fieldType: 'select', isRequired: false, isEnabled: true, order: 6, placeholder: 'Select profession' },
            ];
        }
        return sendResponse(res, true, 200, 'Signup form config retrieved.', configs);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const submitQuery = async (req, res) => {
    try {
        const { body: { subject, question }, profile } = req;
        const targetUserId = req.userId || profile?._id || req.user?._id;
        if (!subject || !question) {
            return sendResponse(res, false, 400, 'Subject and question details are required.');
        }

        const UserQuery = require('../models/userQuery');
        const queryDoc = await UserQuery.create({
            userId: targetUserId,
            userName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User',
            userEmail: profile?.email || '',
            phoneNumber: profile?.phoneNumber || '',
            subject,
            question,
            status: 'Pending'
        });

        return sendResponse(res, true, 200, 'Your query has been submitted successfully to the Admin team.', queryDoc);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const getUserQueries = async (req, res) => {
    try {
        const { profile } = req;
        const targetUserId = req.userId || profile?._id || req.user?._id;
        const UserQuery = require('../models/userQuery');
        const queries = await UserQuery.find({ userId: targetUserId }).sort({ createdAt: -1 });
        return sendResponse(res, true, 200, 'Your queries retrieved.', queries);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const updateFcmToken = async (req, res) => {
    try {
        const { fcmToken, platform } = req.body;
        const userId = req.userId;
        if (!fcmToken) {
            return sendResponse(res, false, 400, 'fcmToken is required.');
        }

        const user = await userService.updateUser(
            { _id: userId },
            { fcmToken, fcmPlatform: platform || 'android' }
        );

        return sendResponse(res, true, 200, 'FCM push token registered successfully.', { fcmToken });
    } catch (error) {
        return errorHandler(error, res);
    }
};

module.exports = {
    register,
    login,
    otpFunctionality,
    forgotVerification,
    changePassword,
    profileUpdate,
    getProfile,
    profileVerification,
    addBookMarks,
    getBookMark,
    googleLogin,
    getPrivacyPolicy,
    getNotifications,
    getPublicSignupConfig,
    submitQuery,
    getUserQueries,
    updateFcmToken
}
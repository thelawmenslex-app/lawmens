const { broadcastContentChange, broadcastUserUpdate } = require('../../../services/socketService');
const User = require('../../models/user');
const AuditLog = require('../../models/auditLog');
const Category = require('../../models/category');
const Casebook = require('../../models/casebookmaster');
const Subscription = require('../../models/subscription');
const SubscriptionHistory = require('../../models/subscriptionHistory');
const Offer = require('../../models/offer');
const PromoCode = require('../../models/promoCode');
const PushNotification = require('../../models/pushNotification');
const Settings = require('../../models/settings');
const ContentHistory = require('../../models/contentHistory');
const Profession = require('../../models/profession');
const BookImport = require('../../models/bookImport');
const FirstSchedule = require('../../models/firstschedule');
const SecondSchedule = require('../../models/secondschedule');
const MinorAct = require('../../models/minorAct');
const MinorActSection = require('../../models/minorActSection');
const SignupConfig = require('../../models/signupConfig');
const UserQuery = require('../../models/userQuery');
const bookImportService = require('../../services/bookImport.service');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { sendResponse, errorHandler } = require('../../../utils/common_functions');

// 1. Dashboard Analytics & Real-Time Metrics
const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
        const premiumUsers = await User.countDocuments({ isPremium: true, isDeleted: { $ne: true } });
        const activeLimit = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const activeUsers7Days = await User.countDocuments({ lastActive: { $gte: activeLimit }, isDeleted: { $ne: true } });
        const activeLimitMonthly = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const activeUsers30Days = await User.countDocuments({ lastActive: { $gte: activeLimitMonthly }, isDeleted: { $ne: true } });
        const trialUsers = await User.countDocuments({ isTrialUsed: false, isPremium: false, isDeleted: { $ne: true } });
        const suspendedUsers = await User.countDocuments({ isActive: false, isDeleted: { $ne: true } });

        // Total Books, Categories, and Sections
        const totalBooks = await Casebook.countDocuments({ isActive: true });
        const totalCategories = await Category.countDocuments({ isActive: true });
        
        // Count sections aggregated
        const sectionsData = await Casebook.aggregate([
            { $match: { isActive: true } },
            { $project: { numberOfSections: { $size: { $ifNull: ["$section", []] } } } },
            { $group: { _id: null, totalSections: { $sum: "$numberOfSections" } } }
        ]);
        const totalLaws = sectionsData.length ? Number(sectionsData[0].totalSections) : 0;

        // Revenue overview (sum of prices of active paid plans from SubscriptionHistory)
        const revenueAggregation = await SubscriptionHistory.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, total: { $sum: { $ifNull: ["$plan.price", 0] } } } }
        ]);
        const totalRevenue = revenueAggregation.length ? Number(revenueAggregation[0].total) : 0;

        // Group users by profession
        const professionBreakdown = await User.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            {
                $group: {
                    _id: '$professionId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'professions',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'professionInfo'
                }
            },
            {
                $project: {
                    profession: { $ifNull: [{ $arrayElemAt: ['$professionInfo.name', 0] }, 'Unassigned'] },
                    count: 1
                }
            }
        ]);

        const professionBreakdownMapped = professionBreakdown.map(item => ({
            profession: item.profession,
            count: Number(item.count)
        }));

        // Offers and Promos counts
        const activeOffers = await Offer.countDocuments({ isActive: true });
        const promoCodesCount = await PromoCode.countDocuments({ isActive: true });

        // Real User Growth over the last 6 months (grouped by registration month)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const growthAggregation = await User.aggregate([
            {
                $match: {
                    isDeleted: { $ne: true },
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const growthLabels = [];
        const growthData = [];

        // Build the labels and values for the last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.getMonth() + 1; // 1-indexed month
            const y = d.getFullYear();
            const label = monthNames[d.getMonth()];
            
            const match = growthAggregation.find(item => item._id.month === m && item._id.year === y);
            growthLabels.push(label);
            growthData.push(match ? Number(match.count) : 0);
        }

        const loadAvg = os.loadavg();
        const freeMem = os.freemem();
        const totalMem = os.totalmem();

        const analytics = {
            totalUsers,
            premiumUsers,
            activeUsers7Days,
            activeUsers30Days,
            trialUsers,
            suspendedUsers,
            totalRevenue,
            totalBooks,
            totalCategories,
            totalLaws,
            activeOffers,
            promoCodesCount,
            professionBreakdown: professionBreakdownMapped,
            charts: {
                growthLabels,
                growthData
            },
            system: {
                serverStatus: 'Online',
                apiStatus: 'Operational',
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                cpuLoad: loadAvg[0].toFixed(2),
                freeMemoryGB: (freeMem / (1024 * 1024 * 1024)).toFixed(2),
                totalMemoryGB: (totalMem / (1024 * 1024 * 1024)).toFixed(2)
            }
        };

        return sendResponse(res, true, 200, 'Analytics retrieved successfully.', analytics);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 2. User Management
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const role = req.query.role || '';
        const isPremium = req.query.isPremium;

        const query = { isDeleted: { $ne: true } };
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }
        if (isPremium !== undefined && isPremium !== '') {
            query.isPremium = isPremium === 'true';
        }

        const users = await User.find(query)
            .select('-password -otp -otpCreatedOn')
            .populate('professionId', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const totalUsers = await User.countDocuments(query);

        return sendResponse(res, true, 200, 'Users list retrieved.', {
            users,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            totalUsers
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

// View Detailed User Profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .select('-password')
            .populate('professionId', 'name')
            .lean();

        if (!user) {
            return sendResponse(res, false, 404, 'User not found.');
        }

        // Fetch bookmark titles if any
        const bookmarks = user.bookMarks || [];

        // Fetch reading history count
        const readingHistoryCount = await ContentHistory.countDocuments({ userId });

        return sendResponse(res, true, 200, 'User profile retrieved.', {
            user,
            bookmarks,
            readingHistoryCount
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Edit User Profile
const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.userId;
        const updates = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, false, 404, 'User not found.');
        }

        // Keep copy of old values for audit logging
        const oldValues = {
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isPremium: user.isPremium,
            trialEndDate: user.trialEndDate
        };

        // Apply updates
        if (updates.firstName !== undefined) user.firstName = updates.firstName;
        if (updates.lastName !== undefined) user.lastName = updates.lastName;
        if (updates.phoneNumber !== undefined) user.phoneNumber = updates.phoneNumber;
        if (updates.professionId !== undefined) user.professionId = updates.professionId;
        if (updates.role !== undefined) user.role = updates.role;
        if (updates.isPremium !== undefined) user.isPremium = updates.isPremium;
        if (updates.trialEndDate !== undefined) user.trialEndDate = updates.trialEndDate;

        await user.save();

        // Audit Log
        await AuditLog.create({
            userId: adminId,
            action: 'update_user_profile',
            details: { targetUserId: userId, previous: oldValues, updated: updates },
            ipAddress: req.ip
        });

        broadcastUserUpdate(userId, 'user.updated', user);
broadcastContentChange('user', userId, 'updated');
return sendResponse(res, true, 200, 'User profile updated successfully.', user);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Suspend/Activate User
const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;
        const adminId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, false, 404, 'User not found.');
        }

        user.isActive = isActive;
        await user.save();

        // Audit Log
        await AuditLog.create({
            userId: adminId,
            action: isActive ? 'activate_user' : 'suspend_user',
            details: { targetUserId: userId, email: user.email },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, `User has been ${isActive ? 'activated' : 'suspended'} successfully.`);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Soft delete user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, false, 404, 'User not found.');
        }

        user.isDeleted = true;
        user.deletedAt = new Date();
        await user.save();

        // Audit Log
        await AuditLog.create({
            userId: adminId,
            action: 'delete_user',
            details: { targetUserId: userId, email: user.email },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'User soft-deleted successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Force Logout (Clear device login)
const forceLogoutUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, false, 404, 'User not found.');
        }

        user.currentDeviceId = null;
        await user.save();

        // Audit Log
        await AuditLog.create({
            userId: adminId,
            action: 'force_logout_user',
            details: { targetUserId: userId, email: user.email },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'User device session cleared successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 3. Subscription & Payments Management
const getPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const payments = await SubscriptionHistory.find()
            .populate('userId', 'firstName lastName email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const totalPayments = await SubscriptionHistory.countDocuments();

        return sendResponse(res, true, 200, 'Subscription histories retrieved.', {
            payments,
            totalPages: Math.ceil(totalPayments / limit),
            currentPage: page,
            totalPayments
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Manual Subscriptions Allocation
const manualSubscribe = async (req, res) => {
    try {
        const { userId, planId, validityDays } = req.body;
        const adminId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, false, 404, 'User not found.');
        }

        let planDetails = { name: "Manual Administration Premium Plan", validity: validityDays || 30, price: 0 };
        if (planId) {
            const plan = await Subscription.findById(planId);
            if (plan) {
                planDetails = plan.toObject();
            }
        }

        user.isPremium = true;
        user.premiumPurchaseDate = new Date();
        user.trialEndDate = new Date(Date.now() + planDetails.validity * 24 * 60 * 60 * 1000);
        await user.save();

        // Record in subscription history
        await SubscriptionHistory.create({
            userId: user._id,
            plan: planDetails,
            purchasedDate: new Date(),
            isActive: true
        });

        // Audit Log
        await AuditLog.create({
            userId: adminId,
            action: 'manual_subscription_grant',
            details: { targetUserId: userId, plan: planDetails },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Premium plan allocated manually successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Subscription Plans Management for Admin
const getAllSubscriptionPlans = async (req, res) => {
    try {
        const plans = await Subscription.find({}).sort({ price: 1 }).lean();
        return sendResponse(res, true, 200, 'Subscription plans fetched.', plans);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const updateSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;
        
        const plan = await Subscription.findByIdAndUpdate(id, updateFields, { new: true });
        if (!plan) {
            return sendResponse(res, false, 404, 'Subscription plan not found.');
        }

        // Log audit event
        await AuditLog.create({
            userId: req.userId,
            action: 'update_subscription_plan',
            details: { planId: id, updatedFields: updateFields },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Subscription plan updated successfully.', plan);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const createSubscriptionPlan = async (req, res) => {
    try {
        const planData = req.body;
        const plan = await Subscription.create(planData);

        await AuditLog.create({
            userId: req.userId,
            action: 'create_subscription_plan',
            details: { planId: plan._id, planData },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Subscription plan created successfully.', plan);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Cancel Subscription
const cancelSubscription = async (req, res) => {
    try {
        const { userId } = req.body;
        const adminId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, false, 404, 'User not found.');
        }

        user.isPremium = false;
        await user.save();

        // Mark active histories as inactive
        await SubscriptionHistory.updateMany({ userId, isActive: true }, { isActive: false });

        // Audit Log
        await AuditLog.create({
            userId: adminId,
            action: 'manual_subscription_cancel',
            details: { targetUserId: userId, email: user.email },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Premium subscription canceled successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 4. Law Book Import & Upload
const uploadBook = async (req, res) => {
    try {
        if (!req.file) {
            return sendResponse(res, false, 400, 'No file uploaded.');
        }

        const fileContent = req.file.buffer.toString();
        let parsedData;
        try {
            parsedData = JSON.parse(fileContent);
        } catch (jsonErr) {
            return sendResponse(res, false, 400, 'Invalid JSON file format.');
        }

        // Basic structural validation
        if (!parsedData.name || !parsedData.categoryId || !Array.isArray(parsedData.section)) {
            return sendResponse(res, false, 400, 'Invalid legal book JSON schema. Must include name, categoryId, and section array.');
        }

        // Detect potential duplicate section numbers/names
        const sectionNames = parsedData.section.map(s => s.name);
        const duplicates = sectionNames.filter((name, index) => sectionNames.indexOf(name) !== index);

        const preview = {
            name: parsedData.name,
            categoryId: parsedData.categoryId,
            sectionsCount: parsedData.section.length,
            duplicates: [...new Set(duplicates)],
            firstSectionPreview: parsedData.section[0] || null
        };

        return sendResponse(res, true, 200, 'Book file uploaded and validated successfully.', {
            preview,
            rawBookData: parsedData
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const importBook = async (req, res) => {
    try {
        const { bookData } = req.body;
        const adminId = req.userId;

        if (!bookData || !bookData.name || !bookData.categoryId || !Array.isArray(bookData.section)) {
            return sendResponse(res, false, 400, 'Missing or invalid book import data payload.');
        }

        // Save imported book into database
        const newBook = await Casebook.create({
            name: bookData.name,
            categoryId: bookData.categoryId,
            section: bookData.section,
            isActive: true
        });

        // Audit Log
        await AuditLog.create({
            userId: adminId,
            action: 'import_law_book',
            details: { bookId: newBook._id, name: newBook.name, categoryId: newBook.categoryId, sectionsCount: newBook.section.length },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 201, 'Book imported successfully.', { bookId: newBook._id, name: newBook.name });
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 5. Offers Management
const getOffers = async (req, res) => {
    try {
        const offers = await Offer.find().sort({ createdAt: -1 }).lean();
        return sendResponse(res, true, 200, 'Offers list retrieved.', offers);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const createOffer = async (req, res) => {
    try {
        const { title, description, discountType, discountValue, offerType, bannerImage, startDate, endDate } = req.body;
        const adminId = req.userId;

        const newOffer = await Offer.create({
            title, description, discountType, discountValue, offerType, bannerImage, startDate, endDate
        });

        await AuditLog.create({
            userId: adminId,
            action: 'create_offer',
            details: { offerId: newOffer._id, title: newOffer.title },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 201, 'Promo offer created successfully.', newOffer);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.userId;

        await Offer.findByIdAndDelete(id);

        await AuditLog.create({
            userId: adminId,
            action: 'delete_offer',
            details: { offerId: id },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Offer deleted successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 6. Promo Codes Management
const getPromoCodes = async (req, res) => {
    try {
        const codes = await PromoCode.find().sort({ createdAt: -1 }).lean();
        return sendResponse(res, true, 200, 'Promo codes list retrieved.', codes);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const createPromoCode = async (req, res) => {
    try {
        const { code, discountType, discountValue, expiryDate, usageLimit, minPurchaseAmount, maxDiscountAmount, restrictUserType } = req.body;
        const adminId = req.userId;

        const newPromo = await PromoCode.create({
            code, discountType, discountValue, expiryDate, usageLimit, minPurchaseAmount, maxDiscountAmount, restrictUserType
        });

        await AuditLog.create({
            userId: adminId,
            action: 'create_promo_code',
            details: { promoId: newPromo._id, code: newPromo.code },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 201, 'Promo code created successfully.', newPromo);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const deletePromoCode = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.userId;

        await PromoCode.findByIdAndDelete(id);

        await AuditLog.create({
            userId: adminId,
            action: 'delete_promo_code',
            details: { promoId: id },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Promo code deleted successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 7. Push Notifications Management
const sendPushNotification = async (req, res) => {
    try {
        const { title, message, targetGroup, targetUserId, notificationType, isPopup, buttonText, actionUrl, scheduledAt } = req.body;
        const adminId = req.userId;

        let deliveryCount = 0;
        if (targetGroup === 'all') {
            deliveryCount = await User.countDocuments({ isDeleted: { $ne: true } });
        } else if (targetGroup === 'premium') {
            deliveryCount = await User.countDocuments({ isPremium: true, isDeleted: { $ne: true } });
        } else if (targetGroup === 'trial') {
            deliveryCount = await User.countDocuments({ isTrialUsed: false, isPremium: false, isDeleted: { $ne: true } });
        } else if (targetGroup === 'expired') {
            deliveryCount = await User.countDocuments({ isPremium: false, isTrialUsed: true, isDeleted: { $ne: true } });
        } else if (targetUserId) {
            deliveryCount = 1;
        }

        const isFutureSchedule = scheduledAt && new Date(scheduledAt).getTime() > Date.now();
        const notification = await PushNotification.create({
            title,
            message,
            targetGroup,
            targetUserId: targetUserId || null,
            status: isFutureSchedule ? 'scheduled' : 'sent',
            scheduledAt: isFutureSchedule ? new Date(scheduledAt) : new Date(),
            sentAt: isFutureSchedule ? null : new Date(),
            notificationType: notificationType || 'general',
            deliveryCount,
            isPopup: isPopup === true || isPopup === 'true',
            buttonText: buttonText || 'Dismiss',
            actionUrl: actionUrl || ''
        });

        // Trigger real FCM system notification banner delivery if not scheduled in future
        if (!isFutureSchedule) {
            const fcmService = require('../../services/fcm.service');
            fcmService.sendFcmPushToTokens({
                title,
                message,
                targetGroup,
                targetUserId,
                dataPayload: {
                    notificationType: notificationType || 'general',
                    actionUrl: actionUrl || ''
                }
            }).catch(err => console.log('Background FCM Broadcast Error:', err?.message));
        }

        await AuditLog.create({
            userId: adminId,
            action: isFutureSchedule ? 'schedule_push_notification' : 'send_push_notification',
            details: { notificationId: notification._id, title, targetGroup, scheduledAt: notification.scheduledAt },
            ipAddress: req.ip
        });

        const successMessage = isFutureSchedule 
            ? 'Push notification scheduled successfully.' 
            : 'Push notification broadcast triggered and system banners sent successfully.';

        return sendResponse(res, true, 201, successMessage, notification);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const getNotificationLogs = async (req, res) => {
    try {
        const logs = await PushNotification.find().sort({ createdAt: -1 }).lean();
        return sendResponse(res, true, 200, 'Notification delivery logs retrieved.', logs);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const updatePushNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const adminId = req.userId;

        const updatedNot = await PushNotification.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedNot) {
            return sendResponse(res, false, 404, 'Notification not found.');
        }

        await AuditLog.create({
            userId: adminId,
            action: 'update_push_notification',
            details: { notificationId: id, updates },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Notification updated successfully.', updatedNot);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const deletePushNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.userId;

        const deleted = await PushNotification.findByIdAndDelete(id);
        if (!deleted) {
            return sendResponse(res, false, 404, 'Notification not found.');
        }

        await AuditLog.create({
            userId: adminId,
            action: 'delete_push_notification',
            details: { notificationId: id },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Notification deleted successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 8. Application Settings Management
const getSettings = async (req, res) => {
    try {
        let setting = await Settings.findOne();
        if (!setting) {
            setting = await Settings.create({ email: 'admin@lawapp.com', phoneNumber: '9876543210' });
        }
        return sendResponse(res, true, 200, 'Application configuration loaded.', setting);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        const adminId = req.userId;

        let setting = await Settings.findOne();
        if (!setting) {
            setting = new Settings();
        }

        if (updates.email) setting.email = updates.email;
        if (updates.phoneNumber) setting.phoneNumber = updates.phoneNumber;
        if (updates.isActive !== undefined) setting.isActive = updates.isActive;

        await setting.save();

        await AuditLog.create({
            userId: adminId,
            action: 'update_app_settings',
            details: updates,
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Application configurations saved successfully.', setting);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 9. Audit Logging (Paginated)
const getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const logs = await AuditLog.find()
            .populate('userId', 'firstName lastName email role')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const totalLogs = await AuditLog.countDocuments();

        return sendResponse(res, true, 200, 'Audit logs list retrieved.', {
            logs,
            totalPages: Math.ceil(totalLogs / limit),
            currentPage: page,
            totalLogs
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 10. Content Management CRUD
const createCategory = async (req, res) => {
    try {
        const { name, type, act, parentId, image } = req.body;
        const adminId = req.userId;
        const newCat = await Category.create({ name, type, act, parentId, image });
        
        await AuditLog.create({
            userId: adminId,
            action: 'create_category',
            details: { categoryId: newCat._id, name: newCat.name },
            ipAddress: req.ip
        });
        return sendResponse(res, true, 201, 'Category created successfully.', newCat);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const adminId = req.userId;
        const updatedCat = await Category.findByIdAndUpdate(id, updates, { new: true });
        
        await AuditLog.create({
            userId: adminId,
            action: 'update_category',
            details: { categoryId: id, updates },
            ipAddress: req.ip
        });
        return sendResponse(res, true, 200, 'Category updated successfully.', updatedCat);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.userId;
        await Category.findByIdAndDelete(id);
        
        await AuditLog.create({
            userId: adminId,
            action: 'delete_category',
            details: { categoryId: id },
            ipAddress: req.ip
        });
        return sendResponse(res, true, 200, 'Category deleted successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

const createChapter = async (req, res) => {
    try {
        const { name, categoryId } = req.body;
        const adminId = req.userId;
        const newChapter = await Casebook.create({ name, categoryId, section: [], isActive: true });
        
        await AuditLog.create({
            userId: adminId,
            action: 'create_chapter',
            details: { chapterId: newChapter._id, name: newChapter.name },
            ipAddress: req.ip
        });
        return sendResponse(res, true, 201, 'Chapter created successfully.', newChapter);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const updateChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const adminId = req.userId;
        const updatedChapter = await Casebook.findByIdAndUpdate(id, updates, { new: true });
        
        await AuditLog.create({
            userId: adminId,
            action: 'update_chapter',
            details: { chapterId: id, updates },
            ipAddress: req.ip
        });
        return sendResponse(res, true, 200, 'Chapter updated successfully.', updatedChapter);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const deleteChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.userId;
        await Casebook.findByIdAndDelete(id);
        
        await AuditLog.create({
            userId: adminId,
            action: 'delete_chapter',
            details: { chapterId: id },
            ipAddress: req.ip
        });
        return sendResponse(res, true, 200, 'Chapter deleted successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

const linkSections = async (chapter, sec) => {
    try {
        if (!sec.oldversion) return;
        const Category = require('../../models/category');
        const Casebook = require('../../models/casebookmaster');
        
        const currentCategory = await Category.findById(chapter.categoryId);
        if (!currentCategory) return;
        
        const categories = await Category.find().lean();
        let oppositeCategory = null;
        const curName = currentCategory.name.toLowerCase();
        
        if (curName.includes("nyaya") || curName.includes("bns") || curName.includes("nayaya")) {
            oppositeCategory = categories.find(c => c.name.toLowerCase().includes("penal") || c.name.toLowerCase().includes("ipc"));
        } else if (curName.includes("penal") || curName.includes("ipc")) {
            oppositeCategory = categories.find(c => c.name.toLowerCase().includes("nyaya") || c.name.toLowerCase().includes("bns") || c.name.toLowerCase().includes("nayaya"));
        } else if (curName.includes("nagarik") || curName.includes("bnss")) {
            oppositeCategory = categories.find(c => c.name.toLowerCase().includes("procedure") || c.name.toLowerCase().includes("crpc"));
        } else if (curName.includes("procedure") || curName.includes("crpc")) {
            oppositeCategory = categories.find(c => c.name.toLowerCase().includes("nagarik") || c.name.toLowerCase().includes("bnss"));
        } else if (curName.includes("sakshya") || curName.includes("bsa")) {
            oppositeCategory = categories.find(c => c.name.toLowerCase().includes("evidence") || c.name.toLowerCase().includes("iea"));
        } else if (curName.includes("evidence") || curName.includes("iea")) {
            oppositeCategory = categories.find(c => c.name.toLowerCase().includes("sakshya") || c.name.toLowerCase().includes("bsa"));
        }
        
        if (oppositeCategory) {
            const oppositeChapters = await Casebook.find({ categoryId: oppositeCategory._id });
            for (const oppositeChap of oppositeChapters) {
                const matchedSec = oppositeChap.section.find(s => String(s.name).trim() === String(sec.oldversion).trim());
                if (matchedSec) {
                    sec.sectionId = matchedSec._id.toString();
                    
                    matchedSec.sectionId = sec._id.toString();
                    matchedSec.oldversion = sec.name;
                    await oppositeChap.save();
                    break;
                }
            }
        }
    } catch (e) {
        console.error("Error linking sections:", e);
    }
};

const unlinkSection = async (sectionId) => {
    try {
        const Casebook = require('../../models/casebookmaster');
        const matchedChap = await Casebook.findOne({ 'section.sectionId': sectionId.toString() });
        if (matchedChap) {
            const sec = matchedChap.section.find(s => s.sectionId === sectionId.toString());
            if (sec) {
                sec.sectionId = '';
                await matchedChap.save();
            }
        }
    } catch (e) {
        console.error("Error unlinking section:", e);
    }
};

const createSection = async (req, res) => {
    try {
        const { chapterId, name, keyword, oldversion, sectionId, contentText } = req.body;
        const adminId = req.userId;
        
        const chapter = await Casebook.findById(chapterId);
        if (!chapter) {
            return sendResponse(res, false, 404, 'Chapter not found.');
        }

        const newSec = {
            name,
            keyword,
            oldversion,
            sectionId: sectionId || '',
            content: [{ content: contentText || 'No content available', page: 1 }]
        };

        chapter.section.push(newSec);
        const addedSec = chapter.section[chapter.section.length - 1];
        await linkSections(chapter, addedSec);
        await chapter.save();

        await AuditLog.create({
            userId: adminId,
            action: 'create_section',
            details: { chapterId, sectionName: name },
            ipAddress: req.ip
        });
        return sendResponse(res, true, 201, 'Section added successfully.', chapter);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const updateSection = async (req, res) => {
    try {
        const { chapterId, sectionId } = req.params;
        const { name, keyword, oldversion, contentText } = req.body;
        const adminId = req.userId;

        const chapter = await Casebook.findById(chapterId);
        if (!chapter) {
            return sendResponse(res, false, 404, 'Chapter not found.');
        }

        const sec = chapter.section.id(sectionId);
        if (!sec) {
            return sendResponse(res, false, 404, 'Section not found.');
        }

        if (name !== undefined) sec.name = name;
        if (keyword !== undefined) sec.keyword = keyword;
        if (oldversion !== undefined) {
            sec.oldversion = oldversion;
            await linkSections(chapter, sec);
        }
        if (contentText !== undefined) {
            sec.content = [{ content: contentText, page: 1 }];
        }

        await chapter.save();

        await AuditLog.create({
            userId: adminId,
            action: 'update_section',
            details: { chapterId, sectionId, updates: { name, keyword, oldversion } },
            ipAddress: req.ip
        });
        return sendResponse(res, true, 200, 'Section updated successfully.', chapter);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const uploadBookImport = async (req, res) => {
    try {
        if (!req.file) {
            return sendResponse(res, false, 400, 'No file uploaded.');
        }

        const { categoryId, bookName } = req.body;
        if (!categoryId || !bookName) {
            return sendResponse(res, false, 400, 'Missing categoryId or bookName.');
        }

        const adminId = req.userId;

        const job = await BookImport.create({
            bookName,
            categoryId,
            originalFileName: req.file.originalname,
            status: 'pending',
            progress: 10,
            uploadedBy: adminId
        });

        // Trigger processing in background
        bookImportService.runParsingJob(job._id, req.file.buffer, req.file.originalname);

        return sendResponse(res, true, 201, 'Book upload started successfully.', { jobId: job._id });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const getImportJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await BookImport.findById(jobId).lean();
        if (!job) {
            return sendResponse(res, false, 404, 'Import job not found.');
        }
        return sendResponse(res, true, 200, 'Job status retrieved.', job);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const editImportJobData = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { extractedJson } = req.body;

        const job = await BookImport.findById(jobId);
        if (!job) {
            return sendResponse(res, false, 404, 'Import job not found.');
        }

        job.extractedJson = extractedJson;
        job.validationReport = bookImportService.validateImportJson(extractedJson);
        await job.save();

        return sendResponse(res, true, 200, 'Extracted data updated and re-validated.', job);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const publishImportJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { changelog } = req.body;
        const adminId = req.userId;

        const job = await BookImport.findById(jobId);
        if (!job) {
            return sendResponse(res, false, 404, 'Import job not found.');
        }

        if (!job.extractedJson) {
            return sendResponse(res, false, 400, 'Cannot publish job with empty extracted data.');
        }

        const data = job.extractedJson;
        const existingCasebooks = await Casebook.find({ categoryId: job.categoryId }).lean();
        
        const backupVersion = job.version;
        job.rollbackHistory.push({
            version: backupVersion,
            restoredBy: adminId,
            backupCasebook: existingCasebooks
        });

        // 1. Delete all existing chapters
        await Casebook.deleteMany({ categoryId: job.categoryId });

        // 2. Insert new chapters
        const createdCasebooks = [];
        if (data.chapters && data.chapters.length > 0) {
            for (const chap of data.chapters) {
                const mappedSections = (chap.sections || []).map(sec => ({
                    name: sec.sectionNo || '',
                    keyword: sec.title || 'General Section',
                    oldversion: sec.oldversion || '',
                    sectionId: sec.sectionId || '',
                    content: [{ content: sec.content || 'No content available', page: 1 }]
                }));

                const newChap = await Casebook.create({
                    name: `CHAPTER ${chap.chapterNo} - ${chap.chapterTitle}`.toUpperCase(),
                    categoryId: job.categoryId,
                    section: mappedSections,
                    isActive: true
                });
                createdCasebooks.push(newChap);
            }
        }

        // 3. Save First & Second schedules if present in parsed JSON
        if (data.firstSchedule && data.firstSchedule.length > 0) {
            await FirstSchedule.deleteMany({ categoryId: job.categoryId });
            const preparedFirst = data.firstSchedule.map(entry => ({
                categoryId: job.categoryId,
                Section: entry.Section || entry.section || "",
                Offence: entry.Offence || entry.offence || "",
                Punishment: entry.Punishment || entry.punishment || "",
                'Cognizable or Non- cognizable': entry['Cognizable or Non- cognizable'] || entry.Cognizable || "",
                'Bailable or Non- bailable': entry['Bailable or Non- bailable'] || entry.Bailable || "",
                'By what Court triable': entry['By what Court triable'] || entry.Court || ""
            }));
            await FirstSchedule.insertMany(preparedFirst);
        }

        if (data.secondSchedule && data.secondSchedule.length > 0) {
            await SecondSchedule.deleteMany({ categoryId: job.categoryId });
            const preparedSecond = data.secondSchedule.map(entry => ({
                categoryId: job.categoryId,
                formNo: entry.formNo || "",
                title: entry.title || "",
                content: entry.content || ""
            }));
            await SecondSchedule.insertMany(preparedSecond);
        }

        // Increment version on Category to force incremental sync on the mobile app
        const category = await Category.findById(job.categoryId);
        if (category) {
            category.updatedAt = new Date();
            await category.save();
        }

        job.status = 'imported';
        job.progress = 100;
        job.version = backupVersion + 1;
        job.changelog = changelog || 'Initial AI Import';
        await job.save();

        await AuditLog.create({
            userId: adminId,
            action: 'publish_ai_import',
            details: { jobId, categoryId: job.categoryId, bookName: job.bookName, version: job.version },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Book published successfully.', {
            version: job.version,
            chaptersImportedCount: createdCasebooks.length
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const getVersionHistory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const history = await BookImport.find({ categoryId, status: 'imported' })
            .select('bookName version changelog updatedAt uploadedBy')
            .populate('uploadedBy', 'firstName lastName email')
            .sort({ updatedAt: -1 })
            .lean();

        return sendResponse(res, true, 200, 'Version history retrieved.', history);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const rollbackVersion = async (req, res) => {
    try {
        const { jobId } = req.params;
        const adminId = req.userId;

        const job = await BookImport.findById(jobId);
        if (!job) {
            return sendResponse(res, false, 404, 'Import job not found.');
        }

        const latestRollback = job.rollbackHistory[job.rollbackHistory.length - 1];
        if (!latestRollback || !latestRollback.backupCasebook || latestRollback.backupCasebook.length === 0) {
            return sendResponse(res, false, 400, 'No valid rollback backup exists for this version.');
        }

        await Casebook.deleteMany({ categoryId: job.categoryId });
        await Casebook.insertMany(latestRollback.backupCasebook);

        const category = await Category.findById(job.categoryId);
        if (category) {
            category.updatedAt = new Date();
            await category.save();
        }

        await AuditLog.create({
            userId: adminId,
            action: 'rollback_version',
            details: { jobId, categoryId: job.categoryId, restoredVersion: latestRollback.version },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Rollback executed successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

const exportCategoryContent = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await Category.findById(categoryId);
        if (!category) {
            return sendResponse(res, false, 404, 'Category not found.');
        }

        const chapters = await Casebook.find({ categoryId }).sort({ createdAt: 1 }).lean();
        
        const mappedChapters = chapters.map(chap => {
            // Extract chapter number and title
            const match = (chap.name || '').match(/^\s*CHAPTER\s+([IVXLCDM\d]+)\s*[:-]?\s*(.*)/i);
            const chapterNo = match ? match[1] : 'I';
            const chapterTitle = match ? match[2] : (chap.name || 'Untitled');

            const sections = (chap.section || []).map(sec => ({
                sectionNo: sec.name || '',
                title: sec.keyword || '',
                oldversion: sec.oldversion || '',
                sectionId: sec.sectionId || '',
                content: sec.content && sec.content.length > 0 ? sec.content[0].content : ''
            }));

            return {
                chapterNo,
                chapterTitle,
                sections
            };
        });

        const firstEntries = await FirstSchedule.find({ categoryId }).lean();
        const secondEntries = await SecondSchedule.find({ categoryId }).lean();

        let activeJobId = null;
        const latestJob = await BookImport.findOne({ categoryId }).sort({ createdAt: -1 });
        if (latestJob) {
            activeJobId = latestJob._id;
        } else {
            const dummyJob = await BookImport.create({
                bookName: category.name,
                categoryId,
                originalFileName: 'Database Export.json',
                status: 'imported',
                progress: 100,
                version: 1,
                uploadedBy: req.userId
            });
            activeJobId = dummyJob._id;
        }

        return sendResponse(res, true, 200, 'Category content exported successfully.', {
            jobId: activeJobId,
            extractedJson: {
                actName: category.name,
                shortName: category.name.substring(0, 4).toUpperCase(),
                year: 2023,
                chapters: mappedChapters,
                firstSchedule: firstEntries,
                secondSchedule: secondEntries
            }
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const publishExistingContent = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { extractedJson, changelog } = req.body;
        const adminId = req.userId;

        const category = await Category.findById(categoryId);
        if (!category) {
            return sendResponse(res, false, 404, 'Category not found.');
        }

        const existingCasebooks = await Casebook.find({ categoryId }).lean();

        let job = await BookImport.findOne({ categoryId }).sort({ createdAt: -1 });
        if (!job) {
            job = await BookImport.create({
                bookName: category.name,
                categoryId,
                originalFileName: 'Database Export.json',
                status: 'imported',
                progress: 100,
                version: 1,
                uploadedBy: adminId
            });
        }

        const backupVersion = job.version || 1;
        job.rollbackHistory.push({
            version: backupVersion,
            restoredBy: adminId,
            backupCasebook: existingCasebooks
        });

        // 1. Delete all existing chapters
        await Casebook.deleteMany({ categoryId });

        // 2. Insert new chapters
        if (extractedJson && extractedJson.chapters && extractedJson.chapters.length > 0) {
            for (const chap of extractedJson.chapters) {
                const mappedSections = (chap.sections || []).map(sec => ({
                    name: sec.sectionNo || '',
                    keyword: sec.title || 'General Section',
                    oldversion: sec.oldversion || '',
                    sectionId: sec.sectionId || '',
                    content: [{ content: sec.content || 'No content available', page: 1 }]
                }));

                await Casebook.create({
                    name: `CHAPTER ${chap.chapterNo} - ${chap.chapterTitle}`.toUpperCase(),
                    categoryId,
                    section: mappedSections,
                    isActive: true
                });
            }
        }

        // 3. Save First & Second schedules if present in parsed JSON
        if (extractedJson && extractedJson.firstSchedule && extractedJson.firstSchedule.length > 0) {
            await FirstSchedule.deleteMany({ categoryId });
            const preparedFirst = extractedJson.firstSchedule.map(entry => ({
                categoryId,
                Section: entry.Section || entry.section || "",
                Offence: entry.Offence || entry.offence || "",
                Punishment: entry.Punishment || entry.punishment || "",
                'Cognizable or Non- cognizable': entry['Cognizable or Non- cognizable'] || entry.Cognizable || "",
                'Bailable or Non- bailable': entry['Bailable or Non- bailable'] || entry.Bailable || "",
                'By what Court triable': entry['By what Court triable'] || entry.Court || ""
            }));
            await FirstSchedule.insertMany(preparedFirst);
        }

        if (extractedJson && extractedJson.secondSchedule && extractedJson.secondSchedule.length > 0) {
            await SecondSchedule.deleteMany({ categoryId });
            const preparedSecond = extractedJson.secondSchedule.map(entry => ({
                categoryId,
                formNo: entry.formNo || "",
                title: entry.title || "",
                content: entry.content || ""
            }));
            await SecondSchedule.insertMany(preparedSecond);
        }

        category.updatedAt = new Date();
        await category.save();

        job.status = 'imported';
        job.progress = 100;
        job.version = backupVersion + 1;
        job.changelog = changelog || 'Manual Existing Book Edit';
        job.extractedJson = extractedJson;
        await job.save();

        await AuditLog.create({
            userId: adminId,
            action: 'publish_existing_content_edit',
            details: { categoryId, bookName: category.name, version: job.version },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Existing book updated successfully.', { jobId: job._id });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const deleteSection = async (req, res) => {
    try {
        const { chapterId, sectionId } = req.params;
        const adminId = req.userId;

        const chapter = await Casebook.findById(chapterId);
        if (!chapter) {
            return sendResponse(res, false, 404, 'Chapter not found.');
        }

        await unlinkSection(sectionId);
        chapter.section.pull({ _id: sectionId });
        await chapter.save();

        await AuditLog.create({
            userId: adminId,
            action: 'delete_section',
            details: { chapterId, sectionId },
            ipAddress: req.ip
        });
        return sendResponse(res, true, 200, 'Section deleted successfully.', chapter);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Helper to parse HTML table to structured offence rows
// Only processes <tbody> rows so <thead> headers are automatically skipped
const parseHtmlTableToOffences = (html) => {
    const rows = [];
    if (!html) return rows;

    // Extract tbody content only (skip thead headers entirely)
    const tbodyRegex = /<tbody[^>]*>([\s\S]*?)<\/tbody>/gi;
    let tbodyMatch;
    let tbodyHtml = '';

    while ((tbodyMatch = tbodyRegex.exec(html)) !== null) {
        tbodyHtml += tbodyMatch[1];
    }

    // Fallback: if no tbody, treat all tr rows (skip the first header row)
    if (!tbodyHtml) {
        const fullTrRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
        const allRows = html.match(fullTrRegex) || [];
        // Skip the first row as it's likely the header
        tbodyHtml = allRows.slice(1).join('');
    }

    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;

    while ((trMatch = trRegex.exec(tbodyHtml)) !== null) {
        const trContent = trMatch[1];
        const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        let tdMatch;
        const cols = [];

        while ((tdMatch = tdRegex.exec(trContent)) !== null) {
            let cellText = tdMatch[1]
                .replace(/<br\s*\/?>/gi, ' ')
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/\s+/g, ' ')
                .trim();
            cols.push(cellText);
        }

        // Only save rows that have at least 2 non-empty cells
        const nonEmpty = cols.filter(c => c.length > 0);
        if (nonEmpty.length >= 2) {
            rows.push({
                Section: cols[0] || "",
                Offence: cols[1] || "",
                Punishment: cols[2] || "",
                'Cognizable or Non- cognizable': cols[3] || "Cognizable",
                'Bailable or Non- bailable': cols[4] || "Bailable",
                'By what Court triable': cols[5] || "Any Magistrate"
            });
        }
    }

    return rows;
};

// Helper to parse HTML document into Second Schedule Forms list
const parseHtmlToForms = (html) => {
    const forms = [];
    if (!html) return forms;

    const formHeadersRegex = /(?:<h[1-6][^>]*>|<p[^>]*>(?:<strong>|<b>)?)\s*FORM\s+No\.\s*(\d+[A-Z]?)(?:\s*(?:<\/strong>|<\/b>))?\s*(?:<\/h[1-6]>|<\/p>)/gi;
    const matches = [];
    let match;

    while ((match = formHeadersRegex.exec(html)) !== null) {
        matches.push({
            num: match[1],
            index: match.index,
            length: match[0].length
        });
    }

    for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i];
        const nextMatch = matches[i + 1];

        const start = currentMatch.index + currentMatch.length;
        const end = nextMatch ? nextMatch.index : html.length;
        const formHtml = html.substring(start, end).trim();

        const titleRegex = /<(?:h[1-6]|p|div)[^>]*>([\s\S]*?)<\/(?:h[1-6]|p|div)>/i;
        const titleMatch = titleRegex.exec(formHtml);

        let title = "Form Title";
        if (titleMatch) {
            title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
            const remainingHtml = formHtml.substring(titleMatch.index + titleMatch[0].length).trim();
            const nextTagMatch = titleRegex.exec(remainingHtml);
            if (nextTagMatch) {
                const nextText = nextTagMatch[1].replace(/<[^>]*>/g, '').trim();
                if (nextText.toLowerCase().includes('see section') || nextText.startsWith('(')) {
                    title += ` ${nextText}`;
                }
            }
        }

        const cleanContent = formHtml
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\n\s*\n+/g, '\n\n')
            .trim();

        forms.push({
            formNo: `Form ${currentMatch.num}`,
            title: title,
            content: cleanContent
        });
    }

    return forms;
};

const publishFirstSchedule = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { entries, htmlContent } = req.body;
        const adminId = req.userId;

        await FirstSchedule.deleteMany({ categoryId });

        let prepared = [];
        if (htmlContent) {
            // Save raw HTML content to category model and clear PDF copy
            await Category.findByIdAndUpdate(categoryId, { 
                firstScheduleHtml: htmlContent,
                firstSchedulePdfUrl: null 
            });
            
            // Parse HTML to structured offences rows
            prepared = parseHtmlTableToOffences(htmlContent).map(entry => ({
                ...entry,
                categoryId
            }));
        } else if (Array.isArray(entries)) {
            prepared = entries.map(entry => ({
                categoryId,
                Section: entry.Section || entry.section || "",
                Offence: entry.Offence || entry.offence || "",
                Punishment: entry.Punishment || entry.punishment || "",
                'Cognizable or Non- cognizable': entry['Cognizable or Non- cognizable'] || entry.Cognizable || "",
                'Bailable or Non- bailable': entry['Bailable or Non- bailable'] || entry.Bailable || "",
                'By what Court triable': entry['By what Court triable'] || entry.Court || ""
            }));
        }

        let result = [];
        if (prepared.length > 0) {
            result = await FirstSchedule.insertMany(prepared);
        }

        await AuditLog.create({
            userId: adminId,
            action: 'publish_first_schedule',
            details: { categoryId, count: prepared.length, hasHtml: !!htmlContent },
            ipAddress: req.ip
        });

        await Category.findByIdAndUpdate(categoryId, { updatedAt: new Date() });

        return sendResponse(res, true, 200, 'First schedule published successfully.', result);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const publishSecondSchedule = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { entries, htmlContent } = req.body;
        const adminId = req.userId;

        await SecondSchedule.deleteMany({ categoryId });

        let prepared = [];
        if (htmlContent) {
            // Save raw HTML content to category model and clear PDF copy
            await Category.findByIdAndUpdate(categoryId, { 
                secondScheduleHtml: htmlContent,
                secondSchedulePdfUrl: null 
            });
            
            // Parse HTML to structured forms list
            prepared = parseHtmlToForms(htmlContent).map(entry => ({
                ...entry,
                categoryId
            }));
        } else if (Array.isArray(entries)) {
            prepared = entries.map(entry => ({
                categoryId,
                formNo: entry.formNo || "",
                title: entry.title || "",
                content: entry.content || ""
            }));
        }

        let result = [];
        if (prepared.length > 0) {
            result = await SecondSchedule.insertMany(prepared);
        }

        await AuditLog.create({
            userId: adminId,
            action: 'publish_second_schedule',
            details: { categoryId, count: prepared.length, hasHtml: !!htmlContent },
            ipAddress: req.ip
        });

        await Category.findByIdAndUpdate(categoryId, { updatedAt: new Date() });

        return sendResponse(res, true, 200, 'Second schedule published successfully.', result);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Upload an image for use inside schedule WYSIWYG editor
const uploadScheduleImage = async (req, res) => {
    try {
        if (!req.file) {
            return sendResponse(res, false, 400, 'No image file provided.');
        }

        const ext = path.extname(req.file.originalname).toLowerCase();
        const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        if (!allowedExts.includes(ext)) {
            return sendResponse(res, false, 400, 'Invalid image type. Allowed: jpg, jpeg, png, gif, webp, svg.');
        }

        // diskStorage already saved the file — return the public URL
        const imageUrl = `/schedule-images/${req.file.filename}`;
        return sendResponse(res, true, 200, 'Image uploaded successfully.', { url: imageUrl });
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Upload a PDF file for First or Second Schedule
const uploadSchedulePdf = async (req, res) => {
    try {
        if (!req.file) {
            return sendResponse(res, false, 400, 'No PDF file provided.');
        }
        const { categoryId, scheduleType } = req.params; // scheduleType = 'first' | 'second'
        if (!['first', 'second'].includes(scheduleType)) {
            return sendResponse(res, false, 400, 'scheduleType must be "first" or "second".');
        }

        const ext = path.extname(req.file.originalname).toLowerCase();
        if (ext !== '.pdf') {
            return sendResponse(res, false, 400, 'Only PDF files are allowed.');
        }

        // diskStorage saves file automatically — build the public URL
        const pdfUrl = `/schedule-pdfs/${req.file.filename}`;
        const updateField = scheduleType === 'first'
            ? { firstSchedulePdfUrl: pdfUrl }
            : { secondSchedulePdfUrl: pdfUrl };

        await Category.findByIdAndUpdate(categoryId, updateField);

        await AuditLog.create({
            userId: req.userId,
            action: `upload_${scheduleType}_schedule_pdf`,
            details: { categoryId, pdfUrl },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, `${scheduleType === 'first' ? 'First' : 'Second'} Schedule PDF uploaded successfully.`, { url: pdfUrl });
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Clear/Delete a PDF copy for First or Second Schedule
const deleteSchedulePdf = async (req, res) => {
    try {
        const { categoryId, scheduleType } = req.params;
        if (!['first', 'second'].includes(scheduleType)) {
            return sendResponse(res, false, 400, 'scheduleType must be "first" or "second".');
        }

        const updateField = scheduleType === 'first'
            ? { firstSchedulePdfUrl: null }
            : { secondSchedulePdfUrl: null };

        await Category.findByIdAndUpdate(categoryId, updateField);

        await AuditLog.create({
            userId: req.userId,
            action: `delete_${scheduleType}_schedule_pdf`,
            details: { categoryId },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, `${scheduleType === 'first' ? 'First' : 'Second'} Schedule PDF cleared successfully.`);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 18. Criminal Minor Acts Admin Controllers
const parseMinorActFile = async (req, res) => {
    try {
        if (!req.file) {
            return sendResponse(res, false, 400, 'No file uploaded.');
        }

        let text = '';
        const ext = path.extname(req.file.originalname).toLowerCase();

        if (ext === '.pdf') {
            if (!pdfParse) {
                return sendResponse(res, false, 500, 'PDF parser not initialized on server.');
            }
            const pdfData = await pdfParse(req.file.buffer);
            text = pdfData.text;
        } else if (ext === '.txt') {
            text = req.file.buffer.toString('utf8');
        } else {
            return sendResponse(res, false, 400, 'Only .pdf and .txt files are supported.');
        }

        if (!text || text.trim().length === 0) {
            return sendResponse(res, false, 400, 'File content is empty or unreadable.');
        }

        const lines = text.split('\n');
        const sections = [];
        let currentChapter = 'Preliminary';
        let currentSection = null;

        const chapterRegex = /^\s*(CHAPTER|PART)\s+([IVXLCDM\d]+)\s*[:-]?\s*(.*)/i;
        const sectionRegex = /^\s*(?:Section\s+)?(\d+[A-Z]?)\.?\s+(.+)/i;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            const chapMatch = trimmed.match(chapterRegex);
            if (chapMatch) {
                currentChapter = `${chapMatch[1]} ${chapMatch[2]}` + (chapMatch[3] ? `: ${chapMatch[3].trim()}` : '');
                return;
            }

            const secMatch = trimmed.match(sectionRegex);
            if (secMatch) {
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = {
                    chapter: currentChapter,
                    sectionNumber: secMatch[1].trim(),
                    title: secMatch[2].trim().replace(/\.$/, ''),
                    content: ''
                };
                return;
            }

            if (currentSection) {
                currentSection.content += (currentSection.content ? '\n' : '') + trimmed;
            }
        });

        if (currentSection) {
            sections.push(currentSection);
        }

        if (sections.length === 0) {
            return sendResponse(res, false, 422, 'Could not heuristically identify any sections in this document. Please verify the file formatting.');
        }

        return sendResponse(res, true, 200, 'File parsed successfully.', {
            sections,
            fileName: req.file.originalname
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const publishMinorAct = async (req, res) => {
    try {
        const { name, description, sections } = req.body;
        if (!name || !sections || !Array.isArray(sections) || sections.length === 0) {
            return sendResponse(res, false, 400, 'Act name and parsed sections are required.');
        }

        // 1. Create or Update MinorAct
        let act = await MinorAct.findOne({ name });
        if (!act) {
            act = await MinorAct.create({ name, description, isActive: true });
        } else {
            act.description = description;
            act.isActive = true;
            await act.save();
            // Delete old sections if updating
            await MinorActSection.deleteMany({ minorActId: act._id });
        }

        // 2. Insert MinorActSections
        const payload = sections.map(sec => ({
            minorActId: act._id,
            chapter: sec.chapter || 'General Sections',
            sectionNumber: sec.sectionNumber || '1',
            title: sec.title || 'Untitled Section',
            content: sec.content || 'No content available.'
        }));

        await MinorActSection.insertMany(payload);

        await AuditLog.create({
            userId: req.userId,
            action: 'publish_minor_act',
            details: { minorActId: act._id, name, count: payload.length },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Minor Act published successfully.', act);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const getMinorActsList = async (req, res) => {
    try {
        const acts = await MinorAct.find().sort({ order: 1, createdAt: 1 }).lean();
        
        // Populate sections counts
        const enriched = await Promise.all(acts.map(async (act, index) => {
            const count = await MinorActSection.countDocuments({ minorActId: act._id });
            return { ...act, order: act.order || index + 1, sectionCount: count };
        }));

        return sendResponse(res, true, 200, 'Minor Acts list retrieved successfully.', enriched);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const reorderMinorActs = async (req, res) => {
    try {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds)) {
            return sendResponse(res, false, 400, 'orderedIds must be an array of IDs.');
        }

        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { order: index + 1 } }
            }
        }));

        if (bulkOps.length > 0) {
            await MinorAct.bulkWrite(bulkOps);
        }

        await AuditLog.create({
            userId: req.userId,
            action: 'reorder_minor_acts',
            details: { count: orderedIds.length },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Minor Acts re-ordered successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

const deleteMinorAct = async (req, res) => {
    try {
        const { id } = req.params;
        const act = await MinorAct.findByIdAndDelete(id);
        if (!act) {
            return sendResponse(res, false, 404, 'Minor Act not found.');
        }

        await MinorActSection.deleteMany({ minorActId: id });

        await AuditLog.create({
            userId: req.userId,
            action: 'delete_minor_act',
            details: { minorActId: id, name: act.name },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Minor Act and all its sections deleted successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

const uploadMinorActPdf = async (req, res) => {
    try {
        if (!req.file) {
            return sendResponse(res, false, 400, 'No PDF file provided.');
        }

        const { id, name, description } = req.body;
        if (!name) {
            return sendResponse(res, false, 400, 'Minor Act name is required.');
        }

        const pdfUrl = `/uploads/minor-acts/${req.file.filename}`;
        let act;

        if (id) {
            act = await MinorAct.findById(id);
            if (act) {
                // Delete old PDF file if it exists
                if (act.pdfUrl) {
                    const oldPath = path.join(__dirname, '../../../public', act.pdfUrl);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
                act.name = name;
                act.description = description || act.description;
                act.pdfUrl = pdfUrl;
                await act.save();
            }
        }

        if (!act) {
            // Find by name or create
            act = await MinorAct.findOne({ name });
            if (act) {
                if (act.pdfUrl) {
                    const oldPath = path.join(__dirname, '../../../public', act.pdfUrl);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
                act.description = description || act.description;
                act.pdfUrl = pdfUrl;
                await act.save();
            } else {
                act = await MinorAct.create({ name, description, pdfUrl });
            }
        }

        await AuditLog.create({
            userId: req.userId,
            action: 'upload_minor_act_pdf',
            details: { minorActId: act._id, name: act.name, pdfUrl },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Minor Act PDF uploaded successfully.', act);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const clearMinorActPdf = async (req, res) => {
    try {
        const { id } = req.params;
        const act = await MinorAct.findById(id);
        if (!act) {
            return sendResponse(res, false, 404, 'Minor Act not found.');
        }

        if (act.pdfUrl) {
            const filePath = path.join(__dirname, '../../../public', act.pdfUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            act.pdfUrl = null;
            await act.save();
        }

        await AuditLog.create({
            userId: req.userId,
            action: 'clear_minor_act_pdf',
            details: { minorActId: id, name: act.name },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Minor Act PDF cleared successfully.');
    } catch (error) {
        return errorHandler(error, res);
    }
};

const bulkUploadMinorActPdfs = async (req, res) => {
    try {
        let uploadedFiles = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            uploadedFiles = req.files;
        } else if (req.file) {
            uploadedFiles = [req.file];
        }

        if (uploadedFiles.length === 0) {
            return sendResponse(res, false, 400, 'No PDF files received.');
        }

        const results = [];
        let createdCount = 0;
        let updatedCount = 0;

        for (const file of uploadedFiles) {
            const ext = path.extname(file.originalname).toLowerCase();
            if (ext !== '.pdf') continue;

            const baseName = path.basename(file.originalname, ext);
            const actName = baseName.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
            const pdfUrl = `/uploads/minor-acts/${file.filename}`;

            let act = await MinorAct.findOne({ name: { $regex: new RegExp(`^${actName}$`, 'i') } });

            if (act) {
                if (act.pdfUrl && act.pdfUrl !== pdfUrl) {
                    try {
                        const oldPath = path.join(__dirname, '../../../public', act.pdfUrl);
                        if (fs.existsSync(oldPath)) {
                            fs.unlinkSync(oldPath);
                        }
                    } catch (unlinkErr) {
                        console.warn('Could not remove old PDF file:', unlinkErr.message);
                    }
                }
                act.pdfUrl = pdfUrl;
                act.isActive = true;
                await act.save();
                updatedCount++;
                results.push({ name: act.name, action: 'updated', pdfUrl });
            } else {
                const lastAct = await MinorAct.findOne().sort({ order: -1 }).lean();
                const nextOrder = (lastAct && lastAct.order ? lastAct.order : 0) + 1;

                act = await MinorAct.create({
                    name: actName,
                    description: `Official Legal Act - ${actName}`,
                    pdfUrl,
                    order: nextOrder,
                    isActive: true
                });
                createdCount++;
                results.push({ name: act.name, action: 'created', pdfUrl });
            }
        }

        try {
            await AuditLog.create({
                userId: req.userId,
                action: 'bulk_upload_minor_act_pdfs',
                details: { totalFiles: uploadedFiles.length, createdCount, updatedCount },
                ipAddress: req.ip
            });
        } catch (auditErr) {}

        return sendResponse(res, true, 200, `Bulk PDF upload completed. ${createdCount} acts created, ${updatedCount} updated.`, {
            total: results.length,
            createdCount,
            updatedCount,
            results
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const updateMinorAct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, order, isActive } = req.body;

        const act = await MinorAct.findById(id);
        if (!act) {
            return sendResponse(res, false, 404, 'Minor Act not found.');
        }

        if (name !== undefined) act.name = String(name).trim();
        if (description !== undefined) act.description = String(description).trim();
        if (order !== undefined) act.order = parseInt(order, 10);
        if (isActive !== undefined) act.isActive = Boolean(isActive);

        await act.save();

        try {
            await AuditLog.create({
                userId: req.userId,
                action: 'update_minor_act',
                details: { id, name: act.name, description: act.description },
                ipAddress: req.ip
            });
        } catch (e) {}

        return sendResponse(res, true, 200, 'Minor Act updated successfully.', act);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const clearAllMinorActPdfs = async (req, res) => {
    try {
        const acts = await MinorAct.find({ pdfUrl: { $ne: null } });
        let clearedCount = 0;

        for (const act of acts) {
            if (act.pdfUrl) {
                try {
                    const filePath = path.join(__dirname, '../../../public', act.pdfUrl);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (e) {}
                act.pdfUrl = null;
                await act.save();
                clearedCount++;
            }
        }

        try {
            await AuditLog.create({
                userId: req.userId,
                action: 'clear_all_minor_act_pdfs',
                details: { clearedCount },
                ipAddress: req.ip
            });
        } catch (e) {}

        return sendResponse(res, true, 200, `Cleared attached PDF files from ${clearedCount} Minor Acts.`, { clearedCount });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const bulkDeleteAllMinorActs = async (req, res) => {
    try {
        const acts = await MinorAct.find({}).lean();
        let deletedPdfsCount = 0;

        for (const act of acts) {
            if (act.pdfUrl) {
                const filePath = path.join(__dirname, '../../../public', act.pdfUrl);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                        deletedPdfsCount++;
                    } catch (e) {}
                }
            }
        }

        await MinorAct.deleteMany({});
        await MinorActSection.deleteMany({});

        try {
            await AuditLog.create({
                userId: req.userId,
                action: 'bulk_delete_all_minor_acts',
                details: { totalActsDeleted: acts.length, deletedPdfsCount },
                ipAddress: req.ip
            });
        } catch (e) {}

        return sendResponse(res, true, 200, `Successfully deleted all ${acts.length} Minor Acts and removed PDF files.`, {
            actsDeleted: acts.length,
            deletedPdfsCount
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const defaultSignupFields = [
    { fieldKey: 'firstName', label: 'First Name', fieldType: 'text', isRequired: true, isEnabled: true, order: 1, placeholder: 'Enter first name' },
    { fieldKey: 'lastName', label: 'Last Name', fieldType: 'text', isRequired: true, isEnabled: true, order: 2, placeholder: 'Enter last name' },
    { fieldKey: 'email', label: 'Email Address', fieldType: 'email', isRequired: true, isEnabled: true, order: 3, placeholder: 'Enter email address' },
    { fieldKey: 'phoneNumber', label: 'Phone Number', fieldType: 'number', isRequired: true, isEnabled: true, order: 4, placeholder: 'Enter 10-digit mobile number' },
    { fieldKey: 'password', label: 'Password', fieldType: 'text', isRequired: true, isEnabled: true, order: 5, placeholder: 'Enter password' },
    { fieldKey: 'professionId', label: 'Profession', fieldType: 'select', isRequired: false, isEnabled: true, order: 6, placeholder: 'Select profession' },
    { fieldKey: 'state', label: 'State', fieldType: 'text', isRequired: false, isEnabled: true, order: 7, placeholder: 'Enter state' },
    { fieldKey: 'city', label: 'City', fieldType: 'text', isRequired: false, isEnabled: true, order: 8, placeholder: 'Enter city' },
    { fieldKey: 'barCouncilNumber', label: 'Bar Council ID / Reg No.', fieldType: 'text', isRequired: false, isEnabled: true, order: 9, placeholder: 'Enter Bar Council Roll No.' },
];

const getSignupConfig = async (req, res) => {
    try {
        let configs = await SignupConfig.find().sort({ order: 1 });
        if (!configs || configs.length === 0) {
            // Seed defaults
            await SignupConfig.insertMany(defaultSignupFields);
            configs = await SignupConfig.find().sort({ order: 1 });
        }
        return sendResponse(res, true, 200, 'Signup form configuration retrieved.', configs);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const updateSignupConfig = async (req, res) => {
    try {
        const { fields } = req.body;
        if (!Array.isArray(fields)) {
            return sendResponse(res, false, 400, 'Fields must be an array.');
        }

        for (let i = 0; i < fields.length; i++) {
            const item = fields[i];
            if (!item.fieldKey || !item.label) continue;
            await SignupConfig.findOneAndUpdate(
                { fieldKey: item.fieldKey },
                {
                    label: item.label,
                    fieldType: item.fieldType || 'text',
                    isRequired: Boolean(item.isRequired),
                    isEnabled: Boolean(item.isEnabled),
                    options: item.options || [],
                    order: i + 1,
                    placeholder: item.placeholder || ''
                },
                { upsert: true, new: true }
            );
        }

        const updated = await SignupConfig.find().sort({ order: 1 });

        await AuditLog.create({
            userId: req.userId,
            action: 'update_signup_config',
            details: { count: updated.length },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Signup form configuration saved successfully.', updated);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const getAdminQueries = async (req, res) => {
    try {
        const { status, search } = req.query;
        let filter = {};
        if (status && status !== 'All') {
            filter.status = status;
        }
        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { userEmail: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { question: { $regex: search, $options: 'i' } }
            ];
        }

        const queries = await UserQuery.find(filter).sort({ createdAt: -1 });
        const pendingCount = await UserQuery.countDocuments({ status: 'Pending' });

        return sendResponse(res, true, 200, 'User queries retrieved.', { queries, pendingCount });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const replyUserQuery = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminReply } = req.body;
        if (!adminReply) {
            return sendResponse(res, false, 400, 'Reply text is required.');
        }

        const queryDoc = await UserQuery.findById(id);
        if (!queryDoc) {
            return sendResponse(res, false, 404, 'User query not found.');
        }

        queryDoc.adminReply = adminReply;
        queryDoc.status = 'Answered';
        queryDoc.repliedAt = new Date();
        queryDoc.repliedBy = 'Admin';
        await queryDoc.save();

        await AuditLog.create({
            userId: req.userId,
            action: 'reply_user_query',
            details: { queryId: id, userEmail: queryDoc.userEmail },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Reply posted successfully.', queryDoc);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 49. Admin Self Profile Update (Name, Email/Username, Password)
const updateAdminSelfProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { firstName, lastName, email, currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, false, 404, 'Admin account not found.');
        }

        if (email && email.toLowerCase() !== user.email.toLowerCase()) {
            const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId }, isDeleted: { $ne: true } });
            if (existing) {
                return sendResponse(res, false, 400, 'Email / Username is already taken by another account.');
            }
            user.email = email.toLowerCase();
        }

        if (firstName !== undefined) user.firstName = firstName.trim();
        if (lastName !== undefined) user.lastName = lastName.trim();

        if (newPassword) {
            if (!currentPassword) {
                return sendResponse(res, false, 400, 'Current password is required to set a new password.');
            }
            const isMatch = await decryptPassword(currentPassword, user.password);
            if (!isMatch) {
                return sendResponse(res, false, 400, 'Current password is incorrect.');
            }
            user.password = await encryptPassword(newPassword);
        }

        await user.save();

        await AuditLog.create({
            userId: user._id,
            action: 'update_admin_self_profile',
            details: { email: user.email, firstName: user.firstName, lastName: user.lastName },
            ipAddress: req.ip
        });

        const updatedUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role
        };

        return sendResponse(res, true, 200, 'Admin profile updated successfully.', updatedUser);
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 50. Super Admin Create New Admin Account
const createAdminUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        if (!email || !password || !firstName) {
            return sendResponse(res, false, 400, 'First Name, Email, and Password are required.');
        }

        const existing = await User.findOne({ email: email.toLowerCase(), isDeleted: { $ne: true } });
        if (existing) {
            return sendResponse(res, false, 400, 'User with this email already exists.');
        }

        const hashedPassword = await encryptPassword(password);
        const newAdminRole = role || 'Admin';

        const newAdmin = new User({
            firstName: firstName.trim(),
            lastName: lastName ? lastName.trim() : '',
            email: email.toLowerCase(),
            password: hashedPassword,
            role: newAdminRole,
            isActive: true,
            isPremium: true
        });

        await newAdmin.save();

        await AuditLog.create({
            userId: req.userId,
            action: 'create_admin_user',
            details: { newAdminId: newAdmin._id, email: newAdmin.email, role: newAdminRole },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 201, 'New Admin account created successfully.', {
            _id: newAdmin._id,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            email: newAdmin.email,
            role: newAdmin.role
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

module.exports = {
    getAnalytics,
    getUsers,
    getUserProfile,
    updateUserProfile,
    toggleUserStatus,
    deleteUser,
    forceLogoutUser,
    getPayments,
    manualSubscribe,
    cancelSubscription,
    uploadBook,
    importBook,
    getOffers,
    createOffer,
    deleteOffer,
    getPromoCodes,
    createPromoCode,
    deletePromoCode,
    sendPushNotification,
    getNotificationLogs,
    getSettings,
    updateSettings,
    getAuditLogs,
    createCategory,
    updateCategory,
    deleteCategory,
    createChapter,
    updateChapter,
    deleteChapter,
    createSection,
    updateSection,
    deleteSection,
    uploadBookImport,
    getImportJobStatus,
    editImportJobData,
    publishImportJob,
    getVersionHistory,
    rollbackVersion,
    updatePushNotification,
    deletePushNotification,
    exportCategoryContent,
    publishExistingContent,
    publishFirstSchedule,
    publishSecondSchedule,
    uploadScheduleImage,
    uploadSchedulePdf,
    deleteSchedulePdf,
    parseMinorActFile,
    publishMinorAct,
    getMinorActsList,
    reorderMinorActs,
    updateMinorAct,
    deleteMinorAct,
    uploadMinorActPdf,
    clearMinorActPdf,
    clearAllMinorActPdfs,
    bulkUploadMinorActPdfs,
    bulkDeleteAllMinorActs,
    getSignupConfig,
    updateSignupConfig,
    getAdminQueries,
    replyUserQuery,
    updateAdminSelfProfile,
    createAdminUser,
    getAllSubscriptionPlans,
    updateSubscriptionPlan,
    createSubscriptionPlan
};

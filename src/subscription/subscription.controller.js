const categoryService = require('./subscription.service');
const { sendResponse, errorHandler, calculateDaysBetween, calculateExpirationDate, calculateNewDate } = require('../../utils/common_functions');
const userService = require("../users/user.services");
// Add a new end - use.
const addEndUse = async (req, res) => {
    try {
        const { body: data } = req;
        const checkCategory = await categoryService.getCategory({ name: data.name });
        if (checkCategory) {
            return sendResponse(res, false, 200, 'Category already exists.');
        }
        await categoryService.addCategory(data);
        return sendResponse(res, true, 200, 'Category added successfully.');
    } catch (error) {
        errorHandler(error, res);
    }
};
// Get available end use.
const getEndUses = async (req, res) => {
    try {
        const endUse = await categoryService.getCategories();
        return sendResponse(res, true, 200, 'Category available.', endUse);
    } catch (error) {
        errorHandler(error, res);
    }
};

const planSubscribe = async (req, res) => {
    try {
        const { userId, body: { planId }, profile } = req;
        const [plan, plans] = await Promise.all([categoryService.getCategory({ _id: planId }), categoryService.getSubscriptions({ userId: userId, isActive: true })])
        if (!plan) {
            return sendResponse(res, true, 200, 'Plan not available.');
        }
        const updateData = { userId: userId, plan: plan, purchasedDate: new Date() }
        if (plans.length) {
            updateData.purchasedDate = calculateNewDate(plans[plans.length - 1].plan.validity-1, plans[plans.length - 1].purchasedDate);
        }
        //     const checkPlan = await categoryService.getSubscription({ userId: userId })
        //     const days = calculateDaysBetween(new Date(), checkPlan.createdAt)
        //     console.log(days, "days")
        //     if (Number(checkPlan.plan.validity) && days <= Number(checkPlan.plan.validity)) {
        //         return sendResponse(res, true, 200, 'plan is already subscribed.');
        // }
        if (!plans.length) {

            await userService.updateUser({ _id: userId }, { subscriptionId: planId })
        }
        await categoryService.addSubscription(updateData)
        return sendResponse(res, true, 200, 'Subscription successfull.');
    } catch (error) {
        errorHandler(error, res);
    }
}
const getAvailablePlans = async (req, res) => {
    try {
        const Subscription = require('../models/subscription');
        let plans = await Subscription.find({ isActive: true }).sort({ price: 1 }).lean();
        
        if (!plans || plans.length === 0) {
            // Seed standard Google Play Monthly & Yearly Subscription Plans
            const defaultMonthly = await Subscription.create({
                name: "Monthly Premium Plan",
                planType: "monthly",
                productId: "com.thelawmens.monthly",
                googlePlaySku: "com.thelawmens.monthly",
                validity: 30,
                price: 199,
                strikePrice: 399,
                offerText: "SPECIAL OFFER • 50% OFF",
                discount: 50,
                description: "Full access to all books, search, comparison and offline features billed monthly.",
                features: [
                    "Access to all 125+ Law Books & Schedules",
                    "Side-by-Side BNS vs IPC & BNSS vs CrPC Comparison",
                    "Full Offline Access & Local Search",
                    "No Ads & Unlimited Bookmarks"
                ]
            });

            const defaultYearly = await Subscription.create({
                name: "Yearly Premium Pass (Save 50%)",
                planType: "yearly",
                productId: "com.thelawmens.yearly",
                googlePlaySku: "com.thelawmens.yearly",
                validity: 365,
                price: 1499,
                strikePrice: 2999,
                offerText: "🔥 EXCLUSIVE OFFER • SAVE 50%",
                discount: 50,
                description: "Best Value: Unrestricted annual access with priority legal updates and offline downloads.",
                features: [
                    "Everything in Monthly Plan",
                    "Save over 50% compared to Regular Billing",
                    "Priority Customer & Legal Query Support",
                    "Unlimited PDF Exports & Offline Data Sync"
                ]
            });

            plans = [defaultMonthly.toObject(), defaultYearly.toObject()];
        }

        return sendResponse(res, true, 200, 'Subscription plans retrieved successfully.', plans);
    } catch (error) {
        return errorHandler(error, res);
    }
};

const verifyGooglePlaySubscription = async (req, res) => {
    try {
        const { userId } = req;
        const { purchaseToken, productId, orderId, packageName } = req.body;

        if (!purchaseToken || !productId) {
            return sendResponse(res, false, 400, 'purchaseToken and productId are required.');
        }

        const Subscription = require('../models/subscription');
        const User = require('../models/user');
        const SubscriptionHistory = require('../models/subscriptionHistory');

        // Find plan details matching product ID
        let plan = await Subscription.findOne({ productId: productId });
        if (!plan) {
            // Fallback matching by planType (monthly vs yearly)
            const isYearly = productId.includes('yearly') || productId.includes('annual');
            plan = await Subscription.findOne({ planType: isYearly ? 'yearly' : 'monthly' });
        }

        const validityDays = plan ? plan.validity : (productId.includes('yearly') ? 365 : 30);
        const purchaseDate = new Date();
        const expiryDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

        // Update User Premium Status
        const user = await User.findById(userId);
        if (!user) return sendResponse(res, false, 404, 'User not found.');

        user.isPremium = true;
        user.premiumPurchaseDate = purchaseDate;
        user.trialEndDate = expiryDate;
        user.premiumPaymentId = orderId || purchaseToken;
        if (plan) user.subscriptionId = plan._id;
        await user.save();

        // Log Subscription History
        await SubscriptionHistory.create({
            userId: user._id,
            plan: plan ? plan.toObject() : { name: "Google Play Subscription", validity: validityDays, price: isYearly ? 1499 : 199 },
            purchasedDate: purchaseDate,
            isActive: true
        });

        return sendResponse(res, true, 200, 'Google Play Subscription verified & Premium activated successfully.', {
            isPremium: true,
            purchaseDate,
            expiryDate,
            validityDays
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const getSubscriptionStatus = async (req, res) => {
    try {
        const { profile } = req;
        const isPremium = profile?.isPremium === true;
        const expiryDate = profile?.trialEndDate ? new Date(profile.trialEndDate) : null;
        const isExpired = expiryDate ? new Date() > expiryDate : false;
        
        let daysRemaining = 0;
        return sendResponse(res, true, 200, 'Subscription status retrieved.', {
            isPremium: isPremium && !isExpired,
            expiryDate,
            daysRemaining,
            isTrialUsed: profile?.isTrialUsed || false
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const userPlans = async (req, res) => {
    try {
        const { userId } = req;
        const categoryService = require('./subscription.service');
        const response = { current: [], upcoming: [] };
        const plans = await categoryService.getSubscriptions({ userId: userId, isActive: true });
        for (const plan of plans) {
            plan.status = false;
            const days = calculateDaysBetween(new Date(), plan.purchasedDate);
            if (Number(plan.plan?.validity) && days < Number(plan.plan.validity)) {
                plan.status = true;
            }
            plan.expireDate = calculateExpirationDate((plan.plan?.validity || 30) - 1, plan.purchasedDate);
            plan.purchasedDate = plan.purchasedDate ? new Date(plan.purchasedDate).toLocaleDateString() : "";
        }
        if (plans.length) {
            response.current.push(plans[0]);
            plans.shift();
            response.upcoming = plans;
        }

        return sendResponse(res, true, 200, 'User plans', response);
    } catch (error) {
        return errorHandler(error, res);
    }
};

module.exports = { 
    addEndUse, 
    getEndUses, 
    planSubscribe, 
    userPlans,
    getAvailablePlans,
    verifyGooglePlaySubscription,
    getSubscriptionStatus
};

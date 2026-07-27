const Subscription = require('../models/subscription');
const { createDocument, getDocument, getDocuments } = require("../../services/common_services");
const SubscriptionHistory = require("../models/subscriptionHistory");
const { calculateEXpDate } = require("../../utils/common_functions")
const addCategory = async (data) => {
    const category = await createDocument(Subscription, data);
    return category;
};
const getCategory = async (options) => {
    const category = await getDocument(Subscription, options);
    return category;
};
const getCategories = async () => {
    const category = await Subscription.find().lean();
    return category;
};
const addSubscription = async (data) => {
    return await createDocument(SubscriptionHistory, data)
}
const getSubscription = async (options) => {
    return await getDocument(SubscriptionHistory, options)
}
const getSubscriptions = async (options) => {
    return await getDocuments(SubscriptionHistory, options)
}
const subscriptionCronService = async () => {
    const subscriptions = await SubscriptionHistory.find({ isActive: true }).lean();
    const updateData = [];
    const activateSubscription = []
    if (subscriptions.length) {
        const currentDate = new Date();
        for (const subscription of subscriptions) {
            const expireDate = calculateEXpDate(subscription.plan.validity - 1, subscription.purchasedDate);
            if (currentDate.getTime() > expireDate.getTime()) {
                updateData.push(subscription)
            }
        }
    }
    if (updateData && updateData.length) {
        for (const plan of updateData) {
            const newSubscription = subscriptions.find(item => item._id.toString() !== plan._id.toString() && item.userId.toString() === plan.userId.toString())
            if (newSubscription) {
                activateSubscription.push(newSubscription)
            }
        }
    }
}
module.exports = {
    addCategory,
    getCategory,
    getCategories,
    addSubscription,
    getSubscription,
    getSubscriptions,
    subscriptionCronService
};

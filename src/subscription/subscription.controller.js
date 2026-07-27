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
const userPlans = async (req, res) => {
    try {
        const { userId } = req;
        const response = { current: [], upcoming: [] }
        const plans = await categoryService.getSubscriptions({ userId: userId, isActive: true });
        for (const plan of plans) {
            plan.status = false
            const days = calculateDaysBetween(new Date(), plan.purchasedDate)
            if (Number(plan.plan.validity) && days < Number(plan.plan.validity)) {
                plan.status = true
            }
            plan.expireDate = calculateExpirationDate(plan.plan.validity-1, plan.purchasedDate);
            plan.purchasedDate = plan.purchasedDate.toLocaleDateString()
        }
        if (plans.length) {
            response.current.push(plans[0])
            plans.shift();
            response.upcoming = plans
        }

        return sendResponse(res, true, 200, 'User plans', response);
    } catch (error) {
        errorHandler(error, res);
    }
}
module.exports = { addEndUse, getEndUses, planSubscribe, userPlans };

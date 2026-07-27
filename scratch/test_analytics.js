const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@cluster0.u5bqmpo.mongodb.net/?appName=Cluster0&compressors=zlib";

const User = require('../src/models/user');
const Casebook = require('../src/models/casebookmaster');
const Category = require('../src/models/category');
const SubscriptionHistory = require('../src/models/subscriptionHistory');
const Offer = require('../src/models/offer');
const PromoCode = require('../src/models/promoCode');
const Profession = require('../src/models/profession');

async function test() {
    try {
        console.log("Connecting...");
        await mongoose.connect(mongoURI);
        console.log("Connected. Testing analytics aggregates step-by-step:");

        console.log("1. Counting users...");
        const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
        console.log("Total users:", totalUsers);

        console.log("2. Counting books & categories...");
        const totalBooks = await Casebook.countDocuments({ isActive: true });
        const totalCategories = await Category.countDocuments({ isActive: true });
        console.log("Books:", totalBooks, "Categories:", totalCategories);

        console.log("3. Counting laws...");
        const sectionsData = await Casebook.aggregate([
            { $match: { isActive: true } },
            { $project: { numberOfSections: { $size: { $ifNull: ["$section", []] } } } },
            { $group: { _id: null, totalSections: { $sum: "$numberOfSections" } } }
        ]);
        const totalLaws = sectionsData.length ? sectionsData[0].totalSections : 0;
        console.log("Total laws:", totalLaws);

        console.log("4. Aggregating revenue...");
        const revenueAggregation = await SubscriptionHistory.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, total: { $sum: { $ifNull: ["$plan.price", 0] } } } }
        ]);
        const totalRevenue = revenueAggregation.length ? revenueAggregation[0].total : 0;
        console.log("Total revenue:", totalRevenue);

        console.log("5. Aggregating profession breakdown...");
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
        console.log("Profession breakdown:", professionBreakdown);

        console.log("6. User growth...");
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
        console.log("Growth aggregation:", growthAggregation);

        console.log("Done successfully.");
    } catch (e) {
        console.error("Error encountered:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

test();

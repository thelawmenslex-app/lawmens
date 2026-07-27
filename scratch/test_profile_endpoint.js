const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

const userService = require("../src/users/user.services");
const { getHistory } = require("../src/category/category.service");

async function run() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected.");

        const user = await mongoose.connection.db.collection('users').findOne({ email: 'smiletoonstv@gmail.com' });
        console.log("Testing user:", user._id);

        const req = {
            userId: user._id,
            profile: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role || 'User',
                isPremium: user.isPremium || false,
                trialEndDate: user.trialEndDate,
                bookMarks: []
            }
        };

        const [users, cms, searchCount] = await Promise.all([
            userService.getSettings(),
            userService.getcms(),
            getHistory({ userId: user._id, isActive: true })
        ]);

        console.log("users:", users);
        console.log("cms count:", cms.length);
        console.log("searchCount:", searchCount);

        const profile = req.profile;
        profile.contact = users;
        profile.about = cms.find(item => item.type === "about")?.content;
        profile.privacy = cms.find(item => item.type === "privacy")?.content;
        profile.disclaimer = { content: cms.find(item => item.type === "disclaimer")?.content, email: users.email };
        profile.count = { current: searchCount, total: Number(process.env.COUNT || 5) };
        delete profile.bookMarks;

        console.log("SUCCESS! Profile output:", profile);

    } catch (e) {
        console.error("FAILED! Error is:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();

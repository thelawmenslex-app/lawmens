const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DB_URL = process.env.DBURL;

async function run() {
    if (!DB_URL) {
        console.error("DBURL not found in .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(DB_URL);
        console.log("Connected to DB.");

        const User = mongoose.connection.db.collection('users');

        // Clean existing
        await User.deleteMany({ email: { $in: ['admin@yopmail.com', 'test@yopmail.com'] } });

        const salt = 10;
        const adminPassword = await bcrypt.hash('Admin@123', salt);
        const userPassword = await bcrypt.hash('User@123', salt);

        // Get or create a default professionId (to satisfy references)
        const professions = await mongoose.connection.db.collection('professions').find().toArray();
        const defaultProfessionId = professions.length > 0 ? professions[0]._id : new mongoose.Types.ObjectId();

        // 1. Create Admin
        await User.insertOne({
            firstName: "Admin",
            lastName: "System",
            email: "admin@yopmail.com",
            password: adminPassword,
            phoneNumber: "9999999999",
            role: "Super Admin",
            isActive: true,
            isPremium: true,
            bookMarks: [],
            trialStartDate: new Date(),
            trialEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            isTrialUsed: true,
            professionId: defaultProfessionId,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log("Admin account created: admin@yopmail.com / Admin@123");

        // 2. Create User
        await User.insertOne({
            firstName: "Test",
            lastName: "User",
            email: "test@yopmail.com",
            password: userPassword,
            phoneNumber: "9999999998",
            role: "User",
            isActive: true,
            isPremium: false,
            bookMarks: [],
            trialStartDate: new Date(),
            trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            isTrialUsed: false,
            professionId: defaultProfessionId,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log("Test user account created: test@yopmail.com / User@123");

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();

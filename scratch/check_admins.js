const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@cluster0.u5bqmpo.mongodb.net/?appName=Cluster0&compressors=zlib";

const User = require('../src/models/user');

async function test() {
    try {
        console.log("Connecting...");
        await mongoose.connect(mongoURI);
        console.log("Connected.");

        const admins = await User.find({
            role: { $in: ['Super Admin', 'Admin', 'Editor', 'Moderator', 'Support', 'Finance Manager'] },
            isDeleted: { $ne: true }
        });
        console.log("Admin accounts found:", admins.map(u => ({
            id: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role,
            isActive: u.isActive
        })));
        
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

test();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function run() {
    try {
        console.log("Connecting...");
        await mongoose.connect(DB_URL);
        const db = mongoose.connection.db;

        console.log("Deleting mock yopmail users (excluding admin@yopmail.com)...");
        const deleteUsersResult = await db.collection('users').deleteMany({
            email: { 
                $regex: /yopmail\.com$/i,
                $ne: 'admin@yopmail.com'
            }
        });
        console.log(`Deleted ${deleteUsersResult.deletedCount} mock users.`);

        // Double check remaining users
        const remainingUsers = await db.collection('users').find().toArray();
        console.log("Remaining users in database:", remainingUsers.map(u => ({
            id: u._id,
            firstName: u.firstName,
            email: u.email,
            role: u.role
        })));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();

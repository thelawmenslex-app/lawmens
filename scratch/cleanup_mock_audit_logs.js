const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function run() {
    try {
        console.log("Connecting...");
        await mongoose.connect(DB_URL);
        const db = mongoose.connection.db;

        console.log("Checking auditlogs...");
        const logs = await db.collection('auditlogs').find().toArray();
        console.log(`Total logs found: ${logs.length}`);

        // Find active user IDs
        const users = await db.collection('users').find().toArray();
        const activeUserIds = users.map(u => u._id.toString());

        // Delete logs that have a userId but the user is no longer active
        let deletedCount = 0;
        for (const log of logs) {
            if (log.userId && !activeUserIds.includes(log.userId.toString())) {
                await db.collection('auditlogs').deleteOne({ _id: log._id });
                deletedCount++;
            }
        }
        console.log(`Deleted ${deletedCount} orphaned audit logs.`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function run() {
    try {
        await mongoose.connect(DB_URL);
        const db = mongoose.connection.db;
        const histories = await db.collection('subscriptionhistories').find().toArray();
        console.log("SUBSCRIPTION HISTORIES:", histories.map(h => ({
            id: h._id,
            userId: h.userId,
            purchasedDate: h.purchasedDate,
            plan: h.plan,
            isActive: h.isActive
        })));
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function run() {
    try {
        console.log("Connecting...");
        await mongoose.connect(DB_URL);
        const db = mongoose.connection.db;

        // Clear mock push notifications
        console.log("Checking push notifications...");
        const nots = await db.collection('pushnotifications').find().toArray();
        console.log("Found notifications:", nots.map(n => n.title));
        
        // Clear mock offers
        console.log("Checking offers...");
        const offers = await db.collection('offers').find().toArray();
        console.log("Found offers:", offers.map(o => o.title));

        // Clear mock promocodes
        console.log("Checking promocodes...");
        const promos = await db.collection('promocodes').find().toArray();
        console.log("Found promocodes:", promos.map(p => p.code));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0";

async function run() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(DB_URL);
        console.log("Connected successfully!");
        
        const scheduleCol = mongoose.connection.db.collection('firstschedule');
        
        // Find a few documents to inspect
        const docs = await scheduleCol.find({}).limit(5).toArray();
        console.log("=== First Schedule Samples ===");
        console.log(JSON.stringify(docs, null, 2));
        
        // Search for anything related to "302" or "318" or "420"
        const specificDocs = await scheduleCol.find({ 
            $or: [
                { section: "302" },
                { section: "420" },
                { section: "318" },
                { section: /302/ },
                { section: /420/ }
            ]
        }).toArray();
        console.log("\n=== Specific Schedule Matches ===");
        console.log(JSON.stringify(specificDocs, null, 2));
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();

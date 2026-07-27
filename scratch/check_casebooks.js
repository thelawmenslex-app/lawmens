const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function run() {
    try {
        await mongoose.connect(DB_URL);
        const db = mongoose.connection.db;

        const count = await db.collection('casebooks').countDocuments();
        console.log("Total casebooks count:", count);

        if (count > 0) {
            const samples = await db.collection('casebooks').find().limit(5).toArray();
            console.log("Samples:", JSON.stringify(samples.map(s => ({
                id: s._id,
                name: s.name,
                categoryId: s.categoryId,
                sectionsCount: s.section ? s.section.length : 0
            })), null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();

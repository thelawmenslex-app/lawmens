const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function run() {
    try {
        await mongoose.connect(DB_URL);
        const db = mongoose.connection.db;

        const casebooks = await db.collection('casebooks').find().toArray();
        const stats = {};
        for (const cb of casebooks) {
            const catId = cb.categoryId ? cb.categoryId.toString() : 'missing';
            if (!stats[catId]) {
                stats[catId] = { total: 0, missingName: 0, sampleNames: [] };
            }
            stats[catId].total++;
            if (!cb.name) {
                stats[catId].missingName++;
            } else {
                if (stats[catId].sampleNames.length < 3) {
                    stats[catId].sampleNames.push(cb.name);
                }
            }
        }
        console.log("Stats:", JSON.stringify(stats, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();

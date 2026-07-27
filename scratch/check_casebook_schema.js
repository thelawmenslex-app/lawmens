const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

const Casebook = require("../src/models/casebookmaster");

async function run() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected.");

        const doc = await Casebook.findOne().lean();
        console.log("Casebook document properties:", Object.keys(doc));
        console.log("updatedAt value:", doc.updatedAt);
        console.log("createdAt value:", doc.createdAt);
        console.log("Sample document:", JSON.stringify(doc, null, 2).substring(0, 1000));

    } catch (e) {
        console.error("FAILED! Error is:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();

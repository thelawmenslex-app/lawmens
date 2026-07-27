const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@cluster0.u5bqmpo.mongodb.net/?appName=Cluster0&compressors=zlib";

async function test() {
    try {
        console.log("Connecting...");
        await mongoose.connect(mongoURI);
        console.log("Connected.");

        const adminDb = mongoose.connection.client.db().admin();
        const dbs = await adminDb.listDatabases();
        console.log("Databases in cluster:", dbs.databases);
    } catch (e) {
        console.error("Error listing databases:", e);
    } finally {
        await mongoose.disconnect();
    }
}

test();

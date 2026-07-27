const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

// Connection to "test" database instead of "lawapp"
const testDB = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/test?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function run() {
    try {
        console.log("Connecting to test db...");
        await mongoose.connect(testDB);
        console.log("Connected.");

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("Collections in 'test' database:", collections.map(c => c.name));

        for (const colName of ['users', 'casebooks', 'categories']) {
            const count = await db.collection(colName).countDocuments();
            console.log(`Collection '${colName}' count: ${count}`);
            if (count > 0) {
                const sample = await db.collection(colName).find().limit(2).toArray();
                console.log(`Sample from '${colName}':`, sample.map(doc => {
                    const { _id, name, firstName, lastName, email } = doc;
                    return { _id, name, firstName, lastName, email };
                }));
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();

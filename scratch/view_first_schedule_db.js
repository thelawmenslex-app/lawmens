const mongoose = require('mongoose');

const DBURL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function run() {
    try {
        await mongoose.connect(DBURL);
        console.log("Connected to MongoDB!");
        
        const FirstSchedule = mongoose.model('FIRSTSCHEDULE', new mongoose.Schema({}, { strict: false }), 'firstschedule');
        const count = await FirstSchedule.countDocuments();
        console.log("Total documents in firstschedule:", count);
        if (count > 0) {
            const docs = await FirstSchedule.find().limit(3).lean();
            console.log("First 3 documents:", JSON.stringify(docs, null, 2));
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();

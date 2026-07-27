const mongoose = require('mongoose');

const DBURL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function run() {
    try {
        await mongoose.connect(DBURL);
        console.log("Connected to MongoDB!");
        
        const Category = mongoose.model('category', new mongoose.Schema({}, { strict: false }));
        const BookImport = mongoose.model('bookImport', new mongoose.Schema({}, { strict: false }));
        
        const categories = await Category.find().lean();
        console.log(`Found ${categories.length} categories:`, categories.map(c => ({ id: c._id, name: c.name, type: c.type })));
        
        const imports = await BookImport.find().sort({ createdAt: -1 }).limit(5).lean();
        console.log(`Found ${imports.length} recent book import jobs:`, imports.map(i => ({
            id: i._id,
            bookName: i.bookName,
            status: i.status,
            progress: i.progress,
            report: i.validationReport,
            createdAt: i.createdAt
        })));
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();

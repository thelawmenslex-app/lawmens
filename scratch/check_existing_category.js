const mongoose = require('mongoose');

const DBURL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

async function run() {
    try {
        await mongoose.connect(DBURL);
        console.log("Connected to MongoDB!");
        
        const Casebook = mongoose.model('Casebook', new mongoose.Schema({}, { strict: false }), 'casebooks');
        
        // Find one chapter from Indian Penal Code (6657528684091c0faa66efd6)
        const chapter = await Casebook.findOne({ categoryId: new mongoose.Types.ObjectId('6657528684091c0faa66efd6') }).lean();
        if (chapter) {
            console.log("Chapter Name:", chapter.name);
            console.log("Number of sections:", chapter.section?.length);
            if (chapter.section && chapter.section.length > 0) {
                console.log("First Section Example:", JSON.stringify(chapter.section[0], null, 2));
            }
        } else {
            console.log("No chapter found for this category.");
        }
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();

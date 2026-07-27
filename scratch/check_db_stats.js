const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

const Category = require("../src/models/category");
const Casebook = require("../src/models/casebookmaster");

async function run() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected.");

        const categories = await Category.find().lean();
        console.log("Categories found:", categories.length);
        for (const cat of categories) {
            const count = await Casebook.countDocuments({ categoryId: cat._id });
            const casebooks = await Casebook.find({ categoryId: cat._id }).lean();
            let totalSections = 0;
            casebooks.forEach(c => {
                if (c.section) totalSections += c.section.length;
            });
            console.log(`- ${cat.name} (${cat._id}): Chapters=${count}, Sections=${totalSections}`);
        }

    } catch (e) {
        console.error("FAILED! Error is:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

const Casebook = require("../src/models/casebookmaster");

async function run() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected.");

        // Let's find BNSS chapters
        const chapters = await Casebook.find({ categoryId: "665752a184091c0faa66efe2" }).lean();
        console.log("BNSS chapters count:", chapters.length);
        
        let sampleSections = [];
        chapters.forEach(c => {
            if (c.section) {
                c.section.forEach(s => {
                    sampleSections.push(s);
                });
            }
        });
        
        console.log("Total BNSS sections:", sampleSections.length);
        
        const mappedSections = sampleSections.filter(s => s.oldversion);
        console.log("Mapped BNSS sections count:", mappedSections.length);
        
        if (sampleSections.length > 0) {
            console.log("Sample BNSS section:", JSON.stringify(sampleSections[0], null, 2));
        }
        
        // Find if there is a section with name '420' or oldversion '420'
        const sec420 = sampleSections.find(s => s.name === '420' || s.oldversion === '420');
        console.log("Section 420 search result:", sec420 ? JSON.stringify(sec420, null, 2) : "Not found!");

    } catch (e) {
        console.error("FAILED! Error is:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();

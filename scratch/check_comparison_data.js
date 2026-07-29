const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
require('dotenv').config();

const Casebook = require('../src/models/casebookmaster');
const Category = require('../src/models/category');

const MONGO_URI = process.env.DBURL || "mongodb+srv://thelawmenslex_db_user:Lawmens%40lex@cluster0.ddwnq8e.mongodb.net/lawapp?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        const categories = await Category.find().lean();
        console.log("Categories found:", categories.map(c => ({ id: c._id, name: c.name })));

        for (const cat of categories) {
            console.log(`\n=================== Category: ${cat.name} (${cat._id}) ===================`);
            const chapters = await Casebook.find({ categoryId: cat._id }).lean();
            console.log(`Total chapters count: ${chapters.length}`);
            
            let totalSections = 0;
            let sampleSections = [];
            for (const ch of chapters) {
                if (ch.section && Array.isArray(ch.section)) {
                    totalSections += ch.section.length;
                    for (const s of ch.section) {
                        if (sampleSections.length < 10) {
                            sampleSections.push({
                                name: s.name,
                                keyword: s.keyword,
                                oldversion: s.oldversion,
                                sectionId: s.sectionId
                            });
                        }
                    }
                }
            }
            console.log(`Total sections in ${cat.name}: ${totalSections}`);
            console.log("Sample sections:", JSON.stringify(sampleSections, null, 2));
        }

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

check();

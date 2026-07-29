const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
require('dotenv').config();

const Casebook = require('../src/models/casebookmaster');

const MONGO_URI = process.env.DBURL || "mongodb+srv://thelawmenslex_db_user:Lawmens%40lex@cluster0.ddwnq8e.mongodb.net/lawapp?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        const casebooks = await Casebook.find().lean();
        console.log("Searching for Sec 497 across all casebooks...");

        for (const cb of casebooks) {
            if (cb.section && Array.isArray(cb.section)) {
                for (const sec of cb.section) {
                    if (sec.name === "497" || sec.name === "Section 497" || (sec.keyword && sec.keyword.includes("custody and disposal"))) {
                        console.log(`\nFound Section ${sec.name} in Chapter '${cb.name}' (_id: ${cb._id}):`);
                        console.log("  Section ID (_id):", sec._id);
                        console.log("  Section sectionId:", sec.sectionId);
                        console.log("  Keyword / Title:", sec.keyword);
                        console.log("  Content Array/Type:", typeof sec.content, Array.isArray(sec.content) ? sec.content.length : sec.content);
                        console.log("  Content Sample:", JSON.stringify(sec.content, null, 2));
                    }
                }
            }
        }

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

check();

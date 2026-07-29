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

        const casebooks = await Casebook.find().populate('categoryId').lean();
        console.log(`Total casebooks found: ${casebooks.length}`);

        for (const cb of casebooks) {
            if (cb.name && (cb.name.includes("RELAT") || cb.name.includes("AFFECT") || cb.name.includes("CONTEMPT") || cb.name.includes("EVIDENCE") || cb.name.includes("CHAPTER"))) {
                console.log(`[Category: ${cb.categoryId ? cb.categoryId.name : 'Unknown'}] Chapter Name: "${cb.name}" (Length: ${cb.name.length})`);
            }
        }

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

check();

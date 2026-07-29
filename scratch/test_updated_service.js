const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
require('dotenv').config();

const casebookService = require('../src/casebook/casebook.service');

const MONGO_URI = process.env.DBURL || "mongodb+srv://thelawmenslex_db_user:Lawmens%40lex@cluster0.ddwnq8e.mongodb.net/lawapp?retryWrites=true&w=majority&appName=Cluster0";

async function test() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        const categories = [
            { id: '6657528684091c0faa66efd6', name: 'IPC' },
            { id: '6657528b84091c0faa66efd9', name: 'CrPC' },
            { id: '6657529084091c0faa66efdc', name: 'IEA' }
        ];

        for (const cat of categories) {
            console.log(`\n=================== Testing getSectionsByBook for: ${cat.name} ===================`);
            const sections = await casebookService.getSectionsByBook(cat.id);
            const mappedCount = sections.filter(s => s.oldversion !== null).length;
            console.log(`Total sections retrieved: ${sections.length}`);
            console.log(`Mapped corresponding sections count: ${mappedCount}`);
            console.log("Sample first 10 sections:", JSON.stringify(sections.slice(0, 10).map(s => ({
                name: s.name,
                keyword: s.keyword ? s.keyword.substring(0, 30) : '',
                mappedTargetSec: s.oldversion
            })), null, 2));
        }

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

test();

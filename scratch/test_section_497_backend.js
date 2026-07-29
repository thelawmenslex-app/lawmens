const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
require('dotenv').config();

const casebookController = require('../src/casebook/casebook.controller');

const MONGO_URI = process.env.DBURL || "mongodb+srv://thelawmenslex_db_user:Lawmens%40lex@cluster0.ddwnq8e.mongodb.net/lawapp?retryWrites=true&w=majority&appName=Cluster0";

async function test() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        const req = {
            params: {
                chapterId: '668449b3aef3cbe00ef78699',
                sectionId: '66844969aef3cbe00ef781fd', // sectionId passed by seclist
                page: 1
            },
            query: {},
            profile: { bookMarks: [] },
            userId: new mongoose.Types.ObjectId()
        };

        const res = {
            status: function(code) {
                console.log("Response HTTP Status:", code);
                return this;
            },
            json: function(data) {
                console.log("Response JSON Output:", JSON.stringify(data, null, 2));
            }
        };

        console.log("Calling getSectionContent for Section 497...");
        await casebookController.getSectionContent(req, res);

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

test();

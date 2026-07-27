const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

const syncController = require("../src/modules/sync/sync.controller");

async function run() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected.");

        const user = await mongoose.connection.db.collection('users').findOne({ email: 'smiletoonstv@gmail.com' });

        const req = {
            userId: user._id,
            body: {
                notes: [
                    {
                        _id: "local_note_1720853600000_abc123",
                        sectionId: "668448a2aef3cbe00ef77b32",
                        noteText: "Test offline note noteText text",
                        isDeleted: false
                    }
                ],
                bookmarks: []
            }
        };

        const res = {
            status: function(code) {
                console.log("Response status code:", code);
                return this;
            },
            json: function(data) {
                console.log("Response JSON:", JSON.stringify(data, null, 2));
                return this;
            }
        };

        await syncController.pushSync(req, res);

    } catch (e) {
        console.error("FAILED! Error is:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();

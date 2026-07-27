const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

const subscriptionController = require("../src/subscription/subscription.controller");

async function run() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected.");

        const user = await mongoose.connection.db.collection('users').findOne({ email: 'smiletoonstv@gmail.com' });
        console.log("Testing user:", user._id);

        const req = {
            userId: user._id
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

        await subscriptionController.userPlans(req, res);

    } catch (e) {
        console.error("FAILED! Error is:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();

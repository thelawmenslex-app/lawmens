const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const DB_URL = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

const casebookController = require("../src/casebook/casebook.controller");

async function run() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected.");

        const req = {
            params: {
                categoryId: "6657528684091c0faa66efd6" // IPC
            }
        };

        const res = {
            status: function(code) {
                console.log("Response status code:", code);
                return this;
            },
            json: function(data) {
                console.log("Response JSON items count:", data.data.length);
                if (data.data.length > 0) {
                    console.log("First item:", JSON.stringify(data.data[0], null, 2));
                }
                return this;
            }
        };

        await casebookController.getComparisonTable(req, res);

    } catch (e) {
        console.error("FAILED! Error is:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();

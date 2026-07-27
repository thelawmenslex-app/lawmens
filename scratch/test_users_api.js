const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // path to backend root .env

const User = require('../src/models/user');
const adminController = require('../src/modules/admin/admin.controller');

const DB_URL = process.env.DBURL || "mongodb+srv://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@cluster0.u5bqmpo.mongodb.net/?appName=Cluster0&compressors=zlib";

async function run() {
    try {
        console.log("Connecting to:", DB_URL);
        await mongoose.connect(DB_URL);
        console.log("Connected.");

        // Call getUsers mock
        const req = {
            query: { page: '1', limit: '10', search: '', role: '', isPremium: '' }
        };
        const res = {
            status: function(code) {
                console.log("Response status code:", code);
                return this;
            },
            json: function(data) {
                console.log("Response data status:", data.status);
                console.log("Response message:", data.message);
                if (data.data) {
                    console.log("Users count in response:", data.data.users?.length);
                    console.log("First user in response:", data.data.users?.[0]);
                } else {
                    console.log("No data returned:", data);
                }
                return this;
            }
        };

        await adminController.getUsers(req, res);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();

const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // path to backend root .env

const DB_URL = process.env.DBURL || "mongodb+srv://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@cluster0.u5bqmpo.mongodb.net/?appName=Cluster0&compressors=zlib";

async function run() {
    try {
        console.log("Connecting to:", DB_URL);
        await mongoose.connect(DB_URL);
        console.log("Connected.");

        const usersCollection = mongoose.connection.db.collection('users');
        const usersList = await usersCollection.find({}).toArray();

        console.log("Registered Users count:", usersList.length);
        usersList.forEach(u => {
            console.log(`- ID: ${u._id}, Email: ${u.email}, Role: ${u.role}, isDeleted: ${u.isDeleted}, isActive: ${u.isActive}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();

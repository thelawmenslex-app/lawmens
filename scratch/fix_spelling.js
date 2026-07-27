const mongoose = require('mongoose');
require('dotenv').config();

const DB_URL = process.env.DBURL;

async function run() {
    if (!DB_URL) {
        console.error("DBURL not found in .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(DB_URL);
        console.log("Connected to DB.");

        const Category = mongoose.connection.db.collection('categories');

        // Update the typo "Bharatiya Nayaya Sanhita" to "Bharatiya Nyaya Sanhita"
        const result = await Category.updateMany(
            { name: /Bharatiya Nayaya Sanhita/i },
            { $set: { name: "Bharatiya Nyaya Sanhita , 2023" } }
        );

        console.log(`Matched ${result.matchedCount} records and updated ${result.modifiedCount} records.`);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();

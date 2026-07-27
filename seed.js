const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from the local folder
require('dotenv').config();

const DB_URL = process.env.DBURL;
const BACKUP_DIR = '../../dbdup/dbdup'; // Relative path to backup folder

const files = [
  { name: 'test.casebooks.json', collection: 'casebooks' },
  { name: 'test.categories.json', collection: 'categories' },
  { name: 'test.cms.json', collection: 'cms' },
  { name: 'test.contenthistories.json', collection: 'contenthistories' },
  { name: 'test.otpverifications.json', collection: 'otpverifications' },
  { name: 'test.professions.json', collection: 'professions' },
  { name: 'test.settings.json', collection: 'settings' },
  { name: 'test.subscriptionhistories.json', collection: 'subscriptionhistories' },
  { name: 'test.subscriptions.json', collection: 'subscriptions' },
  { name: 'test.users.json', collection: 'users' }
];

// Helper function to recursively convert MongoDB Extended JSON ($oid, $date, and numbers)
function convertExtendedJson(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(convertExtendedJson);
  }
  if (typeof obj === 'object') {
    if (obj.$oid) {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    if (obj.$date) {
      return new Date(obj.$date);
    }
    if (obj.$numberLong !== undefined) {
      return obj.$numberLong;
    }
    if (obj.$numberInt !== undefined) {
      return Number(obj.$numberInt);
    }
    if (obj.$numberDouble !== undefined) {
      return Number(obj.$numberDouble);
    }
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = convertExtendedJson(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

async function seed() {
  if (!DB_URL) {
    console.error("Error: DBURL environment variable is not defined in the .env file.");
    process.exit(1);
  }

  console.log(`Connecting to database at: ${DB_URL}...`);
  try {
    await mongoose.connect(DB_URL);
    console.log("Successfully connected to MongoDB.");

    const db = mongoose.connection.db;

    for (const item of files) {
      const filePath = path.join(__dirname, BACKUP_DIR, item.name);
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: Backup file not found at ${filePath}, skipping...`);
        continue;
      }

      console.log(`Reading backup file: ${item.name}...`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const rawData = JSON.parse(fileContent);
      const convertedData = convertExtendedJson(rawData);

      console.log(`Clearing collection: ${item.collection}...`);
      await db.collection(item.collection).deleteMany({});

      if (convertedData.length > 0) {
        console.log(`Inserting ${convertedData.length} records into ${item.collection}...`);
        await db.collection(item.collection).insertMany(convertedData);
      } else {
        console.log(`Collection ${item.collection} backup is empty, skipping insertion.`);
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

seed();

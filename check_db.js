const mongoose = require('mongoose');
require('dotenv').config();

const checkDb = async () => {
  try {
    if (process.env.DBURL) {
      await mongoose.connect(process.env.DBURL);
      console.log('Database connection OK');
    }
  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  checkDb();
}

module.exports = checkDb;
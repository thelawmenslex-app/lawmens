const { connect, connection } = require('mongoose');
const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

connection.on('connected', () => {
    console.log('Mongoose connection established to DB Clusters.');
});

connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

connection.on('disconnected', () => {
    console.log('Mongoose disconnected.');
});

const doConnect = async (url) => {
    const mongoUri = url 
        || process.env.DBURL 
        || process.env.MONGODB_URL 
        || process.env.MONGO_URI 
        || process.env.DB_URL 
        || process.env.DATABASE_URL 
        || "mongodb+srv://thelawmenslex_db_user:Lawmens%40lex@cluster0.ddwnq8e.mongodb.net/lawapp?retryWrites=true&w=majority&appName=Cluster0";

    console.log("Connecting to MongoDB URI:", mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    try {
        return await connect(mongoUri, options);
    } catch (err) {
        console.error("MongoDB initial connection error:", err);
    }
};

module.exports = {
    doConnect,
};

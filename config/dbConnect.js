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
    console.log({ err }, 'Mongoose connection error:');
});

connection.on('disconnected', () => {
    console.log('Mongoose disconnected.');
});

const doConnect = async (DB_URL) => {
    console.log("DB URL"+DB_URL);
    return connect(DB_URL, options);
};

module.exports = {
    doConnect,
};

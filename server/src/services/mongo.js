const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready');
});

mongoose.connection.on('error', (error) => {
    console.log(error);
})

async function mongoConnect() {
    await mongoose.connect(process.env.MONGO_URL);
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {mongoConnect, mongoDisconnect};
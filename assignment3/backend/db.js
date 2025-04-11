// backend/db.js
const mongoose = require('mongoose');
const uri = "mongodb+srv://kwongfaiwan:200811449@cluster0.r8bcx.mongodb.net/csci571_assignment3";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const connectDB = async () => {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ping:1});
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
module.exports = connectDB;

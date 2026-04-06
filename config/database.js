const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://shivarn:Shivarn%402021@dhruv.gfiy5jw.mongodb.net/?appName=Dhruv');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Using fallback - make sure MongoDB is running');
  }
};

module.exports = connectDB;
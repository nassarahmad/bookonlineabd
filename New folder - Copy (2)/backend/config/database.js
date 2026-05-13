const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic
 * Attempts to connect up to 5 times with 5-second delays between attempts
 * Exits process if all connection attempts fail
 */
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      
      console.log('MongoDB connected successfully');
      return;
    } catch (error) {
      retries++;
      console.error(`MongoDB connection attempt ${retries} failed:`, error.message);
      
      if (retries === maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      
      console.log(`Retrying in 5 seconds... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');
require('dotenv').config();

class DBService {
  /**
   * Connects to the MongoDB database using the connection string from environment variables.
   */
  static async connect() {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected...');
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }
}

module.exports = DBService;

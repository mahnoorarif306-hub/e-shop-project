
const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    if (!process.env.DB_URL) {
      throw new Error("DB_URL is missing in environment variables");
    }

    await mongoose.connect(process.env.DB_URL);

    console.log(
      `MongoDB connected successfully: ${mongoose.connection.host}`
    );

  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDatabase;

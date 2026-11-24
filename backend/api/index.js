const app = require("../app");
const connectDatabase = require("../db/Database");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

let dbReady;
const ensureDatabase = () => {
  if (!dbReady) dbReady = connectDatabase();
  return dbReady;
};

module.exports = async (req, res) => {
  try {
    await ensureDatabase();
    return app(req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
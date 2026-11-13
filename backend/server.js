
const path = require("path");

// Load environment variables FIRST
require("dotenv").config({
  path: path.join(__dirname, "config", ".env"),
});

const app = require("./app");
const connectDatabase = require("./db/Database");
const cloudinary = require("cloudinary");

// Cloudinary configuration (currently used for user avatars)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

if (
  !process.env.CLOUDINARY_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn(
    "WARNING: CLOUDINARY_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET missing in backend/config/.env - image uploads (products, events, avatars) will FAIL."
  );
}

const startServer = async () => {
  try {
    await connectDatabase();

    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server could not start:", error.message);
    process.exit(1);
  }
};

startServer();

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err.message);
  process.exit(1);
});

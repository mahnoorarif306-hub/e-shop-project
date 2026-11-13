const mongoose = require("mongoose");

const pendingActivationSchema = new mongoose.Schema({
  accountType: {
    type: String,
    enum: ["user", "shop"],
    required: true,
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  address: String,
  phoneNumber: Number,
  zipCode: String,
  expiresAt: {
    type: Date,
    required: true,
    expires: 0,
  },
});

module.exports = mongoose.model("PendingActivation", pendingActivationSchema);

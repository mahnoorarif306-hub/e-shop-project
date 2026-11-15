
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getJwtSecret = require("../utils/jwtSecret");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name!"],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "Please enter your email!"],
    trim: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: [true, "Please enter your password!"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },

  resetPasswordToken: {
    type: String,
    select: false,
  },

  resetPasswordExpire: {
    type: Date,
    select: false,
  },

  phoneNumber: {
    type: Number,
  },

  addresses: [
    {
      country: String,
      city: String,
      address1: String,
      address2: String,
      zipCode: Number,
      addressType: String,
    },
  ],

  role: {
    type: String,
    default: "user",
  },

  avatar: {
    public_id: {
      type: String,
      default: "default",
    },
    url: {
      type: String,
      default: "https://ui-avatars.com/api/?name=User&background=3321c8&color=fff&size=150",
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password") || this.$locals.passwordIsHashed) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Generate JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES,
    }
  );
};

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

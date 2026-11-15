const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const getJwtSecret = require("../utils/jwtSecret");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return next(new ErrorHandler("Please login to continue", 401));
    }
    throw error;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 401));
  }

  req.user = user;
  return next();
});

exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  const seller_token = req.cookies?.seller_token;

  if (!seller_token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(seller_token, getJwtSecret());
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return next(new ErrorHandler("Please login to continue", 401));
    }
    throw error;
  }

  const Shop = require("../model/shop");
  const seller = await Shop.findById(decoded.id);
  if (!seller) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  req.seller = seller;
  return next();
});

exports.isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`${req.user.role} cannot access this resource`, 403));
    }
    next();
  };
};

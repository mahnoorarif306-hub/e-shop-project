// Create token and save in cookie
const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();
  const isProduction = process.env.NODE_ENV === "production";
  const publicUser = { ...user.toObject() };
  delete publicUser.password;

  // Cookies must be compatible with both localhost development and production HTTPS.
  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user: publicUser,
    token,
  });
};

module.exports = sendToken;
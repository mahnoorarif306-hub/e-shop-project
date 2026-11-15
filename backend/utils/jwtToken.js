const getAuthCookieOptions = require("./authCookieOptions");

// Create token and save in cookie
const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();
  const publicUser = { ...user.toObject() };
  delete publicUser.password;

  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    ...getAuthCookieOptions(),
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user: publicUser,
    token,
  });
};

module.exports = sendToken;
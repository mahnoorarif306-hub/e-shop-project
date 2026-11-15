const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET_KEY or JWT_SECRET must be configured.");
  }
  return secret;
};

module.exports = getJwtSecret;

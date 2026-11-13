const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const PendingActivation = require("../model/pendingActivation");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createActivationToken = async (accountType, account) => {
  const token = crypto.randomBytes(32).toString("hex");

  await PendingActivation.create({
    accountType,
    tokenHash: hashToken(token),
    name: account.name,
    email: String(account.email).trim().toLowerCase(),
    passwordHash: await bcrypt.hash(account.password, 10),
    avatar: account.avatar,
    address: account.address,
    phoneNumber: account.phoneNumber,
    zipCode: account.zipCode,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  return token;
};

const consumeActivationToken = (accountType, token) => {
  if (typeof token !== "string" || !token) {
    return null;
  }

  return PendingActivation.findOneAndDelete({
    accountType,
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  }).select("+passwordHash");
};

module.exports = { createActivationToken, consumeActivationToken };

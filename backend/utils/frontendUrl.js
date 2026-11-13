const configuredFrontendUrl = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.trim().replace(/\/+$/, "")
  : "";

const FRONTEND_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://eshop-frontend-liard.vercel.app",
  "https://e-shop-project-two.vercel.app",
  configuredFrontendUrl,
].filter(Boolean);

const getFrontendUrl = (req) => {
  const requestOrigin = req.get("origin");
  if (FRONTEND_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }

  const fallback =
    process.env.NODE_ENV === "production"
      ? configuredFrontendUrl || "https://e-shop-project-two.vercel.app"
      : process.env.LOCAL_FRONTEND_URL || "http://localhost:3000";

  return fallback.replace(/\/$/, "");
};

module.exports = { FRONTEND_ORIGINS, getFrontendUrl };

const http = require("http");
const https = require("https");

const TARGET =
  process.env.RAILWAY_BACKEND_URL ||
  "https://e-shop-project-production.up.railway.app";

module.exports = async (req, res) => {
  try {
    let path = req.url || "/";
    if (path.startsWith("/api/backend")) {
      path = path.slice("/api/backend".length) || "/";
      if (!path.startsWith("/api/v2")) path = `/api/v2${path}`;
    }

    const target = new URL(path, TARGET);
    const transport = target.protocol === "https:" ? https : http;
    const headers = { ...req.headers, host: target.host };
    delete headers["x-forwarded-host"];
    delete headers["x-vercel-forwarded-host"];

    const upstream = transport.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || undefined,
        method: req.method,
        path: `${target.pathname}${target.search}`,
        headers,
      },
      (upstreamRes) => {
        res.status(upstreamRes.statusCode || 502);
        for (const [key, value] of Object.entries(upstreamRes.headers)) {
          if (value !== undefined) res.setHeader(key, value);
        }
        upstreamRes.pipe(res);
      }
    );

    upstream.on("error", (error) => {
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: "Backend proxy unavailable",
          error: error.message,
        });
      } else {
        res.end();
      }
    });

    req.pipe(upstream);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
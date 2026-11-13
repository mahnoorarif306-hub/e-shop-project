const configuredBackendUrl = process.env.REACT_APP_BACKEND_URL
  ? process.env.REACT_APP_BACKEND_URL.replace(/\/+$/, "")
  : "";

export const server = configuredBackendUrl
  ? configuredBackendUrl.endsWith("/api/v2")
    ? configuredBackendUrl
    : `${configuredBackendUrl}/api/v2`
  : process.env.NODE_ENV === "production"
    ? "https://e-shop-project-production.up.railway.app/api/v2"
    : "http://localhost:8000/api/v2";
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");

const app = express();

const trimOrigin = (origin) => origin?.trim().replace(/\/+$/, "");
const defaultOrigins = [
  "https://my-apps-a8ro.vercel.app",
  "https://my-apps-c9hu.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
]
  .map(trimOrigin)
  .filter(Boolean);
const configuredOrigins = process.env.ALLOWED_ORIGINS?.split(",")
  .map(trimOrigin)
  .filter(Boolean);
const allowedOrigins = new Set(
  configuredOrigins?.length ? configuredOrigins : defaultOrigins,
);

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      const normalized = trimOrigin(incomingOrigin);
      if (!normalized || allowedOrigins.has(normalized)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/users", usersRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

module.exports = app;

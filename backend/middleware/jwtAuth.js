const jwt = require("jsonwebtoken");
const { eq } = require("drizzle-orm");
const { db } = require("../db");
const { users } = require("../db/schema");
const { sanitizeUser } = require("../utils/helpers");

const authenticate = async (req, res, next) => {
  const rawHeader = req.headers.authorization || "";
  const token = rawHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ status: "error", message: "Token tidak ditemukan" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }
    const decoded = jwt.verify(token, secret);
    const [user] = await db.select().from(users).where(eq(users.id, decoded?.data?.id));
    if (!user || user.deleted) {
      return res.status(401).json({ status: "error", message: "User tidak ditemukan atau sudah dinonaktifkan" });
    }
    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Token tidak valid",
      detail: error?.message || "Unauthorized",
    });
  }
};

module.exports = { authenticate };

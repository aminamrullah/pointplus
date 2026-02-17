const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { eq } = require("drizzle-orm");
const { db } = require("../../db");
const { users, stores } = require("../../db/schema");
const { sanitizeUser, buildLogoUrl } = require("../../utils/helpers");

const JWT_SECRET = process.env.JWT_SECRET;

const generateJWT = (user) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    data: {
      id: user.id,
      username: user.username,
      id_toko: user.idToko || user.id_toko,
      package_type: user.packageType,
      is_premium: Boolean(user.isPremium),
      role: user.role,
    },
  };
  return jwt.sign(payload, JWT_SECRET);
};

const loginLogo = async (req, res) => {
  const [store] = await db.select().from(stores);
  const logoUrl = store ? buildLogoUrl(store.logo) : buildLogoUrl(null);
  return res.json({ logo: logoUrl });
};

const login = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const password = req.body.password;
    if (!username || !password) {
      return res.status(400).json({ status: "error", message: "Username dan password harus diisi" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username), eq(users.deleted, 0));

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ status: "error", message: "Username atau password salah" });
    }

    const token = generateJWT(user);
    const sanitizedUser = sanitizeUser(user);
    return res.json({
      success: true,
      status: "success",
      message: "Login berhasil",
      token,
      user: {
        id: sanitizedUser.id,
        id_toko: sanitizedUser.idToko || sanitizedUser.id_toko,
        username: sanitizedUser.username,
        role: sanitizedUser.role,
        nama_lengkap: sanitizedUser.namaLengkap || sanitizedUser.nama_lengkap,
        package_type: sanitizedUser.packageType || sanitizedUser.package_type,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, status: "error", message: "Gagal melakukan login", detail: error.message });
  }
};

const register = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const password = req.body.password;
    const namaLengkap = req.body.nama_lengkap?.trim() || req.body.namaLengkap?.trim();
    if (!username || !password || !namaLengkap) {
      return res.status(400).json({ status: "error", message: "Username, nama lengkap, dan password harus diisi" });
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (existing) {
      return res.status(409).json({ status: "error", message: "Username sudah digunakan" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      username,
      nama_lengkap: namaLengkap,
      password: hashed,
      role: req.body.role || "user",
      email: req.body.email?.trim() || null,
      gender: req.body.gender || "Laki-laki",
      hp: req.body.hp?.trim() || null,
      package_type: req.body.package_type || null,
      is_premium: req.body.is_premium ? 1 : 0,
      deleted: 0,
    });
    return res.status(201).json({ status: "success", message: "User berhasil dibuat" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Gagal mendaftar", detail: error.message });
  }
};

const validateToken = async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const tokenMatch = authHeader.match(/Bearer\s(.+)/);
  const token = tokenMatch?.[1];

  if (!token) {
    return res.status(401).json({ status: "error", message: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [user] = await db.select().from(users).where(eq(users.id, decoded.data.id), eq(users.deleted, 0));
    if (!user) {
      return res.status(401).json({ status: "error", message: "User tidak ditemukan" });
    }
    return res.json({ status: "success", user: sanitizeUser(user) });
  } catch (error) {
    return res.status(401).json({ status: "error", message: "Token tidak valid", detail: error.message });
  }
};

const logout = (req, res) => {
  return res.json({ status: "success", message: "Logout berhasil" });
};

module.exports = {
  login,
  register,
  logout,
  validateToken,
  loginLogo,
};

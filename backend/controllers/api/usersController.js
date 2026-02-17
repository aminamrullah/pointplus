const bcrypt = require("bcryptjs");
const { eq } = require("drizzle-orm");
const { db } = require("../../db");
const { users } = require("../../db/schema");
const { sanitizeUser, parseIdParam } = require("../../utils/helpers");

const createUser = async (req, res) => {
  const username = req.body.username?.trim();
  const password = req.body.password;
  const namaLengkap = req.body.nama_lengkap?.trim() || req.body.namaLengkap?.trim();
  if (!username || !password || !namaLengkap) {
    return res.status(400).json({ message: "Username, nama lengkap, dan password harus diisi" });
  }
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (existing) {
    return res.status(409).json({ message: "Username sudah digunakan" });
  }

  const hashed = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    username,
    password: hashed,
    namaLengkap,
    role: req.body.role || "user",
    email: req.body.email?.trim() || null,
    gender: req.body.gender || "Laki-laki",
    hp: req.body.hp?.trim() || null,
    packageType: req.body.package_type || null,
    isPremium: req.body.is_premium ? 1 : 0,
    deleted: 0,
  });

  return res.status(201).json({ message: "User berhasil ditambahkan" });
};

const listUsers = async (req, res) => {
  const all = await db.select().from(users).where(eq(users.deleted, 0));
  return res.json({ data: all.map(sanitizeUser) });
};

const getUser = async (req, res) => {
  const userId = parseIdParam(req.params.id);
  if (!userId) {
    return res.status(400).json({ message: "ID user tidak valid" });
  }
  const [user] = await db.select().from(users).where(eq(users.id, userId), eq(users.deleted, 0));
  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }
  return res.json({ data: sanitizeUser(user) });
};

const updateUser = async (req, res) => {
  const userId = parseIdParam(req.params.id);
  if (!userId) {
    return res.status(400).json({ message: "ID user tidak valid" });
  }
  const [user] = await db.select().from(users).where(eq(users.id, userId), eq(users.deleted, 0));
  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }
  const changes = {};
  if (req.body.username?.trim()) {
    const normalized = req.body.username.trim();
    const [exists] = await db.select().from(users).where(eq(users.username, normalized));
    if (exists && exists.id !== userId) {
      return res.status(409).json({ message: "Username sudah digunakan" });
    }
    changes.username = normalized;
  }
  if (req.body.nama_lengkap?.trim()) {
    changes.namaLengkap = req.body.nama_lengkap.trim();
  }
  if (req.body.email?.trim()) {
    changes.email = req.body.email.trim();
  }
  if (req.body.gender) {
    changes.gender = req.body.gender;
  }
  if (req.body.role) {
    changes.role = req.body.role;
  }
  if (req.body.hp !== undefined) {
    changes.hp = req.body.hp?.trim() || null;
  }
  if (req.body.package_type !== undefined) {
    changes.packageType = req.body.package_type || null;
  }
  if (req.body.is_premium !== undefined) {
    changes.isPremium = req.body.is_premium ? 1 : 0;
  }
  if (req.body.password) {
    changes.password = await bcrypt.hash(req.body.password, 10);
  }
  if (!Object.keys(changes).length) {
    return res.status(400).json({ message: "Tidak ada data yang diubah" });
  }
  await db.update(users).set(changes).where(eq(users.id, userId));
  const [updated] = await db.select().from(users).where(eq(users.id, userId));
  return res.json({ data: sanitizeUser(updated) });
};

const deleteUser = async (req, res) => {
  const userId = parseIdParam(req.params.id);
  if (!userId) {
    return res.status(400).json({ message: "ID user tidak valid" });
  }
  const [user] = await db.select().from(users).where(eq(users.id, userId), eq(users.deleted, 0));
  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }
  await db.update(users).set({ deleted: 1 }).where(eq(users.id, userId));
  return res.json({ message: "User berhasil dihapus" });
};

module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
};

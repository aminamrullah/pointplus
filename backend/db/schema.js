const {
  mysqlTable,
  serial,
  int,
  varchar,
  text,
  timestamp,
} = require("drizzle-orm/mysql-core");

const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  idToko: int("id_toko").notNull().default(1),
  username: varchar("username", { length: 191 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  namaLengkap: varchar("nama_lengkap", { length: 255 }).notNull().default(""),
  role: varchar("role", { length: 64 }).notNull().default("user"),
  hp: varchar("hp", { length: 32 }),
  packageType: varchar("package_type", { length: 64 }),
  gender: varchar("gender", { length: 32 }).notNull().default("Laki-laki"),
  isPremium: int("is_premium").notNull().default(0),
  deleted: int("deleted").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});


const stores = mysqlTable("stores", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().default("app store"),
  logo: varchar("logo", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

module.exports = {
  users,
  stores,
};

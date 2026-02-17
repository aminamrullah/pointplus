const { drizzle } = require("drizzle-orm/mysql2");
const { pool } = require("./client");
const schema = require("./schema");

const db = drizzle(pool);

const ensureTables = async () => {
  const statements = [
    `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_toko INT NOT NULL DEFAULT 1,
        username VARCHAR(191) NOT NULL UNIQUE,
        email VARCHAR(191),
        password VARCHAR(255) NOT NULL,
        nama_lengkap VARCHAR(255) NOT NULL DEFAULT '',
        role VARCHAR(64) NOT NULL DEFAULT 'user',
        hp VARCHAR(32),
        package_type VARCHAR(64),
        gender VARCHAR(32) NOT NULL DEFAULT 'Laki-laki',
        is_premium TINYINT(1) NOT NULL DEFAULT 0,
        deleted TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_users_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,

    `
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL DEFAULT 'app store',
        logo VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  ];

  for (const statement of statements) {
    await pool.execute(statement);
  }
};

ensureTables().catch((error) => {
  console.error("Failed to synchronize MySQL schema", error);
});

module.exports = { db, pool, schema };

const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  schema: "./src/db/schema.js",
  out: "./src/db/drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
  },
};

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testFailedQuery() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT) || 3306,
        });

        const sql = "select `id`, `username`, `password`, `role`, `hp`, `nama_lengkap`, `created_at`, `updated_at` from `users` where `users`.`username` = ? limit ?";
        const params = ["admin@admin.com", 1];

        console.log("Executing SQL:", sql);
        console.log("With params:", params);

        const [rows] = await connection.execute(sql, params);
        console.log("Success! Rows:", rows);

        await connection.end();
    } catch (error) {
        console.error("Query failed!");
        console.error(error);
    }
}

testFailedQuery();

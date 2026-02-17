import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testConnection() {
    console.log("Testing connection with:");
    console.log("Host:", process.env.DB_HOST);
    console.log("User:", process.env.DB_USER);
    console.log("Database:", process.env.DB_NAME);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: "amrullah_pointplus",
            port: Number(process.env.DB_PORT) || 3306,
        });
        console.log("✅ Connection successful!");

        const [rows]: any = await connection.execute("SELECT * FROM users WHERE username LIKE '%admin%'");
        console.log("Users found:", rows);

        if (rows.length > 0) {
            const bcrypt = require("bcryptjs");
            for (const user of rows) {
                const isMatch = await bcrypt.compare("admin123", user.password);
                console.log(`Password match for ${user.username} ('admin123'):`, isMatch);
            }
        }

        await connection.end();
    } catch (error) {
        console.error("❌ Connection failed!");
        console.error(error);
    }
}

testConnection();

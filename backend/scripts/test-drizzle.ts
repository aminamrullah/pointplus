import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testDrizzle() {
    const connection = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306,
    });

    const db = drizzle(connection);

    try {
        console.log("Testing Drizzle select...");
        const result = await db.select().from(users).where(eq(users.username, "admin@admin.com")).limit(1);
        console.log("Result:", result);
    } catch (error: any) {
        console.error("Drizzle failed!");
        console.error(error.message);
        if (error.cause) console.error("Cause:", error.cause);
    } finally {
        await connection.end();
    }
}

testDrizzle();

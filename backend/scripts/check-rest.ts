import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function checkRest() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT) || 3306,
        });

        const tables = ["kategori", "satuan", "pelanggan", "diskon", "metode_pembayaran", "biaya_lain", "setting"];
        for (const table of tables) {
            const [rows]: any = await connection.execute(`DESCRIBE \`${table}\``);
            console.log(`${table} table structure:`);
            console.table(rows);
        }

        await connection.end();
    } catch (error) {
        console.error(error);
    }
}

checkRest();

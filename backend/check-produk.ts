import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../backend/.env") });

async function checkProduk() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT) || 3306,
        });

        const [rows]: any = await connection.execute("DESCRIBE produk");
        console.log("Produk table structure:");
        console.table(rows);

        await connection.end();
    } catch (error) {
        console.error(error);
    }
}

checkProduk();

import { db } from "./src/db/index.js";
import { produk, kategori } from "./src/db/schema.js";
import { eq, sql } from "drizzle-orm";
import "dotenv/config";

async function check() {
    try {
        console.log("Checking products for store 1...");
        const products = await db.select().from(produk).where(eq(produk.idToko, 1)).limit(5);
        console.log("Products found:", JSON.stringify(products, null, 2));

        const lowStock = await db.select().from(produk).where(sql`CAST(stok AS UNSIGNED) <= 10`).limit(5);
        console.log("Low stock products:", JSON.stringify(lowStock, null, 2));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

check();

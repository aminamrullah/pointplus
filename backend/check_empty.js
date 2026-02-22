import { db } from "./src/db/index.js";
import { produk } from "./src/db/schema.js";
import "dotenv/config";

async function check() {
    try {
        console.log("Checking all products...");
        const products = await db.select().from(produk);
        console.log("Products found count:", products.length);
        const emptyNames = products.filter(p => !p.nama);
        console.log("Products with empty/null names:", JSON.stringify(emptyNames, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

check();

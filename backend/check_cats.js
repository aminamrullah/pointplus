import { db } from "./src/db/index.js";
import { kategori } from "./src/db/schema.js";
import { eq } from "drizzle-orm";
import "dotenv/config";

async function check() {
    try {
        console.log("Checking categories for store 1...");
        const cats = await db.select().from(kategori).where(eq(kategori.idToko, 1));
        console.log("Categories found:", JSON.stringify(cats, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

check();

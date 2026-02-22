import { db } from "./src/db/index.js";
import { produk, kategori } from "./src/db/schema.js";
import { eq, sql, and } from "drizzle-orm";
import "dotenv/config";

async function check() {
    try {
        console.log("Checking join result structure...");
        const products = await db
            .select({
                id: produk.id,
                nama: produk.nama,
                kode_produk: produk.kodeProduk,
                kategori_id: produk.kategori,
                nama_kategori: kategori.namaKategori,
                modal: produk.modal,
                harga: produk.harga,
                stok: produk.stok,
            })
            .from(produk)
            .leftJoin(kategori, eq(sql`CAST(${produk.kategori} AS UNSIGNED)`, kategori.id))
            .where(and(
                sql`CAST(${produk.stok} AS UNSIGNED) <= 10`,
                eq(produk.status, true),
                eq(produk.idToko, 1),
                eq(produk.deleted, false)
            ))
            .limit(1);

        console.log("Result sample:", JSON.stringify(products, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

check();

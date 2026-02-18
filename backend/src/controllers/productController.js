import { db } from "../db/index.js";
import { produk, kategori, satuan } from "../db/schema.js";
import { eq, sql, and } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from "uuid";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require("xlsx-js-style");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const processImageField = (imageInput) => {
    if (!imageInput) return null;

    // Base64 handling
    if (imageInput.startsWith("data:image")) {
        const matches = imageInput.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
            const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
            const buffer = Buffer.from(matches[2], "base64");
            const fileName = `${uuidv4()}.${ext}`;
            const uploadDir = path.join(__dirname, "../../uploads/produk");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            fs.writeFileSync(path.join(uploadDir, fileName), buffer);
            return fileName;
        }
    }

    // Existing URL handling
    if (imageInput.startsWith("http")) {
        const parts = imageInput.split("/");
        return parts[parts.length - 1];
    }

    return imageInput;
};

export const getProducts = async (
    request,
    reply,
) => {
    try {
        const page = parseInt(request.query.page) || 1;
        const perPage = 50;
        const offset = (page - 1) * perPage;
        const user = request.user;
        const id_toko = user.id_toko;

        // Join with kategori and satuan for produk list
        const produkData = await db
            .select({
                id: produk.id,
                nama: produk.nama,
                kategori: produk.kategori,
                nama_kategori: kategori.namaKategori,
                harga: produk.harga,
                modal: produk.modal,
                total_modal: produk.totalModal,
                stok: produk.stok,
                satuan: produk.satuan,
                nama_satuan: satuan.namaSatuan,
                foto: produk.foto,
                barcode: produk.barcode,
                store_barcode: produk.storeBarcode,
                barcode_toko: produk.barcode,
                kode_produk: produk.kodeProduk,
                status: produk.status,
                margin: produk.margin,
                harga_reg: produk.hargaReg,
                harga_post: produk.hargaPost,
                nett_margin: produk.nettMargin,
                diskon: produk.diskon,
            })
            .from(produk)
            .leftJoin(
                kategori,
                eq(sql`CAST(${produk.kategori} AS UNSIGNED)`, kategori.id),
            )
            .leftJoin(satuan, eq(sql`CAST(${produk.satuan} AS UNSIGNED)`, satuan.id))
            .where(and(eq(produk.idToko, id_toko), eq(produk.deleted, false)))
            .limit(perPage)
            .offset(offset);

        // Format foto URL and convert status to 0/1
        const formattedProduk = produkData.map((item) => {
            // Harga display: gunakan harga_post jika tersedia, jika tidak gunakan harga
            const hargaDisplay = item.harga_post
                ? Number(item.harga_post)
                : Number(item.harga);
            // Modal display: gunakan modal yang ada
            const modalDisplay = Number(item.modal);

            return {
                ...item,
                foto: item.foto
                    ? `${process.env.APP_BASE_URL || ""}/uploads/produk/${item.foto}`
                    : null,
                status: item.status ? 1 : 0,
                // Override harga and modal with display values
                harga: hargaDisplay,
                modal: modalDisplay,
            };
        });

        // Get kategori and satuan lists
        const [kategoriList, satuanList] = await Promise.all([
            db.select().from(kategori).where(eq(kategori.idToko, id_toko)),
            db.select().from(satuan).where(eq(satuan.idToko, id_toko)),
        ]);

        return reply.send({
            status: "success",
            data: {
                produk: formattedProduk,
                kategori: kategoriList,
                satuan: satuanList,
            },
            pagination: { page, per_page: perPage },
        });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Internal server error",
            error: error.message,
            cause: error.cause ? error.cause.message || error.cause : undefined,
        });
    }
};

export const createProduct = async (
    request,
    reply,
) => {
    try {
        const data = request.body;
        const user = request.user;
        const id_toko = user.id_toko;

        // Handle photo saving logic
        const fotoFilename = processImageField(data.foto);

        const [result] = await db.insert(produk).values({
            ...data,
            idToko: id_toko,
            foto: fotoFilename,
            harga: data.harga.toString(),
            storeBarcode: data.store_barcode,
            kodeProduk: data.kode_produk,
            totalModal: data.total_modal ? String(data.total_modal) : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return reply.status(201).send({
            status: "success",
            message: "Produk berhasil ditambahkan",
            id: result.insertId,
        });
    } catch (error) {
        request.log.error(error);
        return reply
            .status(500)
            .send({ status: "error", message: "Gagal menambahkan produk" });
    }
};

export const updateProduct = async (
    request,
    reply,
) => {
    try {
        const { id } = request.params;
        const data = request.body;
        const user = request.user;
        const id_toko = user.id_toko;

        // Verify ownership/existence
        const [existing] = await db
            .select()
            .from(produk)
            .where(and(eq(produk.id, parseInt(id)), eq(produk.idToko, id_toko)));
        if (!existing) {
            return reply
                .status(404)
                .send({ status: "error", message: "Produk tidak ditemukan" });
        }

        const updateData = {
            nama: data.nama,
            kategori: data.kategori,
            satuan: data.satuan,
            stok: data.stok,
            harga: data.harga.toString(),
            modal: data.modal?.toString(),
            totalModal: data.total_modal ? String(data.total_modal) : undefined,
            diskon: data.diskon,
            storeBarcode: data.store_barcode,
            barcode: data.barcode,
            kodeProduk: data.kode_produk,
            updatedAt: new Date(),
        };

        // Handle photo update
        if (data.foto) {
            const processedFoto = processImageField(data.foto);
            if (processedFoto) {
                updateData.foto = processedFoto;
            }
        }

        await db
            .update(produk)
            .set(updateData)
            .where(and(eq(produk.id, parseInt(id)), eq(produk.idToko, id_toko)));

        return reply.send({
            status: "success",
            message: "Produk berhasil diperbarui",
            data: { id, ...updateData },
        });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Gagal memperbarui produk",
            error: error.message,
        });
    }
};

export const updateCalculator = async (
    request,
    reply,
) => {
    const { id } = request.params;
    const data = request.body;

    try {
        const updateData = {
            updatedAt: new Date(),
        };

        if (data.harga !== undefined) updateData.harga = String(data.harga);
        if (data.diskon !== undefined) updateData.diskon = String(data.diskon);
        if (data.modal !== undefined) updateData.modal = String(data.modal);
        if (data.margin !== undefined) updateData.margin = String(data.margin);
        if (data.harga_reg !== undefined)
            updateData.hargaReg = String(data.harga_reg);
        if (data.harga_post !== undefined)
            updateData.hargaPost = String(data.harga_post);
        if (data.nett_margin !== undefined)
            updateData.nettMargin = String(data.nett_margin);

        await db
            .update(produk)
            .set(updateData)
            .where(
                and(
                    eq(produk.id, parseInt(id)),
                    eq(produk.idToko, request.user.id_toko),
                ),
            );

        return reply.send({
            status: "success",
            message: "Data kalkulator berhasil diperbarui",
        });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Gagal memperbarui data kalkulator",
            error: error.message,
            details: error.cause ? error.cause.message || error.cause : undefined,
        });
    }
};

export const getReferences = async (
    request,
    reply,
) => {
    try {
        const user = request.user;
        const id_toko = user.id_toko;

        const [kategoriData, satuanData] = await Promise.all([
            db.select().from(kategori).where(eq(kategori.idToko, id_toko)),
            db.select().from(satuan).where(eq(satuan.idToko, id_toko)),
        ]);

        return reply.send({
            status: "success",
            data: {
                kategori: kategoriData,
                satuan: satuanData,
            },
        });
    } catch (error) {
        request.log.error(error);
        return reply
            .status(500)
            .send({ status: "error", message: "Internal server error" });
    }
};

export const lookupProductByStoreBarcode = async (
    request,
    reply,
) => {
    try {
        const { store_barcode } = request.query;
        if (!store_barcode) {
            return reply
                .status(400)
                .send({ status: "error", message: "Barcode toko diperlukan" });
        }

        const user = request.user;
        const id_toko = user.id_toko;

        const [item] = await db
            .select()
            .from(produk)
            .where(
                and(
                    eq(produk.storeBarcode, store_barcode),
                    eq(produk.idToko, id_toko),
                    eq(produk.deleted, false),
                ),
            )
            .limit(1);

        if (!item) {
            return reply
                .status(404)
                .send({ status: "error", message: "Produk tidak ditemukan" });
        }

        return reply.send({ status: "success", data: { produk: item } });
    } catch (error) {
        request.log.error(error);
        return reply
            .status(500)
            .send({ status: "error", message: "Internal server error" });
    }
};

export const updateProductStatus = async (
    request,
    reply,
) => {
    try {
        const { productId, isAvailable } = request.body;
        await db
            .update(produk)
            .set({ status: !!isAvailable, updatedAt: new Date() })
            .where(
                and(
                    eq(produk.id, parseInt(productId)),
                    eq(produk.idToko, request.user.id_toko),
                ),
            );
        return reply.send({
            status: "success",
            message: "Status produk berhasil diperbarui",
        });
    } catch (error) {
        request.log.error(error);
        return reply
            .status(500)
            .send({ status: "error", message: "Gagal memperbarui status produk" });
    }
};

export const softDeleteProduct = async (
    request,
    reply,
) => {
    try {
        const { id } = request.params;
        await db
            .update(produk)
            .set({ deleted: true, updatedAt: new Date() })
            .where(
                and(
                    eq(produk.id, parseInt(id)),
                    eq(produk.idToko, request.user.id_toko),
                ),
            );
        return reply.send({
            status: "success",
            message: "Produk berhasil dihapus",
        });
    } catch (error) {
        request.log.error(error);
        return reply
            .status(500)
            .send({ status: "error", message: "Gagal menghapus produk" });
    }
};

export const importProducts = async (
    request,
    reply,
) => {
    return reply.send({
        status: "success",
        message: "Import functionality not fully implemented yet",
    });
};

export const exportProducts = async (
    request,
    reply,
) => {
    return reply.send({
        status: "success",
        message: "Export functionality not fully implemented yet",
    });
};

export const exportCalculator = async (
    request,
    reply,
) => {
    try {
        const user = request.user;
        const id_toko = user.id_toko;

        const produkData = await db
            .select({
                id: produk.id,
                nama: produk.nama,
                kodeProduk: produk.kodeProduk,
                storeBarcode: produk.storeBarcode,
                barcode: produk.barcode,
                modal: produk.modal,
                harga: produk.harga,
                margin: produk.margin,
                hargaReg: produk.hargaReg,
                hargaPost: produk.hargaPost,
                nettMargin: produk.nettMargin,
                diskon: produk.diskon,
                namaKategori: kategori.namaKategori,
                stok: produk.stok,
                namaSatuan: satuan.namaSatuan,
            })
            .from(produk)
            .leftJoin(
                kategori,
                eq(sql`CAST(${produk.kategori} AS UNSIGNED)`, kategori.id),
            )
            .leftJoin(satuan, eq(sql`CAST(${produk.satuan} AS UNSIGNED)`, satuan.id))
            .where(and(eq(produk.idToko, id_toko), eq(produk.deleted, false)))
            .orderBy(produk.nama);

        const excelData = produkData.map((item) => ({
            Nama: item.nama,
            "Kode Produk": item.kodeProduk || "",
            "Barcode Pabrik": item.storeBarcode || "",
            "Barcode Toko": item.barcode || "",
            Kategori: item.namaKategori || "",
            Satuan: item.namaSatuan || "Pcs",
            Stok: item.stok ? Number(item.stok) : 0,
            "Modal (HPP)": item.modal ? Number(Number(item.modal).toFixed(2)) : 0,
            "Margin %": item.margin ? Number(Number(item.margin).toFixed(2)) : 0,
            "Harga Reguler": item.hargaReg
                ? Number(Number(item.hargaReg).toFixed(2))
                : Number(Number(item.harga).toFixed(2)),
            "Harga Promo": item.hargaPost
                ? Number(Number(item.hargaPost).toFixed(2))
                : Number(Number(item.harga).toFixed(2)),
            "Margin Bersih": item.nettMargin ? Number(Number(item.nettMargin).toFixed(2)) : 0,
            Diskon: item.diskon ? Number(Number(item.diskon).toFixed(2)) : 0,
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const rowNum = R + 1;
            const cellJ = XLSX.utils.encode_cell({ c: 9, r: R });
            if (ws[cellJ]) {
                ws[cellJ].f = `ROUND(H${rowNum}*(1+I${rowNum}/100), 2)`;
                ws[cellJ].s = { fill: { fgColor: { rgb: "FFFFCC" } } };
            }
            const cellK = XLSX.utils.encode_cell({ c: 10, r: R });
            if (ws[cellK]) {
                ws[cellK].f = `J${rowNum}-M${rowNum}`;
                ws[cellK].s = { fill: { fgColor: { rgb: "FFFFCC" } } };
            }
            const cellL = XLSX.utils.encode_cell({ c: 11, r: R });
            if (ws[cellL]) {
                ws[cellL].f = `K${rowNum}-H${rowNum}`;
                ws[cellL].s = { fill: { fgColor: { rgb: "FFFFCC" } } };
            }
        }

        const instructions = [
            ["PETUNJUK PENGISIAN:"],
            ["1. Ubah nilai pada kolom 'Stok', 'Modal (HPP)', 'Margin %', atau 'Diskon'."],
            ["2. Kolom BERWARNA KUNING (Harga Reguler, Promo, Margin Bersih) menggunakan RUMUS OTOMATIS."],
            ["3. JANGAN mengetik manual di kolom berwarna kuning, biarkan Excel menghitungnya."],
            ["4. Untuk menambah produk baru, isi 'Nama' dan data lainnya di baris paling bawah."],
            ["5. Sistem akan membaca Barcode Pabrik/Toko untuk update, atau Nama jika tidak ada barcode."],
        ];

        XLSX.utils.sheet_add_aoa(ws, instructions, { origin: "O2" });

        const wscols = [
            { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
            { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 5 }, { wch: 80 },
        ];
        ws["!cols"] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Kalkulator Produk");
        const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        reply.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        reply.header("Content-Disposition", `attachment; filename="kalkulator_produk_${new Date().toISOString().split("T")[0]}.xlsx"`);

        return reply.send(excelBuffer);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Gagal mengekspor data kalkulator",
            error: error.message,
        });
    }
};

export const importCalculator = async (
    request,
    reply,
) => {
    try {
        const user = request.user;
        const id_toko = user.id_toko;

        const data = await request.file();
        if (!data) return reply.status(400).send({ status: "error", message: "File tidak ditemukan" });

        const buffer = await data.toBuffer();
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

        if (!jsonData || jsonData.length === 0) return reply.status(400).send({ status: "error", message: "File kosong atau format tidak valid" });

        const headers = jsonData[0].map((h) => String(h).trim().toLowerCase());
        const dataRows = jsonData.slice(1);

        const [allCategories, allUnits] = await Promise.all([
            db.select().from(kategori).where(eq(kategori.idToko, id_toko)),
            db.select().from(satuan).where(eq(satuan.idToko, id_toko)),
        ]);

        const categoryMap = new Map();
        allCategories.forEach((c) => categoryMap.set(c.namaKategori.toLowerCase().trim(), c.id));

        const unitMap = new Map();
        allUnits.forEach((u) => unitMap.set(u.namaSatuan.toLowerCase().trim(), u.id));

        const updated = [];
        const inserted = [];
        const errors = [];

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            if (!row || row.length === 0 || row.every((cell) => !cell || String(cell).trim() === "")) continue;

            const values = row.map((cell) => (cell !== undefined && cell !== null) ? String(cell).trim() : "");
            const rowMap = {};
            headers.forEach((header, index) => { rowMap[header] = values[index] || ""; });

            if (!rowMap["nama"] && !rowMap["kode produk"] && !rowMap["barcode"] && !rowMap["barcode pabrik"] && !rowMap["barcode toko"]) continue;

            try {
                const namaIdx = headers.indexOf("nama");
                const kodeProdukIdx = headers.indexOf("kode produk");
                const barcodePabrikIdx = headers.indexOf("barcode pabrik");
                const barcodeTokoIdx = headers.indexOf("barcode toko");
                const barcodeIdx = headers.indexOf("barcode");
                const kategoriIdx = headers.indexOf("kategori");
                const satuanIdx = headers.indexOf("satuan");

                let product = null;
                const searchBarcodePabrik = barcodePabrikIdx >= 0 && values[barcodePabrikIdx] ? values[barcodePabrikIdx] : (barcodeIdx >= 0 && values[barcodeIdx] ? values[barcodeIdx] : null);

                if (searchBarcodePabrik) {
                    [product] = await db.select().from(produk).where(and(eq(produk.storeBarcode, searchBarcodePabrik), eq(produk.idToko, id_toko)));
                }

                const searchBarcodeToko = barcodeTokoIdx >= 0 && values[barcodeTokoIdx] ? values[barcodeTokoIdx] : null;

                if (!product && searchBarcodeToko) {
                    [product] = await db.select().from(produk).where(and(eq(produk.barcode, searchBarcodeToko), eq(produk.idToko, id_toko)));
                }

                if (!product && kodeProdukIdx >= 0 && values[kodeProdukIdx]) {
                    [product] = await db.select().from(produk).where(and(eq(produk.kodeProduk, values[kodeProdukIdx]), eq(produk.idToko, id_toko)));
                }

                if (!product && namaIdx >= 0 && values[namaIdx]) {
                    [product] = await db.select().from(produk).where(and(eq(produk.nama, values[namaIdx]), eq(produk.idToko, id_toko)));
                }

                const stokIdx = headers.indexOf("stok");
                const modalIdx = headers.indexOf("modal (hpp)");
                const marginIdx = headers.indexOf("margin %");
                const hargaRegIdx = headers.indexOf("harga reguler");
                const hargaPromoIdx = headers.indexOf("harga promo");
                const marginBersihIdx = headers.indexOf("margin bersih");
                const diskonIdx = headers.indexOf("diskon");

                const stok = stokIdx >= 0 && values[stokIdx] ? parseInt(values[stokIdx]) : undefined;
                const modal = modalIdx >= 0 && values[modalIdx] ? parseFloat(parseFloat(values[modalIdx]).toFixed(2)) : undefined;
                const margin = marginIdx >= 0 && values[marginIdx] ? parseFloat(parseFloat(values[marginIdx]).toFixed(2)) : undefined;
                const hargaReg = hargaRegIdx >= 0 && values[hargaRegIdx] ? parseFloat(parseFloat(values[hargaRegIdx]).toFixed(2)) : undefined;
                const hargaPost = hargaPromoIdx >= 0 && values[hargaPromoIdx] ? parseFloat(parseFloat(values[hargaPromoIdx]).toFixed(2)) : undefined;
                const nettMargin = marginBersihIdx >= 0 && values[marginBersihIdx] ? parseFloat(parseFloat(values[marginBersihIdx]).toFixed(2)) : undefined;
                const diskon = diskonIdx >= 0 && values[diskonIdx] ? parseFloat(parseFloat(values[diskonIdx]).toFixed(2)) : undefined;

                if (product) {
                    const updateData = { deleted: false, updatedAt: new Date() };
                    if (stok !== undefined && !isNaN(stok)) updateData.stok = String(stok);
                    if (modal !== undefined && !isNaN(modal)) updateData.modal = String(modal);
                    if (margin !== undefined && !isNaN(margin)) updateData.margin = String(margin);
                    if (hargaReg !== undefined && !isNaN(hargaReg)) {
                        updateData.hargaReg = String(hargaReg);
                        updateData.harga = String(hargaReg);
                    }
                    if (hargaPost !== undefined && !isNaN(hargaPost)) updateData.hargaPost = String(hargaPost);
                    if (nettMargin !== undefined && !isNaN(nettMargin)) updateData.nettMargin = String(nettMargin);
                    if (diskon !== undefined && !isNaN(diskon)) updateData.diskon = String(diskon);

                    if (Object.keys(updateData).length > 2) {
                        await db.update(produk).set(updateData).where(eq(produk.id, product.id));
                        updated.push(product.nama);
                    }
                } else {
                    if (namaIdx < 0 || !values[namaIdx]) { errors.push(`Baris ${i + 1}: Nama produk wajib diisi`); continue; }
                    const nama = values[namaIdx];
                    const categoryName = (kategoriIdx >= 0 ? values[kategoriIdx] : "Umum") || "Umum";
                    const normalizedCatName = categoryName.toLowerCase().trim();
                    let categoryId = categoryMap.get(normalizedCatName);
                    if (!categoryId) {
                        const [result] = await db.insert(kategori).values({ namaKategori: categoryName, idToko: id_toko, createdAt: new Date(), updatedAt: new Date() });
                        categoryId = result.insertId;
                        categoryMap.set(normalizedCatName, categoryId);
                    }
                    const unitName = (satuanIdx >= 0 ? values[satuanIdx] : "Pcs") || "Pcs";
                    const normalizedUnitName = unitName.toLowerCase().trim();
                    let unitId = unitMap.get(normalizedUnitName);
                    if (!unitId) {
                        const [result] = await db.insert(satuan).values({ namaSatuan: unitName, idToko: id_toko, createdAt: new Date(), updatedAt: new Date() });
                        unitId = result.insertId;
                        unitMap.set(normalizedUnitName, unitId);
                    }
                    await db.insert(produk).values({
                        idToko: id_toko, nama, kodeProduk: kodeProdukIdx >= 0 ? values[kodeProdukIdx] : "",
                        storeBarcode: searchBarcodePabrik || "", barcode: searchBarcodeToko || "",
                        kategori: String(categoryId), satuan: String(unitId), stok: String(stok || 0),
                        harga: String(hargaReg || 0), modal: String(modal || 0), margin: margin ? String(margin) : undefined,
                        hargaReg: hargaReg ? String(hargaReg) : undefined, hargaPost: hargaPost ? String(hargaPost) : undefined,
                        nettMargin: nettMargin ? String(nettMargin) : undefined, diskon: diskon ? String(diskon) : undefined,
                        status: true, createdAt: new Date(), updatedAt: new Date()
                    });
                    inserted.push(nama);
                }
            } catch (error) { errors.push(`Baris ${i + 1}: ${error.message}`); }
        }
        return reply.send({
            status: "success",
            message: `Data kalkulator berhasil diimpor (${inserted.length} baru, ${updated.length} diperbarui)`,
            data: { updated: updated.length, inserted: inserted.length, errors }
        });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal mengimpor data kalkulator", error: error.message });
    }
};

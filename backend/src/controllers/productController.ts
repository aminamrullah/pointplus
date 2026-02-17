import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db";
import { produk, kategori, satuan } from "../db/schema";
import { eq, sql, and } from "drizzle-orm";
import { ProductInput, UpdateCalculatorInput } from "../schemas/productSchema";
import fs from "fs";
import path from "path";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import * as XLSX from "xlsx-js-style";

const processImageField = (imageInput: string | null | undefined): string | null => {
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
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const page = parseInt((request.query as any).page) || 1;
    const perPage = 50;
    const offset = (page - 1) * perPage;
    const user = request.user as any;
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
    // Apply affiliate logic: use harga_post if available (for display pricing)
    // and modal with affiliate logic
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
          ? `${process.env.APP_BASE_URL}/uploads/produk/${item.foto}`
          : null,
        status: item.status ? 1 : 0,
        // Override harga and modal with display values (applying affiliate logic)
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
  } catch (error: any) {
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
  request: FastifyRequest<{ Body: ProductInput }>,
  reply: FastifyReply,
) => {
  try {
    const data = request.body;
    const user = request.user as any;
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
    } as any);

    return reply.status(201).send({
      status: "success",
      message: "Produk berhasil ditambahkan",
      id: (result as any).insertId,
    });
  } catch (error) {
    request.log.error(error);
    return reply
      .status(500)
      .send({ status: "error", message: "Gagal menambahkan produk" });
  }
};

export const updateProduct = async (
  request: FastifyRequest<{ Params: { id: string }; Body: ProductInput }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;
    const data = request.body;
    const user = request.user as any;
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

    const updateData: any = {
      nama: data.nama,
      kategori: data.kategori,
      satuan: data.satuan,
      stok: data.stok,
      harga: data.harga.toString(),
      modal: data.modal?.toString(),
      totalModal: data.total_modal ? String(data.total_modal) : undefined,
      diskon: data.diskon,
      storeBarcode: data.store_barcode,
      barcode: data.barcode, // This might be mapped to barcode_toko in some inputs, but schema has 'barcode'
      kodeProduk: data.kode_produk,
      updatedAt: new Date(),
    };

    // Only update photo if a new one is provided (and it's not null/empty string if we want to keep existing)
    // Adjust logic based on how frontend sends it. If frontend sends existing URL, we typically ignore or handle it.
    // Assuming if data.foto is base64 string, we update. If it's URL, we usually keep it.
    // For simplicity matching create:
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
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({
      status: "error",
      message: "Gagal memperbarui produk",
      error: error.message,
    });
  }
};

export const updateCalculator = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateCalculatorInput;
  }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;
  const data = request.body;

  try {
    const updateData: any = {
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

    const result = await db
      .update(produk)
      .set(updateData)
      .where(
        and(
          eq(produk.id, parseInt(id)),
          eq(produk.idToko, (request.user as any).id_toko),
        ),
      );

    return reply.send({
      status: "success",
      message: "Data kalkulator berhasil diperbarui",
    });
  } catch (error: any) {
    request.log.error(error);
    request.log.error("Update data:", data);
    request.log.error("Product ID:", id);
    request.log.error("User ID Toko:", (request.user as any)?.id_toko);
    return reply.status(500).send({
      status: "error",
      message: "Gagal memperbarui data kalkulator",
      error: error.message,
      details: error.cause ? error.cause.message || error.cause : undefined,
    });
  }
};

export const getReferences = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const user = request.user as any;
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
  } catch (error: any) {
    request.log.error(error);
    return reply
      .status(500)
      .send({ status: "error", message: "Internal server error" });
  }
};

export const lookupProductByStoreBarcode = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { store_barcode } = request.query as any;
    if (!store_barcode) {
      return reply
        .status(400)
        .send({ status: "error", message: "Barcode toko diperlukan" });
    }

    const user = request.user as any;
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
  } catch (error: any) {
    request.log.error(error);
    return reply
      .status(500)
      .send({ status: "error", message: "Internal server error" });
  }
};

export const updateProductStatus = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { productId, isAvailable } = request.body as any;
    await db
      .update(produk)
      .set({ status: !!isAvailable, updatedAt: new Date() })
      .where(
        and(
          eq(produk.id, parseInt(productId)),
          eq(produk.idToko, (request.user as any).id_toko),
        ),
      );
    return reply.send({
      status: "success",
      message: "Status produk berhasil diperbarui",
    });
  } catch (error: any) {
    request.log.error(error);
    return reply
      .status(500)
      .send({ status: "error", message: "Gagal memperbarui status produk" });
  }
};

export const softDeleteProduct = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as any;
    await db
      .update(produk)
      .set({ deleted: true, updatedAt: new Date() })
      .where(
        and(
          eq(produk.id, parseInt(id)),
          eq(produk.idToko, (request.user as any).id_toko),
        ),
      );
    return reply.send({
      status: "success",
      message: "Produk berhasil dihapus",
    });
  } catch (error: any) {
    request.log.error(error);
    return reply
      .status(500)
      .send({ status: "error", message: "Gagal menghapus produk" });
  }
};

export const importProducts = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  // Placeholder for import logic.
  return reply.send({
    status: "success",
    message: "Import functionality not fully implemented yet",
  });
};

export const exportProducts = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  // Placeholder for export logic.
  return reply.send({
    status: "success",
    message: "Export functionality not fully implemented yet",
  });
};
export const exportCalculator = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const user = request.user as any;
    const id_toko = user.id_toko;

    const produkData = await db
      .select({
        id: produk.id,
        nama: produk.nama,
        kodeProduk: produk.kodeProduk,
        storeBarcode: produk.storeBarcode, // Barcode Pabrik
        barcode: produk.barcode, // Barcode Toko
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

    // Format data untuk Excel
    const excelData = produkData.map((item) => ({
      Nama: item.nama,
      "Kode Produk": item.kodeProduk || "",
      "Barcode Pabrik": item.storeBarcode || "",
      "Barcode Toko": item.barcode || "", // Internal barcode
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

    // Convert to Excel Buffer using XLSX
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add Formulas to cells
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    // Row 0 is header. Data starts at Row 1 (Excel Row 2).
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const rowNum = R + 1;

      // Columns Mapping (0-based index):
      // 0:A, 1:B, 2:C, 3:D, 4:E, 5:F
      // 6:G (Stok), 7:H (Modal), 8:I (Margin %), 9:J (Harga Reguler), 10:K (Harga Promo), 11:L (Margin Bersih), 12:M (Diskon)

      // J (Harga Reguler) = ROUND(H * (1 + I/100), 2)
      const cellJ = XLSX.utils.encode_cell({ c: 9, r: R });
      if (ws[cellJ]) {
        ws[cellJ].f = `ROUND(H${rowNum}*(1+I${rowNum}/100), 2)`;
        ws[cellJ].s = { fill: { fgColor: { rgb: "FFFFCC" } } }; // Light Yellow
      }

      // K (Harga Promo) = J - M
      const cellK = XLSX.utils.encode_cell({ c: 10, r: R });
      if (ws[cellK]) {
        ws[cellK].f = `J${rowNum}-M${rowNum}`;
        ws[cellK].s = { fill: { fgColor: { rgb: "FFFFCC" } } }; // Light Yellow
      }

      // L (Margin Bersih) = K - H
      const cellL = XLSX.utils.encode_cell({ c: 11, r: R });
      if (ws[cellL]) {
        ws[cellL].f = `K${rowNum}-H${rowNum}`;
        ws[cellL].s = { fill: { fgColor: { rgb: "FFFFCC" } } }; // Light Yellow
      }
    }

    // Add Instructions (Petunjuk Pengisian)
    const instructions = [
      ["PETUNJUK PENGISIAN:"],
      ["1. Ubah nilai pada kolom 'Stok', 'Modal (HPP)', 'Margin %', atau 'Diskon'."],
      ["2. Kolom BERWARNA KUNING (Harga Reguler, Promo, Margin Bersih) menggunakan RUMUS OTOMATIS."],
      ["3. JANGAN mengetik manual di kolom berwarna kuning, biarkan Excel menghitungnya."],
      ["4. Untuk menambah produk baru, isi 'Nama' dan data lainnya di baris paling bawah."],
      ["5. Sistem akan membaca Barcode Pabrik/Toko untuk update, atau Nama jika tidak ada barcode."],
    ];

    XLSX.utils.sheet_add_aoa(ws, instructions, { origin: "O2" });

    // Set Column Widths
    const wscols = [
      { wch: 20 }, // A: Nama
      { wch: 15 }, // B: Kode
      { wch: 15 }, // C: Barcode P
      { wch: 15 }, // D: Barcode T
      { wch: 15 }, // E: Kategori
      { wch: 8 },  // F: Satuan
      { wch: 8 },  // G: Stok
      { wch: 12 }, // H: Modal
      { wch: 10 }, // I: Margin
      { wch: 12 }, // J: Harga Reg
      { wch: 12 }, // K: Harga Promo
      { wch: 12 }, // L: Margin Bersih
      { wch: 12 }, // M: Diskon
      { wch: 5 },  // N: Empty
      { wch: 80 }, // O: Instructions
    ];
    ws["!cols"] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kalkulator Produk");

    // Write to buffer
    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    reply.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    reply.header(
      "Content-Disposition",
      `attachment; filename="kalkulator_produk_${new Date().toISOString().split("T")[0]}.xlsx"`,
    );

    return reply.send(excelBuffer);
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({
      status: "error",
      message: "Gagal mengekspor data kalkulator",
      error: error.message,
    });
  }
};

export const importCalculator = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const user = request.user as any;
    const id_toko = user.id_toko;

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({
        status: "error",
        message: "File tidak ditemukan",
      });
    }

    const buffer = await data.toBuffer();

    // Parse using XLSX which handles both CSV and Excel formats
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON array of arrays (header: 1) to easily process headers and rows
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];

    if (!jsonData || jsonData.length === 0) {
      return reply.status(400).send({
        status: "error",
        message: "File kosong atau format tidak valid",
      });
    }

    // First row is header
    const headers = (jsonData[0] as string[]).map((h) => String(h).trim().toLowerCase());
    const dataRows = jsonData.slice(1);

    const [allCategories, allUnits] = await Promise.all([
      db.select().from(kategori).where(eq(kategori.idToko, id_toko)),
      db.select().from(satuan).where(eq(satuan.idToko, id_toko)),
    ]);

    const categoryMap = new Map<string, number>();
    allCategories.forEach((c) =>
      categoryMap.set(c.namaKategori.toLowerCase().trim(), c.id),
    );

    const unitMap = new Map<string, number>();
    allUnits.forEach((u) =>
      unitMap.set(u.namaSatuan.toLowerCase().trim(), u.id),
    );

    const updated = [];
    const inserted = [];
    const errors = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      // Skip empty rows
      if (!row || row.length === 0 || row.every((cell: any) => !cell || String(cell).trim() === "")) continue;

      const values = row.map((cell: any) => (cell !== undefined && cell !== null) ? String(cell).trim() : "");

      // Create a map for easier lookup by header name
      const rowMap: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowMap[header] = values[index] || "";
      });

      if (!rowMap["nama"] && !rowMap["kode produk"] && !rowMap["barcode"] && !rowMap["barcode pabrik"] && !rowMap["barcode toko"]) {
        continue;
      }

      try {
        const namaIdx = headers.indexOf("nama");
        const kodeProdukIdx = headers.indexOf("kode produk");

        // Handle barcode columns (generic, factory, store)
        const barcodeIdx = headers.indexOf("barcode");
        const barcodePabrikIdx = headers.indexOf("barcode pabrik");
        const barcodeTokoIdx = headers.indexOf("barcode toko");

        const kategoriIdx = headers.indexOf("kategori");
        const satuanIdx = headers.indexOf("satuan");

        let product = null;

        // Try to find existing product by Barcode Pabrik (storeBarcode)
        const searchBarcodePabrik = barcodePabrikIdx >= 0 && values[barcodePabrikIdx]
          ? values[barcodePabrikIdx]
          : (barcodeIdx >= 0 && values[barcodeIdx] ? values[barcodeIdx] : null);

        if (searchBarcodePabrik) {
          const [found] = await db
            .select()
            .from(produk)
            .where(
              and(
                eq(produk.storeBarcode, searchBarcodePabrik),
                eq(produk.idToko, id_toko),
              ),
            );
          product = found;
        }

        // Try to find existing product by Barcode Toko (barcode)
        const searchBarcodeToko = barcodeTokoIdx >= 0 && values[barcodeTokoIdx] ? values[barcodeTokoIdx] : null;

        if (!product && searchBarcodeToko) {
          const [found] = await db
            .select()
            .from(produk)
            .where(
              and(
                eq(produk.barcode, searchBarcodeToko),
                eq(produk.idToko, id_toko),
              ),
            );
          product = found;
        }

        if (!product && kodeProdukIdx >= 0 && values[kodeProdukIdx]) {
          const [found] = await db
            .select()
            .from(produk)
            .where(
              and(
                eq(produk.kodeProduk, values[kodeProdukIdx]),
                eq(produk.idToko, id_toko),
              ),
            );
          product = found;
        }

        if (!product && namaIdx >= 0 && values[namaIdx]) {
          const [found] = await db
            .select()
            .from(produk)
            .where(
              and(eq(produk.nama, values[namaIdx]), eq(produk.idToko, id_toko)),
            );
          product = found;
        }

        // Prepare data values
        const stokIdx = headers.indexOf("stok");
        const modalIdx = headers.indexOf("modal (hpp)");
        const marginIdx = headers.indexOf("margin %");
        const hargaRegIdx = headers.indexOf("harga reguler");
        const hargaPromoIdx = headers.indexOf("harga promo");
        const marginBersihIdx = headers.indexOf("margin bersih");
        const diskonIdx = headers.indexOf("diskon");

        const stok =
          stokIdx >= 0 && values[stokIdx]
            ? parseInt(values[stokIdx])
            : undefined;
        const modal =
          modalIdx >= 0 && values[modalIdx]
            ? parseFloat(parseFloat(values[modalIdx]).toFixed(2))
            : undefined;
        const margin =
          marginIdx >= 0 && values[marginIdx]
            ? parseFloat(parseFloat(values[marginIdx]).toFixed(2))
            : undefined;
        const hargaReg =
          hargaRegIdx >= 0 && values[hargaRegIdx]
            ? parseFloat(parseFloat(values[hargaRegIdx]).toFixed(2))
            : undefined;
        const hargaPost =
          hargaPromoIdx >= 0 && values[hargaPromoIdx]
            ? parseFloat(parseFloat(values[hargaPromoIdx]).toFixed(2))
            : undefined;
        const nettMargin =
          marginBersihIdx >= 0 && values[marginBersihIdx]
            ? parseFloat(parseFloat(values[marginBersihIdx]).toFixed(2))
            : undefined;
        const diskon =
          diskonIdx >= 0 && values[diskonIdx]
            ? parseFloat(parseFloat(values[diskonIdx]).toFixed(2))
            : undefined;

        if (product) {
          // UPDATE Existing Product
          const updateData: any = {
            deleted: false,
            updatedAt: new Date(),
          };

          if (stok !== undefined && !isNaN(stok)) updateData.stok = String(stok);
          if (modal !== undefined && !isNaN(modal))
            updateData.modal = String(modal);
          if (margin !== undefined && !isNaN(margin))
            updateData.margin = String(margin);
          if (hargaReg !== undefined && !isNaN(hargaReg)) {
            updateData.hargaReg = String(hargaReg);
            updateData.harga = String(hargaReg); // Base price usually follows reg price
          }
          if (hargaPost !== undefined && !isNaN(hargaPost))
            updateData.hargaPost = String(hargaPost);
          if (nettMargin !== undefined && !isNaN(nettMargin))
            updateData.nettMargin = String(nettMargin);
          if (diskon !== undefined && !isNaN(diskon))
            updateData.diskon = String(diskon);

          if (Object.keys(updateData).length > 1) {
            await db
              .update(produk)
              .set(updateData)
              .where(eq(produk.id, product.id));
            updated.push(product.nama);
          }
        } else {
          // CREATE New Product
          // Require Name
          if (namaIdx < 0 || !values[namaIdx]) {
            errors.push(`Baris ${i + 1}: Nama produk wajib diisi untuk produk baru`);
            continue;
          }

          const nama = values[namaIdx];
          const kodeProduk = kodeProdukIdx >= 0 ? values[kodeProdukIdx] : "";

          // Use specific barcode values if available
          const barcodePabrikValue = searchBarcodePabrik || "";
          const barcodeTokoValue = searchBarcodeToko || "";

          // Resolve Category
          let categoryId = 1; // Default fallback if really undefined? Using 1 might be risky if not exists.
          // Better logic: Find first existing category or create "Uncategorized"

          const categoryNameRaw = kategoriIdx >= 0 ? values[kategoriIdx] : "Umum";
          const categoryName = categoryNameRaw || "Umum";
          const normalizedCatName = categoryName.toLowerCase().trim();

          if (categoryMap.has(normalizedCatName)) {
            categoryId = categoryMap.get(normalizedCatName)!;
          } else {
            // Create new category
            const [result] = await db.insert(kategori).values({
              namaKategori: categoryName,
              idToko: id_toko,
              createdAt: new Date(),
              updatedAt: new Date()
            } as any);
            categoryId = (result as any).insertId;
            categoryMap.set(normalizedCatName, categoryId);
          }

          // Resolve Unit
          let unitId = 1;
          const unitNameRaw = satuanIdx >= 0 ? values[satuanIdx] : "Pcs";
          const unitName = unitNameRaw || "Pcs";
          const normalizedUnitName = unitName.toLowerCase().trim();

          if (unitMap.has(normalizedUnitName)) {
            unitId = unitMap.get(normalizedUnitName)!;
          } else {
            // Create new unit
            const [result] = await db.insert(satuan).values({
              namaSatuan: unitName,
              idToko: id_toko,
              createdAt: new Date(),
              updatedAt: new Date()
            } as any);
            unitId = (result as any).insertId;
            unitMap.set(normalizedUnitName, unitId);
          }

          // Insert Product
          const insertData: any = {
            idToko: id_toko,
            nama,
            kodeProduk,
            storeBarcode: barcodePabrikValue,
            barcode: barcodeTokoValue,
            kategori: String(categoryId),
            satuan: String(unitId),
            stok: stok !== undefined && !isNaN(stok) ? String(stok) : "0",
            harga: hargaReg !== undefined ? String(hargaReg) : "0",
            modal: modal !== undefined ? String(modal) : "0",
            margin: margin !== undefined ? String(margin) : undefined,
            hargaReg: hargaReg !== undefined ? String(hargaReg) : undefined,
            hargaPost: hargaPost !== undefined ? String(hargaPost) : undefined,
            nettMargin: nettMargin !== undefined ? String(nettMargin) : undefined,
            diskon: diskon !== undefined ? String(diskon) : undefined,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await db.insert(produk).values(insertData);
          inserted.push(nama);
        }
      } catch (error: any) {
        errors.push(`Baris ${i + 1}: ${error.message}`);
      }
    }

    return reply.send({
      status: "success",
      message: `Data kalkulator berhasil diimpor (${inserted.length} baru, ${updated.length} diperbarui)`,
      data: {
        updated: updated.length,
        inserted: inserted.length,
        errors,
      },
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({
      status: "error",
      message: "Gagal mengimpor data kalkulator",
      error: error.message,
    });
  }
};

import { mysqlTable, serial, varchar, text, datetime, decimal, int, mysqlEnum, float, boolean, double, timestamp, bigint, date } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    username: varchar("username", { length: 50 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["superadmin", "admin", "admintoko", "kasir"]).notNull(),
    hp: varchar("hp", { length: 50 }).notNull(),
    namaLengkap: varchar("nama_lengkap", { length: 100 }).notNull(),
    isPremium: double("is_premium").notNull().default(0),
    roleId: int("role_id"),
    packageType: mysqlEnum("package_type", ["free", "silver", "gold"]).notNull().default("free"),
    deleted: boolean("deleted").default(false),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const kategori = mysqlTable("kategori", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    namaKategori: varchar("nama_kategori", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 50 }),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const produk = mysqlTable("produk", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    kodeProduk: varchar("kode_produk", { length: 255 }),
    storeBarcode: varchar("store_barcode", { length: 255 }),
    barcode: varchar("barcode_toko", { length: 255 }),
    nama: varchar("nama", { length: 100 }).notNull(),
    kategori: varchar("kategori", { length: 50 }).notNull(),
    harga: varchar("harga", { length: 100 }).notNull(),
    modal: varchar("modal", { length: 100 }).notNull(),
    totalModal: varchar("total_modal", { length: 100 }),
    margin: decimal("margin", { precision: 20, scale: 6 }),
    hargaReg: decimal("harga_reg", { precision: 20, scale: 6 }),
    hargaPost: decimal("harga_post", { precision: 20, scale: 6 }),
    nettMargin: decimal("nett_margin", { precision: 20, scale: 6 }),
    diskon: varchar("diskon", { length: 100 }),
    foto: varchar("foto", { length: 100 }),
    stok: varchar("stok", { length: 100 }).notNull(),
    satuan: varchar("satuan", { length: 10 }).notNull(),
    status: boolean("status").default(true),
    deleted: boolean("deleted").default(false),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const order = mysqlTable("order", {
    id: serial("id").primaryKey(),
    idUser: int("id_user").notNull(),
    idToko: int("id_toko").notNull().default(1),
    uuidOrder: varchar("uuid_order", { length: 80 }).notNull(),
    kodeOrder: varchar("kode_order", { length: 50 }).notNull(),
    idPelanggan: int("id_pelanggan").notNull(),
    subTotal: decimal("sub_total", { precision: 30, scale: 0 }).notNull(),
    diskon: decimal("diskon", { precision: 30, scale: 0 }).notNull(),
    biayaLayanan: decimal("biaya_layanan", { precision: 30, scale: 0 }).notNull(),
    ppn: decimal("ppn", { precision: 30, scale: 0 }).notNull(),
    total: decimal("total", { precision: 30, scale: 0 }).notNull(),
    pembayaran: varchar("pembayaran", { length: 100 }).notNull(),
    uangDibayar: decimal("uang_dibayar", { precision: 30, scale: 0 }).default("0"),
    kembalian: decimal("kembalian", { precision: 30, scale: 0 }).default("0"),
    tanggal: datetime("tanggal").notNull(),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const orderItems = mysqlTable("order_items", {
    id: serial("id").primaryKey(),
    idOrder: int("id_order").notNull(),
    kodeOrder: varchar("kode_order", { length: 50 }).notNull(),
    idProduk: int("id_produk").notNull(),
    quantity: int("quantity").notNull(),
    harga: varchar("harga", { length: 100 }).notNull(),
    hargaTotal: varchar("harga_total", { length: 100 }).notNull(),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const pelanggan = mysqlTable("pelanggan", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    kategoriId: int("kategori_id"),
    nama: varchar("nama", { length: 100 }).notNull(),
    hp: varchar("hp", { length: 100 }).notNull(),
    deleted: boolean("deleted").default(false),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const diskon = mysqlTable("diskon", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    nama: varchar("nama", { length: 100 }).notNull(),
    tipe: mysqlEnum("tipe", ["harga", "persen"]).notNull(),
    jumlah: varchar("jumlah", { length: 100 }).notNull(),
    status: boolean("status").default(true),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const pemasukan = mysqlTable("pemasukan", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    kategori: varchar("kategori", { length: 100 }).notNull(),
    total: varchar("total", { length: 100 }).notNull(),
    foto: varchar("foto", { length: 100 }),
    catatan: text("catatan"),
    idPelanggan: varchar("id_pelanggan", { length: 100 }),
    tanggal: datetime("tanggal"),
    deleted: boolean("deleted").default(false),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const pengeluaran = mysqlTable("pengeluaran", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    kategori: varchar("kategori", { length: 100 }).notNull(),
    total: varchar("total", { length: 100 }).notNull(),
    foto: varchar("foto", { length: 100 }),
    catatan: text("catatan"),
    idPelanggan: varchar("id_pelanggan", { length: 100 }),
    tanggal: datetime("tanggal"),
    deleted: boolean("deleted").default(false),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const biayaLain = mysqlTable("biaya_lain", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    type: mysqlEnum("type", ["ppn", "biaya_layanan"]).notNull(),
    value: float("value").notNull(),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const metodePembayaran = mysqlTable("metode_pembayaran", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    namaMetode: varchar("nama_metode", { length: 255 }).notNull(),
    tipe: mysqlEnum("tipe", ["cash", "wallet", "transfer"]).notNull(),
    gambar: varchar("gambar", { length: 255 }),
    status: boolean("status").default(true),
    deleted: boolean("deleted").default(false),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});

export const setting = mysqlTable("setting", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    nama: varchar("nama", { length: 100 }).notNull(),
    hp: varchar("hp", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).notNull(),
    alamat: varchar("alamat", { length: 100 }).notNull(),
    foto: varchar("foto", { length: 100 }).notNull(),
    deskripsi: varchar("deskripsi", { length: 100 }),
    catatankaki: varchar("catatankaki", { length: 100 }),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const reward = mysqlTable("reward", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    jumlah: varchar("jumlah", { length: 100 }).notNull(),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const satuan = mysqlTable("satuan", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    namaSatuan: varchar("nama_satuan", { length: 100 }).notNull(),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const bahanBaku = mysqlTable("bahan_baku", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    namaBahan: varchar("nama_bahan", { length: 100 }).notNull(),
    harga: varchar("harga", { length: 100 }).notNull(),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const piutang = mysqlTable("piutang", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    pelanggan: varchar("pelanggan", { length: 100 }).notNull(),
    total: varchar("total", { length: 100 }).notNull(),
    foto: varchar("foto", { length: 100 }),
    catatan: text("catatan"),
    tempo: datetime("tempo"),
    tanggal: datetime("tanggal"),
    status: int("status").notNull().default(0),
    deleted: boolean("deleted").default(false),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const utang = mysqlTable("utang", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    pelanggan: varchar("pelanggan", { length: 100 }).notNull(),
    total: varchar("total", { length: 100 }).notNull(),
    foto: varchar("foto", { length: 100 }),
    catatan: text("catatan"),
    tempo: datetime("tempo"),
    tanggal: datetime("tanggal"),
    status: int("status").notNull().default(0),
    deleted: boolean("deleted").default(false),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const kategoriCustomer = mysqlTable("kategori_customer", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    nama: varchar("nama", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const supliers = mysqlTable("supliers", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").default(1),
    namaSupplier: varchar("nama_supplier", { length: 100 }).notNull(),
    alamat: varchar("alamat", { length: 50 }).notNull(),
    hp: varchar("hp", { length: 50 }).notNull(),
    email: varchar("email", { length: 50 }).notNull(),
    keterangan: text("keterangan").notNull(),
    status: mysqlEnum("status", ["aktif", "non_aktif"]).default("aktif").notNull(),
    foto: varchar("foto", { length: 255 }),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const supplierPurchases = mysqlTable("supplier_purchases", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").default(1),
    supplierId: int("supplier_id").notNull(),
    tanggal: datetime("tanggal").notNull(),
    nomorFaktur: varchar("nomor_faktur", { length: 100 }).notNull(),
    nomorSo: varchar("nomor_so", { length: 100 }).notNull(),
    nomorPo: varchar("nomor_po", { length: 100 }).notNull(),
    salesman: varchar("salesman", { length: 100 }).notNull(),
    gudang: varchar("gudang", { length: 100 }).notNull(),
    subtotal: decimal("subtotal", { precision: 20, scale: 2 }).default("0.00").notNull(),
    total: decimal("total", { precision: 20, scale: 2 }).default("0.00").notNull(),
    paidAmount: decimal("paid_amount", { precision: 20, scale: 2 }).default("0.00").notNull(),
    status: mysqlEnum("status", ["unpaid", "partial", "paid"]).default("unpaid").notNull(),
    catatan: text("catatan"),
    entryDate: datetime("entry_date"),
    paymentMethod: mysqlEnum("payment_method", ["CASH", "TOP"]).default("CASH"),
    topDays: int("top_days"),
    notes: text("notes"),
    deleted: boolean("deleted").default(false),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const supplierPurchaseItems = mysqlTable("supplier_purchase_items", {
    id: serial("id").primaryKey(),
    purchaseId: int("purchase_id").notNull(),
    idToko: int("id_toko").default(1),
    productId: int("product_id"),
    sku: varchar("sku", { length: 100 }).notNull(),
    kodeProduk: varchar("kode_produk", { length: 150 }),
    namaProduk: varchar("nama_produk", { length: 200 }).notNull(),
    quantity: int("quantity").default(0).notNull(),
    harga: decimal("harga", { precision: 20, scale: 2 }).default("0.00").notNull(),
    modal: decimal("modal", { precision: 20, scale: 6 }).default("0.000000").notNull(),
    totalModal: decimal("total_modal", { precision: 20, scale: 6 }).default("0.000000").notNull(),
    subtotal: decimal("subtotal", { precision: 20, scale: 2 }).default("0.00").notNull(),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const supplierPayments = mysqlTable("supplier_payments", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull(),
    purchaseId: int("purchase_id").notNull(),
    amount: varchar("amount", { length: 100 }).notNull(),
    paymentMethod: varchar("payment_method", { length: 100 }).default("CASH").notNull(),
    buktiPembayaran: varchar("bukti_pembayaran", { length: 255 }),
    notes: text("notes").notNull(),
    paidAt: datetime("paid_at").notNull(),
    createdAt: datetime("created_at").notNull(),
    updatedAt: datetime("updated_at").notNull(),
});

export const supplierDeliveries = mysqlTable("supplier_deliveries", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull(),
    supplierId: int("supplier_id").notNull(),
    productId: int("product_id").notNull(),
    invoiceNumber: varchar("invoice_number", { length: 150 }).notNull(),
    entryDate: datetime("entry_date").notNull(),
    quantity: int("quantity").notNull(),
    totalValue: decimal("total_value", { precision: 15, scale: 2 }).default("0.00").notNull(),
    unitCost: decimal("unit_cost", { precision: 15, scale: 2 }).default("0.00").notNull(),
    averageCost: decimal("average_cost", { precision: 15, scale: 2 }).default("0.00").notNull(),
    paymentMethod: mysqlEnum("payment_method", ["CASH", "TOP"]).default("CASH").notNull(),
    topDays: int("top_days"),
    stockAfter: int("stock_after").default(0).notNull(),
    modalAfter: decimal("modal_after", { precision: 15, scale: 2 }).default("0.00").notNull(),
    totalValueAfter: decimal("total_value_after", { precision: 17, scale: 2 }).default("0.00").notNull(),
    sellingPriceAfter: decimal("selling_price_after", { precision: 15, scale: 2 }).default("0.00").notNull(),
    notes: text("notes"),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const userPermissions = mysqlTable("user_permissions", {
    id: serial("id").primaryKey(),
    userId: int("user_id").notNull(),
    permission: varchar("permission", { length: 255 }).notNull(),
    idToko: int("id_toko").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});

export const storePp = mysqlTable("store_pp", {
    id: serial("id").primaryKey(),
    namaToko: varchar("nama_toko", { length: 50 }).notNull(),
    logo: varchar("logo", { length: 50 }).notNull(),
    deskripsi: varchar("deskripsi", { length: 50 }).notNull(),
    packageType: mysqlEnum("package_type", ["free", "silver", "gold"]).notNull().default("free"),
});

export const warehouses = mysqlTable("warehouses", {
    id: serial("id").primaryKey(),
    namaGudang: varchar("nama_gudang", { length: 100 }).notNull(),
    lokasi: varchar("lokasi", { length: 50 }).notNull(),
    hp: varchar("hp", { length: 50 }).notNull(),
    email: varchar("email", { length: 50 }).notNull(),
    keterangan: text("keterangan").notNull(),
    status: boolean("status").default(true).notNull(),
    foto: varchar("foto", { length: 255 }),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const kategoriCatatan = mysqlTable("kategori_catatan", {
    id: serial("id").primaryKey(),
    idToko: int("id_toko").notNull().default(1),
    nama: varchar("nama", { length: 100 }).notNull(),
    jenis: varchar("jenis", { length: 100 }).notNull(),
});

export const features = mysqlTable("features", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    key: varchar("key", { length: 100 }).notNull().unique(), // e.g., 'report_export'
    description: text("description"),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const planFeatures = mysqlTable("plan_features", {
    id: serial("id").primaryKey(),
    plan: mysqlEnum("plan", ["free", "silver", "gold"]).notNull(),
    featureId: int("feature_id").notNull(),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

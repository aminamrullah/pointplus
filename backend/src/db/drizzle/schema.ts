import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, datetime, mysqlEnum, float, text, timestamp, index, foreignKey, decimal, date, double } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const asetJual = mysqlTable("aset_jual", {
	id: int().autoincrement().notNull(),
	nama: varchar({ length: 100 }).notNull(),
	harga: varchar({ length: 100 }).notNull(),
	jumlah: varchar({ length: 100 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const asetModal = mysqlTable("aset_modal", {
	id: int().autoincrement().notNull(),
	idUser: int("id_user").notNull(),
	nama: varchar({ length: 100 }).notNull(),
	harga: int().notNull(),
	jumlah: int().notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const bahanBaku = mysqlTable("bahan_baku", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	namaBahan: varchar("nama_bahan", { length: 100 }).notNull(),
	harga: varchar({ length: 100 }).notNull(),
	jumlah: int().notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const biayaLain = mysqlTable("biaya_lain", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	type: mysqlEnum(['ppn','biaya_layanan']).notNull(),
	value: float().notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const diskon = mysqlTable("diskon", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	nama: varchar({ length: 100 }).notNull(),
	tipe: mysqlEnum(['harga','persen']).notNull(),
	jumlah: varchar({ length: 100 }).notNull(),
	status: tinyint().notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const features = mysqlTable("features", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text().default('NULL'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const kategori = mysqlTable("kategori", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	namaKategori: varchar("nama_kategori", { length: 100 }).notNull(),
	icon: varchar({ length: 50 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
},
(table) => [
	index("idx_nama").on(table.namaKategori),
]);

export const kategoriCatatan = mysqlTable("kategori_catatan", {
	id: int().autoincrement().notNull(),
	nama: varchar({ length: 100 }).notNull(),
	jenis: varchar({ length: 100 }).notNull(),
});

export const kategoriCustomer = mysqlTable("kategori_customer", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	nama: varchar({ length: 100 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const menus = mysqlTable("menus", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	icon: varchar({ length: 50 }).default('NULL'),
	route: varchar({ length: 100 }).default('NULL'),
	parentId: int("parent_id").default('NULL'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => [
	index("parent_id").on(table.parentId),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "menus_ibfk_1"
		}).onUpdate("restrict").onDelete("restrict"),
]);

export const metodePembayaran = mysqlTable("metode_pembayaran", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	namaMetode: varchar("nama_metode", { length: 255 }).notNull(),
	tipe: mysqlEnum(['cash','wallet','transfer']).notNull(),
	gambar: varchar({ length: 255 }).default('NULL'),
	status: tinyint().notNull(),
	deleted: tinyint().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('NULL'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('NULL'),
});

export const migrations = mysqlTable("migrations", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	version: varchar({ length: 255 }).notNull(),
	class: varchar({ length: 255 }).notNull(),
	group: varchar({ length: 255 }).notNull(),
	namespace: varchar({ length: 255 }).notNull(),
	time: int().notNull(),
	batch: int().notNull(),
});

export const order = mysqlTable("order", {
	id: int().autoincrement().notNull(),
	idUser: int("id_user").notNull(),
	idToko: int("id_toko").notNull(),
	uuidOrder: varchar("uuid_order", { length: 80 }).notNull(),
	kodeOrder: varchar("kode_order", { length: 50 }).notNull(),
	idPelanggan: int("id_pelanggan").notNull(),
	subTotal: decimal("sub_total", { precision: 30, scale: 0 }).notNull(),
	diskon: decimal({ precision: 30, scale: 0 }).notNull(),
	biayaLayanan: decimal("biaya_layanan", { precision: 30, scale: 0 }).notNull(),
	ppn: decimal({ precision: 30, scale: 0 }).notNull(),
	total: decimal({ precision: 30, scale: 0 }).notNull(),
	pembayaran: varchar({ length: 100 }).notNull(),
	uangDibayar: decimal("uang_dibayar", { precision: 30, scale: 0 }).notNull(),
	kembalian: decimal({ precision: 30, scale: 0 }).notNull(),
	tanggal: datetime({ mode: 'string'}).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const orderItems = mysqlTable("order_items", {
	id: int().autoincrement().notNull(),
	idOrder: int("id_order").notNull(),
	kodeOrder: varchar("kode_order", { length: 50 }).notNull(),
	idProduk: int("id_produk").notNull(),
	quantity: int().notNull(),
	harga: varchar({ length: 100 }).notNull(),
	hargaTotal: varchar("harga_total", { length: 100 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const pelanggan = mysqlTable("pelanggan", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	kategoriId: int("kategori_id").default('NULL'),
	nama: varchar({ length: 100 }).notNull(),
	hp: varchar({ length: 100 }).notNull(),
	deleted: tinyint().default(0),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const pemasukan = mysqlTable("pemasukan", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	kategori: varchar({ length: 100 }).notNull(),
	total: varchar({ length: 100 }).notNull(),
	foto: varchar({ length: 100 }).default('NULL'),
	catatan: text().default('NULL'),
	idPelanggan: varchar("id_pelanggan", { length: 100 }).default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	tanggal: date({ mode: 'string' }).default('NULL'),
	deleted: tinyint().default(0),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const pengeluaran = mysqlTable("pengeluaran", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	kategori: varchar({ length: 100 }).notNull(),
	total: varchar({ length: 100 }).notNull(),
	foto: varchar({ length: 100 }).default('NULL'),
	catatan: text().default('NULL'),
	idPelanggan: varchar("id_pelanggan", { length: 100 }).default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	tanggal: date({ mode: 'string' }).default('NULL'),
	deleted: tinyint().default(0),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const permissions = mysqlTable("permissions", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
});

export const piutang = mysqlTable("piutang", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	pelanggan: varchar({ length: 100 }).notNull(),
	total: varchar({ length: 100 }).notNull(),
	foto: varchar({ length: 100 }).default('NULL'),
	catatan: varchar({ length: 100 }).notNull(),
	tempo: varchar({ length: 100 }).notNull(),
	tanggal: varchar({ length: 100 }).notNull(),
	status: tinyint().default(1),
	deleted: tinyint().default(0),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const produk = mysqlTable("produk", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	kodeProduk: varchar("kode_produk", { length: 255 }).default('NULL'),
	storeBarcode: varchar("store_barcode", { length: 255 }).default('NULL'),
	barcodeToko: varchar("barcode_toko", { length: 255 }).default('NULL'),
	nama: varchar({ length: 100 }).notNull(),
	kategori: varchar({ length: 50 }).notNull(),
	harga: varchar({ length: 100 }).notNull(),
	modal: varchar({ length: 100 }).notNull(),
	totalModal: varchar("total_modal", { length: 100 }).notNull(),
	foto: varchar({ length: 100 }).default('NULL'),
	satuan: varchar({ length: 10 }).notNull(),
	stok: varchar({ length: 100 }).notNull(),
	diskon: decimal({ precision: 10, scale: 2 }).default('0.00'),
	margin: decimal({ precision: 20, scale: 6 }).default('NULL'),
	hargaReg: decimal("harga_reg", { precision: 20, scale: 6 }).default('0.000000'),
	hargaPost: decimal("harga_post", { precision: 20, scale: 6 }).default('NULL'),
	nettMargin: decimal("nett_margin", { precision: 20, scale: 6 }).default('NULL'),
	status: tinyint().default(1),
	deleted: tinyint().default(0),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
},
(table) => [
	index("idx_deleted").on(table.deleted),
	index("idx_kategori").on(table.kategori),
]);

export const reward = mysqlTable("reward", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	jumlah: varchar({ length: 100 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const rolePermissions = mysqlTable("role_permissions", {
	id: int().autoincrement().notNull(),
	roleId: int("role_id").notNull(),
	featureId: int("feature_id").default('NULL'),
	menuId: int("menu_id").default('NULL'),
	canView: tinyint("can_view").default(0),
	canCreate: tinyint("can_create").default(0),
	canEdit: tinyint("can_edit").default(0),
	canDelete: tinyint("can_delete").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const satuan = mysqlTable("satuan", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	namaSatuan: varchar("nama_satuan", { length: 100 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const setting = mysqlTable("setting", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	nama: varchar({ length: 100 }).notNull(),
	hp: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 100 }).notNull(),
	alamat: varchar({ length: 100 }).notNull(),
	foto: varchar({ length: 100 }).notNull(),
	deskripsi: varchar({ length: 100 }).notNull(),
	catatankaki: varchar({ length: 100 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const stok = mysqlTable("stok", {
	id: int().autoincrement().notNull(),
	idProduk: varchar("id_produk", { length: 50 }).notNull(),
	idUser: varchar("id_user", { length: 50 }).notNull(),
	idSupplayer: varchar("id_supplayer", { length: 50 }).default('NULL'),
	idWarehaouse: varchar("id_warehaouse", { length: 50 }).default('NULL'),
	nilai: int().notNull(),
	jenis: int().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updateAt: timestamp("update_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const stokBarang = mysqlTable("stok_barang", {
	id: int().autoincrement().notNull(),
	productId: int("product_id").notNull(),
	warehouseId: int("warehouse_id").notNull(),
	supplierId: int("supplier_id").notNull(),
	jumlah: int().notNull(),
	stokawal: varchar({ length: 50 }).notNull(),
	stokTerjual: varchar("stok_terjual", { length: 50 }).notNull(),
	stokakhir: varchar({ length: 50 }).notNull(),
	keterangan: text().notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
});

export const storePp = mysqlTable("store_pp", {
	id: int().autoincrement().notNull(),
	namaToko: varchar("nama_toko", { length: 50 }).notNull(),
	logo: varchar({ length: 50 }).notNull(),
	deskripsi: varchar({ length: 50 }).notNull(),
});

export const supliers = mysqlTable("supliers", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").default('NULL'),
	namaSupplier: varchar("nama_supplier", { length: 100 }).notNull(),
	alamat: varchar({ length: 50 }).notNull(),
	hp: int().notNull(),
	email: varchar({ length: 50 }).notNull(),
	keterangan: text().notNull(),
	status: mysqlEnum(['aktif','non_aktif']).default('\'aktif\'').notNull(),
	foto: varchar({ length: 255 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
});

export const supplierDeliveries = mysqlTable("supplier_deliveries", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	supplierId: int("supplier_id").notNull(),
	productId: int("product_id").notNull(),
	invoiceNumber: varchar("invoice_number", { length: 150 }).notNull(),
	entryDate: datetime("entry_date", { mode: 'string'}).notNull(),
	quantity: int().notNull(),
	totalValue: decimal("total_value", { precision: 15, scale: 2 }).default('0.00').notNull(),
	unitCost: decimal("unit_cost", { precision: 15, scale: 2 }).default('0.00').notNull(),
	averageCost: decimal("average_cost", { precision: 15, scale: 2 }).default('0.00').notNull(),
	paymentMethod: mysqlEnum("payment_method", ['CASH','TOP']).default('\'CASH\'').notNull(),
	topDays: int("top_days").default('NULL'),
	stockAfter: int("stock_after").default(0).notNull(),
	modalAfter: decimal("modal_after", { precision: 15, scale: 2 }).default('0.00').notNull(),
	totalValueAfter: decimal("total_value_after", { precision: 17, scale: 2 }).default('0.00').notNull(),
	sellingPriceAfter: decimal("selling_price_after", { precision: 15, scale: 2 }).default('0.00').notNull(),
	notes: text().default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const supplierPayments = mysqlTable("supplier_payments", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	purchaseId: int("purchase_id").notNull(),
	amount: varchar({ length: 100 }).notNull(),
	paymentMethod: varchar("payment_method", { length: 100 }).default('\'CASH\'').notNull(),
	notes: text().notNull(),
	paidAt: datetime("paid_at", { mode: 'string'}).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
});

export const supplierPurchases = mysqlTable("supplier_purchases", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").default('NULL'),
	supplierId: int("supplier_id").notNull(),
	tanggal: datetime({ mode: 'string'}).notNull(),
	nomorFaktur: varchar("nomor_faktur", { length: 100 }).notNull(),
	nomorSo: varchar("nomor_so", { length: 100 }).notNull(),
	nomorPo: varchar("nomor_po", { length: 100 }).notNull(),
	salesman: varchar({ length: 100 }).notNull(),
	gudang: varchar({ length: 100 }).notNull(),
	total: decimal({ precision: 20, scale: 2 }).default('0.00').notNull(),
	paidAmount: decimal("paid_amount", { precision: 20, scale: 2 }).default('0.00').notNull(),
	status: mysqlEnum(['unpaid','partial','paid']).default('\'unpaid\'').notNull(),
	catatan: text().default('NULL'),
	entryDate: datetime("entry_date", { mode: 'string'}).default('NULL'),
	paymentMethod: mysqlEnum("payment_method", ['CASH','TOP']).default('\'CASH\''),
	topDays: int("top_days").default('NULL'),
	notes: text().default('NULL'),
	deleted: tinyint().default(0).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const supplierPurchaseItems = mysqlTable("supplier_purchase_items", {
	id: int().autoincrement().notNull(),
	purchaseId: int("purchase_id").notNull(),
	idToko: int("id_toko").default('NULL'),
	productId: int("product_id").default('NULL'),
	sku: varchar({ length: 100 }).notNull(),
	kodeProduk: varchar("kode_produk", { length: 150 }).default('NULL'),
	namaProduk: varchar("nama_produk", { length: 200 }).notNull(),
	quantity: int().default(0).notNull(),
	harga: decimal({ precision: 20, scale: 2 }).default('0.00').notNull(),
	modal: decimal({ precision: 20, scale: 6 }).default('0.000000').notNull(),
	totalModal: decimal("total_modal", { precision: 20, scale: 6 }).default('0.000000').notNull(),
	subtotal: decimal({ precision: 20, scale: 2 }).default('0.00').notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	username: varchar({ length: 50 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	role: mysqlEnum(['superadmin','admin','admintoko','kasir']).notNull(),
	hp: varchar({ length: 50 }).notNull(),
	namaLengkap: varchar("nama_lengkap", { length: 100 }).notNull(),
	isPremium: double("is_premium").notNull(),
	roleId: int("role_id").default('NULL'),
	packageType: mysqlEnum("package_type", ['free','premium','super']).notNull(),
	deleted: tinyint().default(0),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const userPermissions = mysqlTable("user_permissions", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	userId: bigint("user_id", { mode: "number" }).notNull(),
	permission: varchar({ length: 255 }).notNull(),
	idToko: bigint("id_toko", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('NULL'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('NULL'),
});

export const utang = mysqlTable("utang", {
	id: int().autoincrement().notNull(),
	idToko: int("id_toko").notNull(),
	pelanggan: varchar({ length: 100 }).notNull(),
	total: varchar({ length: 100 }).notNull(),
	foto: varchar({ length: 100 }).default('NULL'),
	catatan: varchar({ length: 100 }).notNull(),
	tempo: varchar({ length: 100 }).notNull(),
	tanggal: varchar({ length: 100 }).notNull(),
	status: tinyint().notNull(),
	deleted: tinyint().default(0),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
});

export const warehouses = mysqlTable("warehouses", {
	id: int().autoincrement().notNull(),
	namaGudang: varchar("nama_gudang", { length: 100 }).notNull(),
	lokasi: varchar({ length: 50 }).notNull(),
	hp: int().notNull(),
	email: varchar({ length: 50 }).notNull(),
	keterangan: text().notNull(),
	status: tinyint().default(1).notNull(),
	foto: varchar({ length: 255 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
});

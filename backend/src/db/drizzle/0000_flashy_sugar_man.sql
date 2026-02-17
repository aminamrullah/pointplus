-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `aset_jual` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`nama` varchar(100) NOT NULL,
	`harga` varchar(100) NOT NULL,
	`jumlah` varchar(100) NOT NULL,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `aset_modal` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_user` int(11) NOT NULL,
	`nama` varchar(100) NOT NULL,
	`harga` int(100) NOT NULL,
	`jumlah` int(100) NOT NULL,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `bahan_baku` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`nama_bahan` varchar(100) NOT NULL,
	`harga` varchar(100) NOT NULL,
	`jumlah` int(11) NOT NULL,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `biaya_lain` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`type` enum('ppn','biaya_layanan') NOT NULL,
	`value` float NOT NULL,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `diskon` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`nama` varchar(100) NOT NULL,
	`tipe` enum('harga','persen') NOT NULL,
	`jumlah` varchar(100) NOT NULL,
	`status` tinyint(1) NOT NULL,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `features` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text DEFAULT 'NULL',
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `kategori` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`nama_kategori` varchar(100) NOT NULL,
	`icon` varchar(50) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `kategori_catatan` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`nama` varchar(100) NOT NULL,
	`jenis` varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kategori_customer` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`nama` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `menus` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(50) DEFAULT 'NULL',
	`route` varchar(100) DEFAULT 'NULL',
	`parent_id` int(11) DEFAULT 'NULL',
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `metode_pembayaran` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`nama_metode` varchar(255) NOT NULL,
	`tipe` enum('cash','wallet','transfer') NOT NULL,
	`gambar` varchar(255) DEFAULT 'NULL',
	`status` tinyint(1) NOT NULL,
	`deleted` tinyint(1) NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT 'NULL',
	`updated_at` timestamp DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `migrations` (
	`id` bigint(20) unsigned AUTO_INCREMENT NOT NULL,
	`version` varchar(255) NOT NULL,
	`class` varchar(255) NOT NULL,
	`group` varchar(255) NOT NULL,
	`namespace` varchar(255) NOT NULL,
	`time` int(11) NOT NULL,
	`batch` int(11) unsigned NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_user` int(11) NOT NULL,
	`id_toko` int(11) NOT NULL,
	`uuid_order` varchar(80) NOT NULL,
	`kode_order` varchar(50) NOT NULL,
	`id_pelanggan` int(11) NOT NULL,
	`sub_total` decimal(30,0) NOT NULL,
	`diskon` decimal(30,0) NOT NULL,
	`biaya_layanan` decimal(30,0) NOT NULL,
	`ppn` decimal(30,0) NOT NULL,
	`total` decimal(30,0) NOT NULL,
	`pembayaran` varchar(100) NOT NULL,
	`uang_dibayar` decimal(30,0) NOT NULL,
	`kembalian` decimal(30,0) NOT NULL,
	`tanggal` datetime NOT NULL,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_order` int(11) NOT NULL,
	`kode_order` varchar(50) NOT NULL,
	`id_produk` int(11) NOT NULL,
	`quantity` int(11) NOT NULL,
	`harga` varchar(100) NOT NULL,
	`harga_total` varchar(100) NOT NULL,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `pelanggan` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`kategori_id` int(11) DEFAULT 'NULL',
	`nama` varchar(100) NOT NULL,
	`hp` varchar(100) NOT NULL,
	`deleted` tinyint(1) DEFAULT 0,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `pemasukan` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`kategori` varchar(100) NOT NULL,
	`total` varchar(100) NOT NULL,
	`foto` varchar(100) DEFAULT 'NULL',
	`catatan` text DEFAULT 'NULL',
	`id_pelanggan` varchar(100) DEFAULT 'NULL',
	`tanggal` date DEFAULT 'NULL',
	`deleted` tinyint(1) DEFAULT 0,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `pengeluaran` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`kategori` varchar(100) NOT NULL,
	`total` varchar(100) NOT NULL,
	`foto` varchar(100) DEFAULT 'NULL',
	`catatan` text DEFAULT 'NULL',
	`id_pelanggan` varchar(100) DEFAULT 'NULL',
	`tanggal` date DEFAULT 'NULL',
	`deleted` tinyint(1) DEFAULT 0,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `piutang` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`pelanggan` varchar(100) NOT NULL,
	`total` varchar(100) NOT NULL,
	`foto` varchar(100) DEFAULT 'NULL',
	`catatan` varchar(100) NOT NULL,
	`tempo` varchar(100) NOT NULL,
	`tanggal` varchar(100) NOT NULL,
	`status` tinyint(1) DEFAULT 1,
	`deleted` tinyint(1) DEFAULT 0,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `produk` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`kode_produk` varchar(255) DEFAULT 'NULL',
	`store_barcode` varchar(255) DEFAULT 'NULL',
	`barcode_toko` varchar(255) DEFAULT 'NULL',
	`nama` varchar(100) NOT NULL,
	`kategori` varchar(50) NOT NULL,
	`harga` varchar(100) NOT NULL,
	`modal` varchar(100) NOT NULL,
	`total_modal` varchar(100) NOT NULL,
	`foto` varchar(100) DEFAULT 'NULL',
	`satuan` varchar(10) NOT NULL,
	`stok` varchar(100) NOT NULL,
	`diskon` decimal(10,2) DEFAULT '0.00',
	`margin` decimal(20,6) DEFAULT 'NULL',
	`harga_reg` decimal(20,6) DEFAULT '0.000000',
	`harga_post` decimal(20,6) DEFAULT 'NULL',
	`nett_margin` decimal(20,6) DEFAULT 'NULL',
	`status` tinyint(1) DEFAULT 1,
	`deleted` tinyint(1) DEFAULT 0,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reward` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`jumlah` varchar(100) NOT NULL,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`role_id` int(11) NOT NULL,
	`feature_id` int(11) DEFAULT 'NULL',
	`menu_id` int(11) DEFAULT 'NULL',
	`can_view` tinyint(1) DEFAULT 0,
	`can_create` tinyint(1) DEFAULT 0,
	`can_edit` tinyint(1) DEFAULT 0,
	`can_delete` tinyint(1) DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `satuan` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`nama_satuan` varchar(100) NOT NULL,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `setting` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`nama` varchar(100) NOT NULL,
	`hp` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`alamat` varchar(100) NOT NULL,
	`foto` varchar(100) NOT NULL,
	`deskripsi` varchar(100) NOT NULL,
	`catatankaki` varchar(100) NOT NULL,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `stok` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`id_produk` varchar(50) NOT NULL,
	`id_user` varchar(50) NOT NULL,
	`id_supplayer` varchar(50) DEFAULT 'NULL',
	`id_warehaouse` varchar(50) DEFAULT 'NULL',
	`nilai` int(11) NOT NULL,
	`jenis` int(11) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`update_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `stok_barang` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`product_id` int(11) NOT NULL,
	`warehouse_id` int(11) NOT NULL,
	`supplier_id` int(11) NOT NULL,
	`jumlah` int(15) NOT NULL,
	`stokawal` varchar(50) NOT NULL,
	`stok_terjual` varchar(50) NOT NULL,
	`stokakhir` varchar(50) NOT NULL,
	`keterangan` text NOT NULL,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `store_pp` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`nama_toko` varchar(50) NOT NULL,
	`logo` varchar(50) NOT NULL,
	`deskripsi` varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `supliers` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) DEFAULT 'NULL',
	`nama_supplier` varchar(100) NOT NULL,
	`alamat` varchar(50) NOT NULL,
	`hp` int(15) NOT NULL,
	`email` varchar(50) NOT NULL,
	`keterangan` text NOT NULL,
	`status` enum('aktif','non_aktif') NOT NULL DEFAULT '''aktif''',
	`foto` varchar(255) DEFAULT 'NULL',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `supplier_deliveries` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`supplier_id` int(11) NOT NULL,
	`product_id` int(11) NOT NULL,
	`invoice_number` varchar(150) NOT NULL,
	`entry_date` datetime NOT NULL,
	`quantity` int(11) NOT NULL,
	`total_value` decimal(15,2) NOT NULL DEFAULT '0.00',
	`unit_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
	`average_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
	`payment_method` enum('CASH','TOP') NOT NULL DEFAULT '''CASH''',
	`top_days` int(11) DEFAULT 'NULL',
	`stock_after` int(11) NOT NULL DEFAULT 0,
	`modal_after` decimal(15,2) NOT NULL DEFAULT '0.00',
	`total_value_after` decimal(17,2) NOT NULL DEFAULT '0.00',
	`selling_price_after` decimal(15,2) NOT NULL DEFAULT '0.00',
	`notes` text DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `supplier_payments` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`purchase_id` int(11) NOT NULL,
	`amount` varchar(100) NOT NULL,
	`payment_method` varchar(100) NOT NULL DEFAULT '''CASH''',
	`notes` text NOT NULL,
	`paid_at` datetime NOT NULL,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `supplier_purchases` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) DEFAULT 'NULL',
	`supplier_id` int(11) NOT NULL,
	`tanggal` datetime NOT NULL,
	`nomor_faktur` varchar(100) NOT NULL,
	`nomor_so` varchar(100) NOT NULL,
	`nomor_po` varchar(100) NOT NULL,
	`salesman` varchar(100) NOT NULL,
	`gudang` varchar(100) NOT NULL,
	`total` decimal(20,2) NOT NULL DEFAULT '0.00',
	`paid_amount` decimal(20,2) NOT NULL DEFAULT '0.00',
	`status` enum('unpaid','partial','paid') NOT NULL DEFAULT '''unpaid''',
	`catatan` text DEFAULT 'NULL',
	`entry_date` datetime DEFAULT 'NULL',
	`payment_method` enum('CASH','TOP') DEFAULT '''CASH''',
	`top_days` int(11) DEFAULT 'NULL',
	`notes` text DEFAULT 'NULL',
	`deleted` tinyint(1) NOT NULL DEFAULT 0,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `supplier_purchase_items` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`purchase_id` int(11) NOT NULL,
	`id_toko` int(11) DEFAULT 'NULL',
	`product_id` int(11) DEFAULT 'NULL',
	`sku` varchar(100) NOT NULL,
	`kode_produk` varchar(150) DEFAULT 'NULL',
	`nama_produk` varchar(200) NOT NULL,
	`quantity` int(11) NOT NULL DEFAULT 0,
	`harga` decimal(20,2) NOT NULL DEFAULT '0.00',
	`modal` decimal(20,6) NOT NULL DEFAULT '0.000000',
	`total_modal` decimal(20,6) NOT NULL DEFAULT '0.000000',
	`subtotal` decimal(20,2) NOT NULL DEFAULT '0.00',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('superadmin','admin','admintoko','kasir') NOT NULL,
	`hp` varchar(50) NOT NULL,
	`nama_lengkap` varchar(100) NOT NULL,
	`is_premium` double NOT NULL,
	`role_id` int(11) DEFAULT 'NULL',
	`package_type` enum('free','premium','super') NOT NULL,
	`deleted` tinyint(1) DEFAULT 0,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`id` bigint(20) unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint(20) unsigned NOT NULL,
	`permission` varchar(255) NOT NULL,
	`id_toko` bigint(20) unsigned NOT NULL,
	`created_at` timestamp DEFAULT 'NULL',
	`updated_at` timestamp DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `utang` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`id_toko` int(11) NOT NULL,
	`pelanggan` varchar(100) NOT NULL,
	`total` varchar(100) NOT NULL,
	`foto` varchar(100) DEFAULT 'NULL',
	`catatan` varchar(100) NOT NULL,
	`tempo` varchar(100) NOT NULL,
	`tanggal` varchar(100) NOT NULL,
	`status` tinyint(1) NOT NULL,
	`deleted` tinyint(1) DEFAULT 0,
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`nama_gudang` varchar(100) NOT NULL,
	`lokasi` varchar(50) NOT NULL,
	`hp` int(15) NOT NULL,
	`email` varchar(50) NOT NULL,
	`keterangan` text NOT NULL,
	`status` tinyint(1) NOT NULL DEFAULT 1,
	`foto` varchar(255) DEFAULT 'NULL',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
ALTER TABLE `menus` ADD CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `menus`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
CREATE INDEX `idx_nama` ON `kategori` (`nama_kategori`);--> statement-breakpoint
CREATE INDEX `parent_id` ON `menus` (`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_deleted` ON `produk` (`deleted`);--> statement-breakpoint
CREATE INDEX `idx_kategori` ON `produk` (`kategori`);
*/
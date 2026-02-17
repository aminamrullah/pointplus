import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db";
import { order, orderItems, pemasukan, pengeluaran, supplierPurchases, produk, kategori, biayaLain, kategoriCatatan, users, pelanggan } from "../db/schema";
import { eq, and, between, sql, desc } from "drizzle-orm";
// @ts-ignore
import * as XLSX from "xlsx-js-style";

export const getReportPemasukan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { dateFrom, dateTo } = request.query as any;
        const user = request.user as any;
        const conditions = [
            eq(pemasukan.deleted, false),
            eq(pemasukan.idToko, user.id_toko)
        ];

        if (dateFrom && dateTo) {
            conditions.push(between(pemasukan.tanggal, new Date(dateFrom), new Date(dateTo)));
        }

        const data = await db.select({
            id: pemasukan.id,
            idToko: pemasukan.idToko,
            kategori: pemasukan.kategori,
            namaKategori: kategoriCatatan.nama,
            jenis: kategoriCatatan.jenis,
            total: pemasukan.total,
            foto: pemasukan.foto,
            catatan: pemasukan.catatan,
            idPelanggan: pemasukan.idPelanggan,
            tanggal: pemasukan.tanggal,
            deleted: pemasukan.deleted,
            createdAt: pemasukan.createdAt,
            updatedAt: pemasukan.updatedAt,
        })
            .from(pemasukan)
            .leftJoin(kategoriCatatan, eq(sql`CAST(${pemasukan.kategori} AS UNSIGNED)`, kategoriCatatan.id))
            .where(and(...conditions))
            .orderBy(desc(pemasukan.tanggal));

        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getReportPengeluaran = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { dateFrom, dateTo } = request.query as any;
        const user = request.user as any;
        const conditions = [
            eq(pengeluaran.deleted, false),
            eq(pengeluaran.idToko, user.id_toko)
        ];

        if (dateFrom && dateTo) {
            conditions.push(between(pengeluaran.tanggal, new Date(dateFrom), new Date(dateTo)));
        }

        const data = await db.select({
            id: pengeluaran.id,
            idToko: pengeluaran.idToko,
            kategori: pengeluaran.kategori,
            namaKategori: kategoriCatatan.nama,
            jenis: kategoriCatatan.jenis,
            total: pengeluaran.total,
            foto: pengeluaran.foto,
            catatan: pengeluaran.catatan,
            idPelanggan: pengeluaran.idPelanggan,
            tanggal: pengeluaran.tanggal,
            deleted: pengeluaran.deleted,
            createdAt: pengeluaran.createdAt,
            updatedAt: pengeluaran.updatedAt,
        })
            .from(pengeluaran)
            .leftJoin(kategoriCatatan, eq(sql`CAST(${pengeluaran.kategori} AS UNSIGNED)`, kategoriCatatan.id))
            .where(and(...conditions))
            .orderBy(desc(pengeluaran.tanggal));

        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getReportPenjualan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { dateFrom, dateTo } = request.query as any;
        const user = request.user as any;

        // Fetch orders joined with items and products to calculate profit
        const conditions = [
            eq(order.idToko, user.id_toko)
        ];

        if (dateFrom && dateTo) {
            conditions.push(between(order.tanggal, new Date(dateFrom), new Date(dateTo)));
        }

        const rawData = await db.select({
            orderId: order.id,
            tanggal: order.tanggal,
            total: order.total,
            diskon: order.diskon,
            itemId: orderItems.id,
            quantity: orderItems.quantity,
            hargaItem: orderItems.harga, // Selling price per item
            modalItem: produk.modal,     // Cost price per item
        })
            .from(order)
            .innerJoin(orderItems, eq(order.id, orderItems.idOrder))
            .innerJoin(produk, eq(orderItems.idProduk, produk.id))
            .where(and(...conditions));

        // Group by date
        const groupedData: Record<string, {
            id: number;
            tanggal: string;
            total_penjualan: number;
            total_transaksi: Set<number>;
            keuntungan: number;
        }> = {};

        rawData.forEach((row) => {
            const dateStr = row.tanggal.toISOString().split('T')[0]; // YYYY-MM-DD
            if (!groupedData[dateStr]) {
                groupedData[dateStr] = {
                    id: row.orderId, // Just a key
                    tanggal: row.tanggal.toISOString(),
                    total_penjualan: 0,
                    total_transaksi: new Set(),
                    keuntungan: 0,
                };
            }

            const group = groupedData[dateStr];

            // Only add order total once per order
            if (!group.total_transaksi.has(row.orderId)) {
                group.total_penjualan += Number(row.total);
                // Subtract order discount from profit? 
                // Profit = (Item Price - Item Cost) * Qty - Order Discount. 
                // Since we iterate items, we calculate item profit, then assume Order Discount is handled separately or we distribute it.
                // Simple approach: Gross Profit = Sum((Price - Modal) * Qty) - Order Discount.
                // We subtract Order Discount ONCE per order.
                group.keuntungan -= Number(row.diskon);
                group.total_transaksi.add(row.orderId);
            }

            // Calculate item profit
            const price = Number(row.hargaItem);
            const cost = Number(row.modalItem);
            const qty = row.quantity;
            const itemProfit = (price - cost) * qty;

            group.keuntungan += itemProfit;
        });

        // Convert format for response
        const reportData = Object.values(groupedData).map(item => ({
            id: item.id, // using one of the order ids as key
            tanggal: item.tanggal,
            total_penjualan: item.total_penjualan,
            total_transaksi: item.total_transaksi.size,
            keuntungan: item.keuntungan
        }));

        // Sort by date desc
        reportData.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

        return reply.send({ status: "success", data: reportData });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getSalesDetail = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { dateFrom, dateTo } = request.query as any;
        const user = request.user as any;

        // Calculate total cost (modal) per order using a subquery structure or join
        const data = await db.select({
            id: order.id,
            tanggal: order.tanggal,
            kodeOrder: order.kodeOrder,
            kasir: users.namaLengkap,
            pelanggan: pelanggan.nama,
            pembayaran: order.pembayaran,
            diskon: order.diskon,
            ppn: order.ppn,
            total: order.total,
            margin: sql<number>`SUM((CAST(${orderItems.harga} AS DECIMAL) - CAST(${produk.modal} AS DECIMAL)) * ${orderItems.quantity}) - CAST(${order.diskon} AS DECIMAL)`
        })
            .from(order)
            .leftJoin(users, eq(order.idUser, users.id))
            .leftJoin(pelanggan, eq(order.idPelanggan, pelanggan.id))
            .innerJoin(orderItems, eq(order.id, orderItems.idOrder))
            .innerJoin(produk, eq(orderItems.idProduk, produk.id))
            .where(and(
                eq(order.idToko, user.id_toko),
                dateFrom && dateTo ? between(order.tanggal, new Date(dateFrom), new Date(dateTo)) : undefined
            ))
            .groupBy(order.id, users.namaLengkap, pelanggan.nama)
            .orderBy(desc(order.tanggal));

        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error", error: error.message });
    }
};

export const getBestSeller = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const totalTerjual = sql<number>`SUM(${orderItems.quantity})`;
        const subtotal = sql<number>`SUM(CAST(${orderItems.hargaTotal} AS DECIMAL))`;
        const data = await db.select({
            id: produk.id,
            barcode: produk.barcode,
            nama_produk: produk.nama,
            kategori: kategori.namaKategori,
            harga: produk.harga,
            terjual: totalTerjual,
            subtotal: subtotal,
        })
            .from(orderItems)
            .innerJoin(produk, eq(orderItems.idProduk, produk.id))
            .leftJoin(kategori, eq(sql`CAST(${produk.kategori} AS UNSIGNED)`, kategori.id))
            .where(and(
                eq(produk.idToko, user.id_toko),
                eq(produk.deleted, false)
            ))
            .groupBy(produk.id, produk.barcode, produk.nama, kategori.namaKategori, produk.harga)
            .orderBy(desc(totalTerjual))
            .limit(10);

        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getProfitLoss = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        // Simple mock for now
        const user = request.user as any;
        const totalPenjualan = await db.select({ sum: sql<number>`SUM(${order.total})` }).from(order).where(eq(order.idToko, user.id_toko));
        const totalPemasukan = await db.select({ sum: sql<number>`SUM(${pemasukan.total})` }).from(pemasukan).where(and(eq(pemasukan.deleted, false), eq(pemasukan.idToko, user.id_toko)));
        const totalPengeluaran = await db.select({ sum: sql<number>`SUM(${pengeluaran.total})` }).from(pengeluaran).where(and(eq(pengeluaran.deleted, false), eq(pengeluaran.idToko, user.id_toko)));

        return reply.send({
            status: "success",
            data: {
                total_penjualan: totalPenjualan[0]?.sum || 0,
                total_pemasukan: totalPemasukan[0]?.sum || 0,
                total_pengeluaran: totalPengeluaran[0]?.sum || 0,
                net_profit: (Number(totalPenjualan[0]?.sum || 0) + Number(totalPemasukan[0]?.sum || 0)) - Number(totalPengeluaran[0]?.sum || 0)
            }
        });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getAccountsPayable = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { supplierId } = request.query as any;
        const user = request.user as any;
        const conditions = [
            eq(supplierPurchases.status, "unpaid"),
            eq(supplierPurchases.idToko, user.id_toko),
            eq(supplierPurchases.deleted, false)
        ];

        if (supplierId) {
            conditions.push(eq(supplierPurchases.supplierId, parseInt(supplierId)));
        }

        const data = await db.select()
            .from(supplierPurchases)
            .where(and(...conditions));
        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getSummaryStats = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { dateFrom, dateTo } = request.query as any;
        const user = request.user as any;
        const id_toko = user.id_toko;

        // Date filter helpers
        const fromDate = dateFrom ? new Date(dateFrom) : undefined;
        let toDate = dateTo ? new Date(dateTo) : undefined;

        if (toDate) {
            toDate.setHours(23, 59, 59, 999);
        }

        // Base conditions
        const orderWhere = and(
            eq(order.idToko, id_toko),
            fromDate && toDate ? between(order.tanggal, fromDate, toDate) : undefined
        );

        const pemasukanWhere = and(
            eq(pemasukan.idToko, id_toko),
            eq(pemasukan.deleted, false),
            fromDate && toDate ? between(pemasukan.tanggal, fromDate, toDate) : undefined
        );

        const pengeluaranWhere = and(
            eq(pengeluaran.idToko, id_toko),
            eq(pengeluaran.deleted, false),
            fromDate && toDate ? between(pengeluaran.tanggal, fromDate, toDate) : undefined
        );

        // 1. Transaction Stats & Omset
        const [ordersData] = await db.select({
            totalTransaksi: sql<number>`COUNT(${order.id})`,
            totalOmset: sql<number>`SUM(${order.total})`,
            totalDiskon: sql<number>`SUM(${order.diskon})`,
        }).from(order).where(orderWhere);

        // 2. Gross Profit (Laba Kotor)
        // Laba = (Total Jual Item - Total Modal Item) - Total Diskon Order
        // Note: orderItems.hargaTotal is essentially the revenue from items
        const itemsData = await db.select({
            revenueItems: sql<number>`SUM(${orderItems.hargaTotal})`,
            cogs: sql<number>`SUM(${produk.modal} * ${orderItems.quantity})`
        })
            .from(orderItems)
            .innerJoin(order, eq(orderItems.idOrder, order.id))
            .innerJoin(produk, eq(orderItems.idProduk, produk.id))
            .where(orderWhere); // Reuse order condition

        const revenueItems = Number(itemsData[0]?.revenueItems || 0);
        const cogs = Number(itemsData[0]?.cogs || 0);
        const totalDiskon = Number(ordersData?.totalDiskon || 0);

        // Gross Profit Calculation
        const totalLaba = revenueItems - cogs - totalDiskon;

        // 3. Pemasukan (Income)
        const [incomeData] = await db.select({
            total: sql<number>`SUM(${pemasukan.total})`
        }).from(pemasukan).where(pemasukanWhere);

        // 4. Pengeluaran (Expense)
        const [expenseData] = await db.select({
            total: sql<number>`SUM(${pengeluaran.total})`
        }).from(pengeluaran).where(pengeluaranWhere);

        const totalIncome = Number(incomeData?.total || 0);
        const totalExpense = Number(expenseData?.total || 0);

        // Net Profit = (Gross Profit + Other Income) - Expenses
        const netProfit = totalLaba + totalIncome - totalExpense;

        return reply.send({
            status: "success",
            data: {
                totalTransaksi: Number(ordersData?.totalTransaksi || 0),
                totalOmset: Number(ordersData?.totalOmset || 0),
                totalDiskon: totalDiskon,
                totalLaba: totalLaba,
                totalIncome: totalIncome,
                totalExpense: totalExpense,
                netProfit: netProfit
            }
        });

    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const downloadFinancialReport = async (request: FastifyRequest, reply: FastifyReply) => {
    // Placeholder for export
    return reply.send({ status: "success", message: "Export functionality not fully implemented yet" });
};

export const downloadSalesReport = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { dateFrom, dateTo } = request.query as any;
        const user = request.user as any;
        const id_toko = user.id_toko;

        // Fetch Data: Orders joined with items
        const rawData = await db.select({
            tanggal: order.tanggal,
            kodeOrder: order.kodeOrder,
            barcode: produk.barcode,
            namaProduk: produk.nama,
            kategoriProduk: kategori.namaKategori,
            itemQty: orderItems.quantity,
            diskonProduk: produk.diskon,
            itemHargaTotal: orderItems.hargaTotal, // Equivalent to sub_total share
            modal: produk.modal,
            orderSubTotal: order.subTotal,
            orderPpn: order.ppn
        })
            .from(order)
            .innerJoin(orderItems, eq(order.id, orderItems.idOrder))
            .innerJoin(produk, eq(orderItems.idProduk, produk.id))
            .leftJoin(kategori, eq(sql`CAST(${produk.kategori} AS UNSIGNED)`, kategori.id))
            .where(
                and(
                    eq(order.idToko, id_toko),
                    dateFrom && dateTo ? between(order.tanggal, new Date(dateFrom), new Date(dateTo)) : undefined
                )
            )
            .orderBy(desc(order.tanggal));

        // Process Data for Excel
        const excelData = rawData.map(item => {
            const hargaExcPpn = parseFloat(item.itemHargaTotal as string) || 0;
            const modal = parseFloat(item.modal as string) || 0;
            const qty = item.itemQty;

            // Calculate PPN share for this item based on Order's effective tax rate
            const orderSub = parseFloat(item.orderSubTotal as string) || 0;
            const orderTax = parseFloat(item.orderPpn as string) || 0;

            let taxAmount = 0;
            if (orderSub > 0) {
                const ratio = orderTax / orderSub;
                taxAmount = hargaExcPpn * ratio;
            }
            const hargaIncPpn = hargaExcPpn + taxAmount;

            // Margin = order_items.harga_total - (produk.modal * order_items.quantity)
            const margin = hargaExcPpn - (modal * qty);

            // Split Diskon
            let diskon1 = "";
            let diskon2 = "";
            const diskonStr = item.diskonProduk ? String(item.diskonProduk) : "";
            if (diskonStr.includes("+")) {
                const parts = diskonStr.split("+");
                diskon1 = parts[0];
                diskon2 = parts[1];
            } else {
                diskon1 = diskonStr;
            }

            return {
                "Tanggal Transaksi": item.tanggal ? new Date(item.tanggal) : null,
                "No Order": item.kodeOrder,
                "Barcode Produk": item.barcode || "-",
                "Nama Produk": item.namaProduk,
                "Kategori Produk": item.kategoriProduk || "-",
                "Qty Produk": qty,
                "Diskon 1": diskon1,
                "Diskon 2": diskon2,
                "Harga Produk Exc Ppn": hargaExcPpn,
                "Harga Produk Inc Ppn": hargaIncPpn,
                "Margin": margin
            };
        });

        // Create WorkSheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Customize Header Style
        const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_col(C) + "1"; // Header row
            if (!ws[address]) continue;
            ws[address].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F46E5" } }, // Indigo
                alignment: { horizontal: "center" },
                border: {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" }
                }
            };
        }

        // Set Column Widths
        ws["!cols"] = [
            { wch: 20 }, // Tanggal
            { wch: 15 }, // No Order
            { wch: 15 }, // Barcode
            { wch: 30 }, // Nama
            { wch: 20 }, // Kategori
            { wch: 10 }, // Qty
            { wch: 10 }, // Diskon 1
            { wch: 10 }, // Diskon 2
            { wch: 20 }, // Harga Exc
            { wch: 20 }, // Harga Inc
            { wch: 20 }  // Margin
        ];

        // Format Date and Number Columns
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            // Date Column (A)
            const dateCell = XLSX.utils.encode_cell({ c: 0, r: R });
            if (ws[dateCell]) {
                ws[dateCell].z = "dd/mm/yyyy hh:mm";
            }

            // Number Columns (I, J, K) -> Indices 8, 9, 10
            const colsToFormat = [8, 9, 10];
            colsToFormat.forEach(C => {
                const cell = XLSX.utils.encode_cell({ c: C, r: R });
                if (ws[cell]) ws[cell].z = "#,##0";
            });
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Penjualan");

        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        reply.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        reply.header("Content-Disposition", `attachment; filename="Laporan_Penjualan_${dateFrom || 'all'}_${dateTo || 'all'}.xlsx"`);
        return reply.send(buffer);

    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

import { db } from "../db/index.js";
import { order, orderItems, pemasukan, pengeluaran, supplierPurchases, produk, kategori, kategoriCatatan, users, pelanggan } from "../db/schema.js";
import { eq, and, between, sql, desc } from "drizzle-orm";
import * as XLSX from "xlsx-js-style";

export const getReportPemasukan = async (request, reply) => {
    try {
        const { dateFrom, dateTo } = request.query;
        const user = request.user;
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
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getReportPengeluaran = async (request, reply) => {
    try {
        const { dateFrom, dateTo } = request.query;
        const user = request.user;
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
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getReportPenjualan = async (request, reply) => {
    try {
        const { dateFrom, dateTo } = request.query;
        const user = request.user;

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
            hargaItem: orderItems.harga,
            modalItem: produk.modal,
        })
            .from(order)
            .innerJoin(orderItems, eq(order.id, orderItems.idOrder))
            .innerJoin(produk, eq(orderItems.idProduk, produk.id))
            .where(and(...conditions));

        const groupedData = {};

        rawData.forEach((row) => {
            const dateStr = row.tanggal.toISOString().split('T')[0];
            if (!groupedData[dateStr]) {
                groupedData[dateStr] = {
                    id: row.orderId,
                    tanggal: row.tanggal.toISOString(),
                    total_penjualan: 0,
                    total_transaksi: new Set(),
                    keuntungan: 0,
                };
            }

            const group = groupedData[dateStr];

            if (!group.total_transaksi.has(row.orderId)) {
                group.total_penjualan += Number(row.total);
                group.keuntungan -= Number(row.diskon);
                group.total_transaksi.add(row.orderId);
            }

            const price = Number(row.hargaItem);
            const cost = Number(row.modalItem);
            const qty = row.quantity;
            const itemProfit = (price - cost) * qty;

            group.keuntungan += itemProfit;
        });

        const reportData = Object.values(groupedData).map(item => ({
            id: item.id,
            tanggal: item.tanggal,
            total_penjualan: item.total_penjualan,
            total_transaksi: item.total_transaksi.size,
            keuntungan: item.keuntungan
        }));

        reportData.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

        return reply.send({ status: "success", data: reportData });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getSalesDetail = async (request, reply) => {
    try {
        const { dateFrom, dateTo } = request.query;
        const user = request.user;

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
            margin: sql`SUM((CAST(${orderItems.harga} AS DECIMAL) - CAST(${produk.modal} AS DECIMAL)) * ${orderItems.quantity}) - CAST(${order.diskon} AS DECIMAL)`
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
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error", error: error.message });
    }
};

export const getBestSeller = async (request, reply) => {
    try {
        const user = request.user;
        const totalTerjual = sql`SUM(${orderItems.quantity})`;
        const subtotal = sql`SUM(CAST(${orderItems.hargaTotal} AS DECIMAL))`;
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
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getProfitLoss = async (request, reply) => {
    try {
        const user = request.user;
        const totalPenjualan = await db.select({ sum: sql`SUM(${order.total})` }).from(order).where(eq(order.idToko, user.id_toko));
        const totalPemasukan = await db.select({ sum: sql`SUM(${pemasukan.total})` }).from(pemasukan).where(and(eq(pemasukan.deleted, false), eq(pemasukan.idToko, user.id_toko)));
        const totalPengeluaran = await db.select({ sum: sql`SUM(${pengeluaran.total})` }).from(pengeluaran).where(and(eq(pengeluaran.deleted, false), eq(pengeluaran.idToko, user.id_toko)));

        return reply.send({
            status: "success",
            data: {
                total_penjualan: totalPenjualan[0]?.sum || 0,
                total_pemasukan: totalPemasukan[0]?.sum || 0,
                total_pengeluaran: totalPengeluaran[0]?.sum || 0,
                net_profit: (Number(totalPenjualan[0]?.sum || 0) + Number(totalPemasukan[0]?.sum || 0)) - Number(totalPengeluaran[0]?.sum || 0)
            }
        });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getAccountsPayable = async (request, reply) => {
    try {
        const { supplierId } = request.query;
        const user = request.user;
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
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getSummaryStats = async (request, reply) => {
    try {
        const { dateFrom, dateTo } = request.query;
        const user = request.user;
        const id_toko = user.id_toko;

        const fromDate = dateFrom ? new Date(dateFrom) : undefined;
        let toDate = dateTo ? new Date(dateTo) : undefined;

        if (toDate) {
            toDate.setHours(23, 59, 59, 999);
        }

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

        const [ordersData] = await db.select({
            totalTransaksi: sql`COUNT(${order.id})`,
            totalOmset: sql`SUM(${order.total})`,
            totalDiskon: sql`SUM(${order.diskon})`,
        }).from(order).where(orderWhere);

        const itemsData = await db.select({
            revenueItems: sql`SUM(${orderItems.hargaTotal})`,
            cogs: sql`SUM(${produk.modal} * ${orderItems.quantity})`
        })
            .from(orderItems)
            .innerJoin(order, eq(orderItems.idOrder, order.id))
            .innerJoin(produk, eq(orderItems.idProduk, produk.id))
            .where(orderWhere);

        const revenueItems = Number(itemsData[0]?.revenueItems || 0);
        const cogs = Number(itemsData[0]?.cogs || 0);
        const totalDiskon = Number(ordersData?.totalDiskon || 0);

        const totalLaba = revenueItems - cogs - totalDiskon;

        const [incomeData] = await db.select({
            total: sql`SUM(${pemasukan.total})`
        }).from(pemasukan).where(pemasukanWhere);

        const [expenseData] = await db.select({
            total: sql`SUM(${pengeluaran.total})`
        }).from(pengeluaran).where(pengeluaranWhere);

        const totalIncome = Number(incomeData?.total || 0);
        const totalExpense = Number(expenseData?.total || 0);

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

    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const downloadFinancialReport = async (request, reply) => {
    return reply.send({ status: "success", message: "Export functionality not fully implemented yet" });
};

export const downloadSalesReport = async (request, reply) => {
    try {
        const { dateFrom, dateTo } = request.query;
        const user = request.user;
        const id_toko = user.id_toko;

        const rawData = await db.select({
            tanggal: order.tanggal,
            kodeOrder: order.kodeOrder,
            barcode: produk.barcode,
            namaProduk: produk.nama,
            kategoriProduk: kategori.namaKategori,
            itemQty: orderItems.quantity,
            diskonProduk: produk.diskon,
            itemHargaTotal: orderItems.hargaTotal,
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

        const excelData = rawData.map(item => {
            const hargaExcPpn = parseFloat(item.itemHargaTotal) || 0;
            const modal = parseFloat(item.modal) || 0;
            const qty = item.itemQty;

            const orderSub = parseFloat(item.orderSubTotal) || 0;
            const orderTax = parseFloat(item.orderPpn) || 0;

            let taxAmount = 0;
            if (orderSub > 0) {
                const ratio = orderTax / orderSub;
                taxAmount = hargaExcPpn * ratio;
            }
            const hargaIncPpn = hargaExcPpn + taxAmount;

            const margin = hargaExcPpn - (modal * qty);

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

        const ws = XLSX.utils.json_to_sheet(excelData);

        const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_col(C) + "1";
            if (!ws[address]) continue;
            ws[address].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F46E5" } },
                alignment: { horizontal: "center" },
                border: {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" }
                }
            };
        }

        ws["!cols"] = [
            { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 20 },
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 20 },
            { wch: 20 }
        ];

        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const dateCell = XLSX.utils.encode_cell({ c: 0, r: R });
            if (ws[dateCell]) {
                ws[dateCell].z = "dd/mm/yyyy hh:mm";
            }

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

    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

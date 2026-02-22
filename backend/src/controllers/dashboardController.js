import { db } from "../db/index.js";
import { order, orderItems, produk, pemasukan, pengeluaran, pelanggan } from "../db/schema.js";
import { eq, and, sql, desc, between } from "drizzle-orm";
import { subDays, startOfDay, endOfDay } from "date-fns";

export const getDashboardSummary = async (request, reply) => {
    const { filter = "today", start_date, end_date } = request.query;
    const user = request.user;

    let startDate = new Date();
    let endDate = new Date();

    switch (filter) {
        case "today":
            startDate = startOfDay(new Date());
            endDate = endOfDay(new Date());
            break;
        case "week":
            startDate = startOfDay(subDays(new Date(), 6));
            endDate = endOfDay(new Date());
            break;
        case "month":
            startDate = startOfDay(subDays(new Date(), 29));
            endDate = endOfDay(new Date());
            break;
        case "custom":
            if (start_date && end_date) {
                startDate = startOfDay(new Date(start_date));
                endDate = endOfDay(new Date(end_date));
            }
            break;
    }

    try {
        // 1. Total Transactions
        const [transactionCount] = await db
            .select({ count: sql`count(*)` })
            .from(order)
            .where(and(between(order.tanggal, startDate, endDate), eq(order.idToko, user.id_toko)));

        // 2. Revenue
        const [revenueResult] = await db
            .select({ total: sql`sum(total)` })
            .from(order)
            .where(and(between(order.tanggal, startDate, endDate), eq(order.idToko, user.id_toko)));

        // 3. Profit (Revenue - Modal)
        const profitResult = await db
            .select({
                profit: sql`sum((cast(${orderItems.harga} as decimal) - cast(${produk.modal} as decimal)) * ${orderItems.quantity})`,
            })
            .from(order)
            .innerJoin(orderItems, eq(order.id, orderItems.idOrder))
            .innerJoin(produk, eq(orderItems.idProduk, produk.id))
            .where(and(between(order.tanggal, startDate, endDate), eq(order.idToko, user.id_toko)));

        // 4. Low Stock Products
        const lowStock = await db
            .select({
                name: produk.nama,
                stock: produk.stok,
            })
            .from(produk)
            .where(and(
                sql`CAST(${produk.stok} AS UNSIGNED) <= 7`,
                sql`CAST(${produk.stok} AS UNSIGNED) >= 1`,
                eq(produk.status, true),
                eq(produk.deleted, false),
                eq(produk.idToko, user.id_toko)
            ))
            .limit(5);

        // 5. Out of Stock Products
        const outOfStock = await db
            .select({
                name: produk.nama,
                stock: produk.stok,
            })
            .from(produk)
            .where(and(
                sql`CAST(${produk.stok} AS UNSIGNED) <= 0`,
                eq(produk.status, true),
                eq(produk.deleted, false),
                eq(produk.idToko, user.id_toko)
            ))
            .limit(5);

        // 6. Recent Orders
        const recentOrders = await db
            .select({
                id: order.id,
                customer: pelanggan.nama,
                total: order.total,
                tanggal: order.tanggal,
            })
            .from(order)
            .leftJoin(pelanggan, eq(order.idPelanggan, pelanggan.id))
            .where(and(between(order.tanggal, startDate, endDate), eq(order.idToko, user.id_toko)))
            .orderBy(desc(order.tanggal))
            .limit(5);

        // 6. Total Asset Modal (Total Modal Terjual / HPP)
        const [inventoryValueResult] = await db
            .select({
                value: sql`sum(cast(${produk.modal} as decimal) * ${orderItems.quantity})`
            })
            .from(order)
            .innerJoin(orderItems, eq(order.id, orderItems.idOrder))
            .innerJoin(produk, eq(orderItems.idProduk, produk.id))
            .where(and(between(order.tanggal, startDate, endDate), eq(order.idToko, user.id_toko)));

        // 7. Charts Data
        const dailyStats = await db
            .select({
                date: sql`DATE_FORMAT(${order.tanggal}, '%Y-%m-%d')`,
                count: sql`count(*)`,
                revenue: sql`sum(${order.total})`
            })
            .from(order)
            .where(and(between(order.tanggal, startDate, endDate), eq(order.idToko, user.id_toko)))
            .groupBy(sql`DATE_FORMAT(${order.tanggal}, '%Y-%m-%d')`)
            .orderBy(sql`DATE_FORMAT(${order.tanggal}, '%Y-%m-%d')`);

        const dailyProfit = await db
            .select({
                date: sql`DATE_FORMAT(${order.tanggal}, '%Y-%m-%d')`,
                profit: sql`sum((cast(${orderItems.harga} as decimal) - cast(${produk.modal} as decimal)) * ${orderItems.quantity})`
            })
            .from(order)
            .innerJoin(orderItems, eq(order.id, orderItems.idOrder))
            .innerJoin(produk, eq(orderItems.idProduk, produk.id))
            .where(and(between(order.tanggal, startDate, endDate), eq(order.idToko, user.id_toko)))
            .groupBy(sql`DATE_FORMAT(${order.tanggal}, '%Y-%m-%d')`)
            .orderBy(sql`DATE_FORMAT(${order.tanggal}, '%Y-%m-%d')`);

        // Merge chart data
        const transaction_chart = dailyStats.map(stat => ({
            date: stat.date,
            count: Number(stat.count)
        }));

        const revenue_chart = dailyStats.map(stat => {
            const profitStat = dailyProfit.find(p => p.date === stat.date);
            return {
                date: stat.date,
                revenue: Number(stat.revenue),
                profit: profitStat ? Number(profitStat.profit) : 0
            };
        });

        return reply.send({
            status: "success",
            data: {
                total_transactions: transactionCount?.count || 0,
                revenue: revenueResult?.total || 0,
                profit: profitResult[0]?.profit || 0,
                lowStockProducts: lowStock,
                outOfStockProducts: outOfStock,
                recentOrders: recentOrders,
                total_inventory_value: inventoryValueResult?.value || 0,
                transaction_chart,
                revenue_chart,
            },
        });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Internal server error",
            error: error.message,
            cause: error.cause ? error.cause.message || error.cause : undefined
        });
    }
};

export const getOmsetHarian = async (request, reply) => {
    try {
        const today = new Date();
        const start = startOfDay(today);
        const end = endOfDay(today);

        const user = request.user;
        const [revenueResult] = await db
            .select({ total: sql`sum(total)` })
            .from(order)
            .where(and(between(order.tanggal, start, end), eq(order.idToko, user.id_toko)));

        return reply.send({ status: "success", data: { total: revenueResult?.total || 0 } });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getAllOrders = async (request, reply) => {
    try {
        const user = request.user;
        const data = await db.select().from(order).where(eq(order.idToko, user.id_toko)).orderBy(desc(order.tanggal)).limit(100);
        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getLowStockProducts = async (request, reply) => {
    try {
        const user = request.user;
        const products = await db
            .select({
                id: produk.id,
                nama: produk.nama,
                kode_produk: produk.kodeProduk,
                kategori_raw: produk.kategori,
                nama_kategori: kategori.namaKategori,
                modal: produk.modal,
                harga: produk.harga,
                stok: produk.stok,
            })
            .from(produk)
            .leftJoin(kategori, eq(sql`CAST(${produk.kategori} AS UNSIGNED)`, kategori.id))
            .where(and(
                sql`CAST(${produk.stok} AS UNSIGNED) <= 7`,
                sql`CAST(${produk.stok} AS UNSIGNED) >= 1`,
                eq(produk.status, true),
                eq(produk.idToko, user.id_toko),
                eq(produk.deleted, false)
            ));

        const data = products.map(p => ({
            id: p.id,
            name: p.nama,
            sku: p.kode_produk || "-",
            category: p.nama_kategori || p.kategori_raw || "-",
            beli: p.modal || "0",
            jual: p.harga || "0",
            stock: p.stok || "0",
            minStock: 7
        }));

        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const getOutOfStockProducts = async (request, reply) => {
    try {
        const user = request.user;
        const products = await db
            .select({
                id: produk.id,
                nama: produk.nama,
                kode_produk: produk.kodeProduk,
                kategori_raw: produk.kategori,
                nama_kategori: kategori.namaKategori,
                modal: produk.modal,
                harga: produk.harga,
                stok: produk.stok,
            })
            .from(produk)
            .leftJoin(kategori, eq(sql`CAST(${produk.kategori} AS UNSIGNED)`, kategori.id))
            .where(and(
                sql`CAST(${produk.stok} AS UNSIGNED) <= 0`,
                eq(produk.status, true),
                eq(produk.idToko, user.id_toko),
                eq(produk.deleted, false)
            ));

        const data = products.map(p => ({
            id: p.id,
            name: p.nama,
            sku: p.kode_produk || "-",
            category: p.nama_kategori || p.kategori_raw || "-",
            beli: p.modal || "0",
            jual: p.harga || "0",
            stock: p.stok || "0"
        }));

        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};




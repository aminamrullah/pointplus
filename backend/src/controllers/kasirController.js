import { db } from "../db/index.js";
import { order, orderItems, produk, kategori, pelanggan, diskon, metodePembayaran, biayaLain, setting } from "../db/schema.js";
import { eq, and, sql, desc, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const getCategories = async (request, reply) => {
    try {
        const user = request.user;
        const id_toko = user.id_toko;
        const data = await db.select().from(kategori).where(eq(kategori.idToko, id_toko));
        return reply.send({ status: "success", data });
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

export const getKasirProducts = async (request, reply) => {
    try {
        const { category, search, page = "1", perPage = "20" } = request.query;
        const p = parseInt(page);
        const pp = parseInt(perPage);
        const offset = (p - 1) * pp;

        const user = request.user;
        const id_toko = user.id_toko;

        const conditions = [eq(produk.status, true), eq(produk.idToko, id_toko), eq(produk.deleted, false)];

        if (category) {
            conditions.push(eq(produk.kategori, category));
        }
        if (search) {
            conditions.push(like(produk.nama, `%${search}%`));
        }

        const data = await db.select()
            .from(produk)
            .where(and(...conditions))
            .limit(pp)
            .offset(offset);

        // Format full URL for images
        const formattedData = data.map((item) => ({
            ...item,
            foto: item.foto ? `${process.env.APP_BASE_URL}/uploads/produk/${item.foto}` : null,
        }));

        return reply.send({ status: "success", data: formattedData });
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

export const createOrder = async (request, reply) => {
    const data = request.body;
    const user = request.user;
    const id_toko = user.id_toko;

    try {
        // Check if order already exists (Idempotency)
        if (data.transactionId) {
            const [existingOrder] = await db.select({
                id: order.id,
                kodeOrder: order.kodeOrder
            })
                .from(order)
                .where(eq(order.uuidOrder, data.transactionId))
                .limit(1);

            if (existingOrder) {
                return reply.status(200).send({
                    status: "success",
                    message: "Order already exists",
                    data: {
                        orderId: existingOrder.id,
                        orderCode: existingOrder.kodeOrder,
                    },
                });
            }
        }

        const result = await db.transaction(async (tx) => {
            const uuid = data.transactionId || uuidv4();
            const orderCode = `ORD${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

            // 1. Insert Order
            const [newOrder] = await tx.insert(order).values({
                idUser: user.id,
                idToko: id_toko,
                uuidOrder: uuid,
                kodeOrder: orderCode,
                idPelanggan: data.customerId || 0,
                subTotal: data.subTotal.toString(),
                diskon: data.discount.toString(),
                biayaLayanan: data.serviceFee.toString(),
                ppn: data.tax.toString(),
                total: data.total.toString(),
                pembayaran: data.paymentMethod,
                uangDibayar: data.paidAmount?.toString() || "0",
                kembalian: data.change?.toString() || "0",
                tanggal: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const orderId = newOrder.insertId;

            // 2. Insert Order Items & Update Stock
            for (const item of data.items) {
                await tx.insert(orderItems).values({
                    idOrder: orderId,
                    kodeOrder: orderCode,
                    idProduk: item.productId,
                    quantity: item.quantity,
                    harga: item.price.toString(),
                    hargaTotal: item.total.toString(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                // Update Stock
                await tx.update(produk)
                    .set({
                        stok: sql`${produk.stok} - ${item.quantity}`,
                        updatedAt: new Date(),
                    })
                    .where(and(eq(produk.id, item.productId), eq(produk.idToko, id_toko)));
            }

            return { orderId, orderCode };
        });

        return reply.status(201).send({
            status: "success",
            message: "Order berhasil dibuat",
            data: result,
        });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal membuat order" });
    }
};

export const getTaxesAndFees = async (request, reply) => {
    try {
        const user = request.user;
        const id_toko = user.id_toko;
        const data = await db.select().from(biayaLain).where(eq(biayaLain.idToko, id_toko));
        const result = {};
        data.forEach((row) => {
            result[row.type] = row.value;
        });
        return reply.send({ success: true, data: result });
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

export const getCustomers = async (request, reply) => {
    try {
        const user = request.user;
        const id_toko = user.id_toko;
        const data = await db.select().from(pelanggan).where(eq(pelanggan.idToko, id_toko));
        return reply.send({ status: "success", data });
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

export const createCustomer = async (request, reply) => {
    try {
        const { nama, hp, kategori_id } = request.body;
        const user = request.user;
        const id_toko = user.id_toko;

        let kategoriId = null;
        if (kategori_id) {
            kategoriId = parseInt(kategori_id);
        }

        const [result] = await db.insert(pelanggan).values({
            idToko: id_toko,
            nama,
            hp,
            kategoriId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const [newCustomer] = await db.select().from(pelanggan).where(eq(pelanggan.id, result.insertId));
        return reply.send({ status: "success", data: newCustomer });

    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getDiscounts = async (request, reply) => {
    try {
        const user = request.user;
        const id_toko = user.id_toko;
        const data = await db.select().from(diskon).where(eq(diskon.idToko, id_toko));
        return reply.send({ status: "success", data });
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

export const getPaymentMethods = async (request, reply) => {
    try {
        const user = request.user;
        const id_toko = user.id_toko;
        const data = await db.select()
            .from(metodePembayaran)
            .where(
                and(
                    eq(metodePembayaran.idToko, id_toko),
                    eq(metodePembayaran.status, true),
                    eq(metodePembayaran.deleted, false)
                )
            );

        const formattedData = data.map((item) => ({
            ...item,
            nama_metode: item.namaMetode,
            gambar: item.gambar ? `${process.env.APP_BASE_URL}/uploads/payment/${item.gambar}` : null,
        }));

        return reply.send({ status: "success", data: formattedData });
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

export const getHistory = async (request, reply) => {
    try {
        const user = request.user;
        const id_toko = user.id_toko;
        const { limit = "50" } = request.query;

        const data = await db.select({
            id: order.id,
            idUser: order.idUser,
            kodeOrder: order.kodeOrder,
            total: order.total,
            pembayaran: order.pembayaran,
            tanggal: order.tanggal,
            createdAt: order.createdAt,
            customerName: pelanggan.nama,
        })
            .from(order)
            .leftJoin(pelanggan, eq(order.idPelanggan, pelanggan.id))
            .where(eq(order.idToko, id_toko))
            .orderBy(desc(order.tanggal))
            .limit(parseInt(limit));

        return reply.send({ status: "success", data });
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

export const getOrderDetail = async (request, reply) => {
    const { orderId } = request.query;
    if (!orderId) return reply.status(400).send({ status: "error", message: "Order ID missing" });

    try {
        const user = request.user;
        const id_toko = user.id_toko;

        const [orderInfo] = await db.select({
            id: order.id,
            idUser: order.idUser,
            kodeOrder: order.kodeOrder,
            idPelanggan: order.idPelanggan,
            subTotal: order.subTotal,
            diskon: order.diskon,
            biayaLayanan: order.biayaLayanan,
            ppn: order.ppn,
            total: order.total,
            pembayaran: order.pembayaran,
            uangDibayar: order.uangDibayar,
            kembalian: order.kembalian,
            tanggal: order.tanggal,
            createdAt: order.createdAt,
            customerName: pelanggan.nama,
        })
            .from(order)
            .leftJoin(pelanggan, eq(order.idPelanggan, pelanggan.id))
            .where(and(eq(order.id, parseInt(orderId)), eq(order.idToko, id_toko)))
            .limit(1);

        if (!orderInfo) return reply.status(404).send({ status: "error", message: "Order not found" });

        const items = await db.select({
            id: orderItems.id,
            productId: orderItems.idProduk,
            quantity: orderItems.quantity,
            harga: orderItems.harga,
            hargaTotal: orderItems.hargaTotal,
            namaProduk: produk.nama,
        })
            .from(orderItems)
            .leftJoin(produk, eq(orderItems.idProduk, produk.id))
            .where(eq(orderItems.idOrder, parseInt(orderId)));

        return reply.send({
            status: "success",
            data: {
                ...orderInfo,
                items,
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

export const getSetting = async (request, reply) => {
    try {
        const user = request.user;
        const id_toko = user.id_toko;
        const [data] = await db.select().from(setting).where(eq(setting.idToko, id_toko)).limit(1);
        return reply.send({ status: "success", data });
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

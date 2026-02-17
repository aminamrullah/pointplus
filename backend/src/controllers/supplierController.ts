import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db";
import { supliers, supplierDeliveries, supplierPurchases, supplierPurchaseItems, supplierPayments, produk } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { processImageField } from "../utils/imageUtils";

// Suppliers
export const getSuppliers = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const results = await db.select().from(supliers).where(eq(supliers.idToko, user.id_toko));

        // Map to snake_case for frontend
        const data = results.map(s => ({
            id: s.id,
            nama_supplier: s.namaSupplier,
            alamat: s.alamat,
            hp: s.hp,
            email: s.email,
            keterangan: s.keterangan,
            status: s.status,
            foto: s.foto,
            created_at: s.createdAt,
            updated_at: s.updatedAt
        }));

        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createSupplier = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const payload = request.body as any;
        const user = request.user as any;

        // Map snake_case payload to camelCase schema
        const supplierData = {
            namaSupplier: payload.nama_supplier,
            alamat: payload.alamat || "",
            hp: payload.hp || "",
            email: payload.email || "",
            keterangan: payload.keterangan || "",
            status: payload.status || "aktif",
            foto: payload.foto || "",
            idToko: user.id_toko,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const [result] = await db.insert(supliers).values(supplierData);
        return reply.send({ status: "success", message: "Supplier berhasil disimpan", data: result });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan supplier" });
    }
};

export const updateSupplier = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const payload = request.body as any;
        const user = request.user as any;

        const supplierData = {
            namaSupplier: payload.nama_supplier,
            alamat: payload.alamat,
            hp: payload.hp,
            email: payload.email,
            keterangan: payload.keterangan,
            status: payload.status,
            foto: payload.foto,
            updatedAt: new Date(),
        };

        // Remove undefined keys to avoid overriding with undefined
        Object.keys(supplierData).forEach(key =>
            (supplierData as any)[key] === undefined && delete (supplierData as any)[key]
        );

        await db.update(supliers)
            .set(supplierData)
            .where(and(eq(supliers.id, parseInt(id)), eq(supliers.idToko, user.id_toko)));

        return reply.send({ status: "success", message: "Supplier berhasil diperbarui" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui supplier" });
    }
};

export const deleteSupplier = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const user = request.user as any;
        await db.delete(supliers).where(and(eq(supliers.id, parseInt(id)), eq(supliers.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Supplier berhasil dihapus" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus supplier" });
    }
};

// Purchases
export const getSupplierPurchases = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const queryParams = request.query as any;
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 10;
        const offset = Math.max((page - 1) * limit, 0);

        const { supplier_id, status, dateFrom, dateTo } = queryParams;
        const user = request.user as any;

        const conditions = [
            eq(supplierPurchases.deleted, false),
            eq(supplierPurchases.idToko, user.id_toko)
        ];

        if (supplier_id) {
            conditions.push(eq(supplierPurchases.supplierId, parseInt(supplier_id)));
        }
        if (status) {
            conditions.push(eq(supplierPurchases.status, status));
        }
        if (dateFrom) {
            conditions.push(sql`${supplierPurchases.tanggal} >= ${dateFrom + ' 00:00:00'}`);
        }
        if (dateTo) {
            conditions.push(sql`${supplierPurchases.tanggal} <= ${dateTo + ' 23:59:59'}`);
        }

        // Count total
        const [totalCount] = await db
            .select({ count: sql<number>`count(*)` })
            .from(supplierPurchases)
            .where(and(...conditions));

        // Get data
        const results = await db
            .select({
                supplier_purchases: supplierPurchases,
                supplier_name: supliers.namaSupplier
            })
            .from(supplierPurchases)
            .leftJoin(supliers, eq(supplierPurchases.supplierId, supliers.id))
            .where(and(...conditions))
            .orderBy(desc(supplierPurchases.tanggal))
            .limit(limit)
            .offset(offset);

        // Flatten data and map to snake_case for frontend
        const data = results.map(row => ({
            id: row.supplier_purchases.id,
            supplier_id: row.supplier_purchases.supplierId,
            supplier_name: row.supplier_name || "Umum",
            nomor_faktur: row.supplier_purchases.nomorFaktur,
            nomor_so: row.supplier_purchases.nomorSo,
            nomor_po: row.supplier_purchases.nomorPo,
            salesman: row.supplier_purchases.salesman,
            gudang: row.supplier_purchases.gudang,
            subtotal: row.supplier_purchases.subtotal,
            total: row.supplier_purchases.total,
            paid_amount: row.supplier_purchases.paidAmount,
            status: row.supplier_purchases.status,
            catatan: row.supplier_purchases.catatan,
            entry_date: row.supplier_purchases.entryDate,
            tanggal: row.supplier_purchases.tanggal,
            payment_method: row.supplier_purchases.paymentMethod,
            top_days: row.supplier_purchases.topDays,
            notes: row.supplier_purchases.notes,
            created_at: row.supplier_purchases.createdAt,
            updated_at: row.supplier_purchases.updatedAt
        }));

        return reply.send({
            status: "success",
            data,
            total: totalCount.count,
            page,
            limit
        });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createSupplierPurchase = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { items, ...payload } = request.body as any;
        const user = request.user as any;

        // Map frontend snake_case payload to backend camelCase schema
        const purchaseData = {
            supplierId: payload.supplier_id,
            nomorFaktur: payload.nomor_faktur,
            nomorSo: payload.nomor_so || "",
            nomorPo: payload.nomor_po || "",
            salesman: payload.salesman || "",
            gudang: payload.gudang || "",
            subtotal: payload.subtotal || 0,
            total: payload.total || 0,
            paidAmount: payload.paid_amount || 0,
            status: payload.payment_method === "CASH"
                ? "paid"
                : (payload.paid_amount >= payload.total ? "paid" : (payload.paid_amount > 0 ? "partial" : "unpaid")),
            catatan: payload.catatan || "",
            entryDate: payload.entry_date ? new Date(payload.entry_date) : null,
            tanggal: payload.tanggal ? new Date(payload.tanggal) : new Date(),
            paymentMethod: payload.payment_method || "CASH",
            topDays: payload.top_days ? parseInt(payload.top_days) : null,
            notes: payload.notes || "",
            deleted: false
        };

        const result = await db.transaction(async (tx) => {
            const [newPurchase] = await tx.insert(supplierPurchases).values({
                ...purchaseData,
                idToko: user.id_toko,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const purchaseId = (newPurchase as any).insertId;

            if (items && Array.isArray(items)) {
                for (const item of items) {
                    const productId = item.product_id ? parseInt(item.product_id) : null;
                    const qty = parseInt(item.quantity) || 0;
                    const itemModal = item.modal || 0;

                    // Insert detail item
                    await tx.insert(supplierPurchaseItems).values({
                        purchaseId,
                        idToko: user.id_toko,
                        productId: productId,
                        sku: item.sku || item.kode_produk || "",
                        kodeProduk: item.kode_produk || "",
                        namaProduk: item.nama_produk || "",
                        quantity: qty,
                        harga: item.harga || 0,
                        modal: itemModal,
                        totalModal: item.total_modal || 0,
                        subtotal: item.subtotal || 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });

                    // Update product stock and modal price
                    if (productId) {
                        const [existingProduct] = await tx.select().from(produk).where(eq(produk.id, productId));
                        if (existingProduct) {
                            const currentStock = parseFloat(existingProduct.stok || "0");
                            const currentModal = parseFloat(existingProduct.modal || "0");
                            const purchaseQty = qty;
                            const purchasePrice = itemModal;

                            // Calculate Weighted Average Cost (WAC)
                            // (OldStock * OldAvg + NewQty * NewPrice) / (OldStock + NewQty)
                            const currentValuation = currentStock * currentModal;
                            const purchaseValuation = purchaseQty * purchasePrice;
                            const newStock = currentStock + purchaseQty;

                            let newAvgModal = 0;
                            if (newStock > 0) {
                                newAvgModal = (currentValuation + purchaseValuation) / newStock;
                            } else {
                                newAvgModal = purchasePrice;
                            }

                            // Update product with new Stock and Average Cost
                            await tx.update(produk).set({
                                stok: String(newStock),
                                modal: String(newAvgModal),
                                totalModal: String(newStock * newAvgModal), // Ensure total asset value is updated
                                updatedAt: new Date()
                            }).where(eq(produk.id, productId));
                        }
                    }
                }
            }
            return { purchaseId };
        });
        return reply.send({ status: "success", message: "Pembelian berhasil disimpan", data: result });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan pembelian" });
    }
};

// Deliveries
export const getSupplierDeliveries = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const results = await db.select().from(supplierDeliveries).where(eq(supplierDeliveries.idToko, user.id_toko)).orderBy(desc(supplierDeliveries.createdAt));

        // Map to snake_case if needed by frontend
        const data = results.map(d => ({
            id: d.id,
            supplier_id: d.supplierId,
            product_id: d.productId,
            invoice_number: d.invoiceNumber,
            entry_date: d.entryDate,
            quantity: d.quantity,
            total_value: d.totalValue,
            unit_cost: d.unitCost,
            average_cost: d.averageCost,
            payment_method: d.paymentMethod,
            top_days: d.topDays,
            stock_after: d.stockAfter,
            modal_after: d.modalAfter,
            total_value_after: d.totalValueAfter,
            selling_price_after: d.sellingPriceAfter,
            notes: d.notes,
            created_at: d.createdAt,
            updated_at: d.updatedAt
        }));

        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createSupplierDelivery = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const payload = request.body as any;
        const user = request.user as any;
        const productId = parseInt(payload.product_id);

        // Fetch latest product data for "After" snapshot
        let stockAfter = payload.stock_after || "0";
        let modalAfter = payload.modal_after || "0";
        let totalValueAfter = payload.total_value_after || "0";
        let sellingPriceAfter = payload.selling_price_after || "0";

        if (productId) {
            const [fetchedProduct] = await db.select().from(produk).where(eq(produk.id, productId));
            if (fetchedProduct) {
                stockAfter = fetchedProduct.stok || "0";
                modalAfter = fetchedProduct.modal || "0";
                // totalModal in DB or calculated
                totalValueAfter = fetchedProduct.totalModal || String(parseFloat(stockAfter) * parseFloat(modalAfter));
                sellingPriceAfter = fetchedProduct.harga || "0";
            }
        }

        // Map snake_case payload to camelCase schema
        const deliveryData = {
            supplierId: parseInt(payload.supplier_id),
            productId: productId,
            invoiceNumber: payload.invoice_number,
            entryDate: payload.entry_date ? new Date(payload.entry_date) : new Date(),
            quantity: parseInt(payload.quantity),
            totalValue: payload.total_value || 0,
            unitCost: payload.unit_cost || (parseInt(payload.quantity) > 0 ? (payload.total_value || 0) / parseInt(payload.quantity) : 0),
            averageCost: payload.average_cost || modalAfter, // Use fetched modal (which is now WAC) as average cost
            paymentMethod: payload.payment_method || "CASH",
            topDays: payload.top_days ? parseInt(payload.top_days) : null,
            stockAfter: String(stockAfter),
            modalAfter: String(modalAfter),
            totalValueAfter: String(totalValueAfter),
            sellingPriceAfter: String(sellingPriceAfter),
            notes: payload.notes || ""
        };

        const [result] = await db.insert(supplierDeliveries).values({
            ...deliveryData,
            idToko: user.id_toko,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return reply.send({ status: "success", message: "Pengiriman berhasil disimpan", data: result });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan pengiriman" });
    }
};

// Payments
export const getSupplierPayments = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { purchaseId } = request.params as any;
        const user = request.user as any;
        const results = await db.select().from(supplierPayments).where(and(eq(supplierPayments.purchaseId, parseInt(purchaseId)), eq(supplierPayments.idToko, user.id_toko)));

        // Map to snake_case
        const data = results.map(p => ({
            id: p.id,
            purchase_id: p.purchaseId,
            amount: p.amount,
            payment_method: p.paymentMethod,
            notes: p.notes,
            bukti_pembayaran: p.buktiPembayaran,
            paid_at: p.paidAt,
            created_at: p.createdAt,
            updated_at: p.updatedAt
        }));

        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createSupplierPayment = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const payload = request.body as any;
        const user = request.user as any;

        const paymentData = {
            purchaseId: parseInt(payload.purchase_id),
            amount: String(payload.amount),
            paymentMethod: payload.payment_method || "CASH",
            buktiPembayaran: payload.bukti_pembayaran ? processImageField(payload.bukti_pembayaran, "supplier_payment") : null,
            notes: payload.notes || "",
            paidAt: new Date()
        };

        const [result] = await db.insert(supplierPayments).values({
            ...paymentData,
            idToko: user.id_toko,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Update purchase status
        const [purchase] = await db.select().from(supplierPurchases).where(eq(supplierPurchases.id, paymentData.purchaseId));
        if (purchase) {
            const currentPaid = parseFloat(purchase.paidAmount?.toString() || "0");
            const newPaid = currentPaid + parseFloat(paymentData.amount);
            const total = parseFloat(purchase.total?.toString() || "0");

            let newStatus = "unpaid";
            if (newPaid >= total) newStatus = "paid";
            else if (newPaid > 0) newStatus = "partial";

            await db.update(supplierPurchases)
                .set({
                    paidAmount: String(newPaid),
                    status: newStatus as any,
                    updatedAt: new Date()
                })
                .where(eq(supplierPurchases.id, paymentData.purchaseId));
        }

        return reply.send({ status: "success", message: "Pembayaran berhasil disimpan", data: result });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan pembayaran" });
    }
};

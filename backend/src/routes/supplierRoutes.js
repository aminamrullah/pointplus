import {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierPurchases,
    createSupplierPurchase,
    getSupplierDeliveries,
    createSupplierDelivery,
    getSupplierPayments,
    createSupplierPayment
} from "../controllers/supplierController.js";

export async function suplierRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/", getSuppliers);
    typedFastify.post("/", createSupplier);
    typedFastify.put("/:id", updateSupplier);
    typedFastify.delete("/:id", deleteSupplier);
}

export async function supplierPurchaseRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/", getSupplierPurchases);
    typedFastify.get("/:id", getSupplierPurchases);
    typedFastify.post("/", createSupplierPurchase);
    typedFastify.put("/:id", createSupplierPurchase);
    typedFastify.delete("/:id", createSupplierPurchase);
}

export async function supplierDeliveryRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/", getSupplierDeliveries);
    typedFastify.post("/", createSupplierDelivery);
}

export async function supplierPaymentRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/:purchaseId", getSupplierPayments);
    typedFastify.post("/", createSupplierPayment);
}

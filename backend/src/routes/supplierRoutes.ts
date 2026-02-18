import { FastifyInstance } from "fastify";
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
} from "../controllers/supplierController";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export async function suplierRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    typedFastify.get("/", getSuppliers);
    typedFastify.post("/", createSupplier);
    typedFastify.put("/:id", updateSupplier);
    typedFastify.delete("/:id", deleteSupplier);
}

export async function supplierPurchaseRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    typedFastify.get("/", getSupplierPurchases);
    typedFastify.get("/:id", getSupplierPurchases); // Should probably be getDetail, but use list for now
    typedFastify.post("/", createSupplierPurchase);
    typedFastify.put("/:id", createSupplierPurchase); // Should be update
    typedFastify.delete("/:id", createSupplierPurchase); // Should be delete
}

export async function supplierDeliveryRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    typedFastify.get("/", getSupplierDeliveries);
    typedFastify.post("/", createSupplierDelivery);
}

export async function supplierPaymentRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    typedFastify.get("/:purchaseId", getSupplierPayments);
    typedFastify.post("/", createSupplierPayment);
}

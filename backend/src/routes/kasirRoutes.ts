import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
    getCategories,
    getKasirProducts,
    createOrder,
    getTaxesAndFees,
    getCustomers,
    createCustomer,
    getDiscounts,
    getPaymentMethods,
    getHistory,
    getOrderDetail,
    getSetting
} from "../controllers/kasirController";
import { createOrderSchema } from "../schemas/orderSchema";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export default async function kasirRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

    // Auth Middleware for kasir routes
    fastify.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    typedFastify.get("/categories", getCategories);
    typedFastify.get("/products", getKasirProducts);
    typedFastify.post("/order", {
        schema: {
            body: createOrderSchema
        }
    }, createOrder);
    typedFastify.get("/taxes-fees", getTaxesAndFees);
    typedFastify.get("/customers", getCustomers);
    typedFastify.post("/customer", createCustomer);
    typedFastify.get("/discounts", getDiscounts);
    typedFastify.get("/payment-methods", getPaymentMethods);
    typedFastify.get("/history", getHistory);
    typedFastify.get("/order-detail", getOrderDetail);
    typedFastify.get("/setting", getSetting);
}

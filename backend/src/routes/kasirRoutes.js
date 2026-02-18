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
} from "../controllers/kasirController.js";
import { createOrderSchema } from "../schemas/orderSchema.js";

export default async function kasirRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();

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

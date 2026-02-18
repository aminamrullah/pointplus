import { getDashboardSummary, getOmsetHarian, getAllOrders, getLowStockProducts } from "../controllers/dashboardController.js";

export default async function dashboardRoutes(fastify) {
    fastify.get("/", getDashboardSummary);
    fastify.get("/omset", getOmsetHarian);
    fastify.get("/allorder", getAllOrders);
    fastify.get("/getLowStockProducts", getLowStockProducts);
}

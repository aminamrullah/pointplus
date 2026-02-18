import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getDashboardSummary, getOmsetHarian, getAllOrders, getLowStockProducts } from "../controllers/dashboardController";

export default async function dashboardRoutes(fastify: FastifyInstance) {

    fastify.get("/", getDashboardSummary);
    fastify.get("/omset", getOmsetHarian);
    fastify.get("/allorder", getAllOrders);
    fastify.get("/getLowStockProducts", getLowStockProducts);
}

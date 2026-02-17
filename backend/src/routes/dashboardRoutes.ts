import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getDashboardSummary, getOmsetHarian, getAllOrders, getLowStockProducts } from "../controllers/dashboardController";

export default async function dashboardRoutes(fastify: FastifyInstance) {
    // Auth Middleware
    fastify.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    fastify.get("/", getDashboardSummary);
    fastify.get("/omset", getOmsetHarian);
    fastify.get("/allorder", getAllOrders);
    fastify.get("/getLowStockProducts", getLowStockProducts);
}

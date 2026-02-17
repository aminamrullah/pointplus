import { FastifyInstance } from "fastify";
import {
    getSetting, saveSetting,
    getPembayaran, createPembayaran, updatePembayaran, deletePembayaran, updatePembayaranStatus,
    getReward, saveReward,
    getBiaya, saveBiaya,
    getDiskon, createDiskon, updateDiskon, deleteDiskon,
    getStoreInfo
} from "../controllers/settingController";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export async function commonSettingRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    fastify.addHook("preHandler", async (request, reply) => { try { await request.jwtVerify(); } catch (err) { reply.send(err); } });
    typedFastify.get("/", getSetting);
    typedFastify.post("/simpan", saveSetting);
}

export async function pembayaranRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    fastify.addHook("preHandler", async (request, reply) => { try { await request.jwtVerify(); } catch (err) { reply.send(err); } });
    typedFastify.get("/", getPembayaran);
    typedFastify.post("/simpan", createPembayaran);
    typedFastify.put("/update/:id", updatePembayaran);
    typedFastify.patch("/delete/:id", deletePembayaran);
    typedFastify.post("/update-status", updatePembayaranStatus);
}

export async function rewardRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    fastify.addHook("preHandler", async (request, reply) => { try { await request.jwtVerify(); } catch (err) { reply.send(err); } });
    typedFastify.get("/", getReward);
    typedFastify.post("/simpan", saveReward);
}

export async function biayaRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    fastify.addHook("preHandler", async (request, reply) => { try { await request.jwtVerify(); } catch (err) { reply.send(err); } });
    typedFastify.get("/", getBiaya);
    typedFastify.post("/simpan", saveBiaya);
}

export async function diskonRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    fastify.addHook("preHandler", async (request, reply) => { try { await request.jwtVerify(); } catch (err) { reply.send(err); } });
    typedFastify.get("/", getDiskon);
    typedFastify.post("/simpan", createDiskon);
    typedFastify.put("/update/:id", updateDiskon);
    typedFastify.delete("/delete/:id", deleteDiskon);
}

export async function storeInfoRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    typedFastify.get("/", getStoreInfo);
}

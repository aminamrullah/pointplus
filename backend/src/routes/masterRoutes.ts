import { FastifyInstance } from "fastify";
import {
    getKategori, createKategori, updateKategori, deleteKategori,
    getSatuan, createSatuan, updateSatuan, deleteSatuan,
    getBahan, createBahan, updateBahan, deleteBahan
} from "../controllers/masterController";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export async function kategoriRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    fastify.addHook("preHandler", async (request, reply) => { try { await request.jwtVerify(); } catch (err) { reply.send(err); } });
    typedFastify.get("/", getKategori);
    typedFastify.post("/simpan", createKategori);
    typedFastify.put("/update/:id", updateKategori);
    typedFastify.delete("/delete/:id", deleteKategori);
}

export async function satuanRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    fastify.addHook("preHandler", async (request, reply) => { try { await request.jwtVerify(); } catch (err) { reply.send(err); } });
    typedFastify.get("/", getSatuan);
    typedFastify.post("/simpan", createSatuan);
    typedFastify.put("/update/:id", updateSatuan);
    typedFastify.delete("/delete/:id", deleteSatuan);
}

export async function bahanRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    fastify.addHook("preHandler", async (request, reply) => { try { await request.jwtVerify(); } catch (err) { reply.send(err); } });
    typedFastify.get("/", getBahan);
    typedFastify.post("/simpan", createBahan);
    typedFastify.put("/update/:id", updateBahan);
    typedFastify.delete("/delete/:id", deleteBahan);
}

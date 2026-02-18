import { FastifyInstance } from "fastify";
import {
    getPemasukan, createPemasukan, updatePemasukan, softDeletePemasukan,
    getKategoriCatatan, createKategoriCatatan, updateKategoriCatatan, deleteKategoriCatatan,
    getPengeluaran, createPengeluaran, updatePengeluaran, softDeletePengeluaran,
    getUtang, createUtang, updateUtang, softDeleteUtang,
    getPiutang, createPiutang, updatePiutang, softDeletePiutang,
    getPenjualan
} from "../controllers/transactionController";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export async function pemasukanRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    typedFastify.get("/", getPemasukan);
    typedFastify.get("/kategori", getKategoriCatatan);
    typedFastify.post("/kategori", createKategoriCatatan);
    typedFastify.put("/kategori/:id", updateKategoriCatatan);
    typedFastify.delete("/kategori/:id", deleteKategoriCatatan);
    typedFastify.post("/simpan", createPemasukan);
    typedFastify.put("/update/:id", updatePemasukan);
    typedFastify.patch("/soft-delete/:id", softDeletePemasukan);
}

export async function pengeluaranRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    typedFastify.get("/", getPengeluaran);
    typedFastify.post("/simpan", createPengeluaran);
    typedFastify.put("/update/:id", updatePengeluaran);
    typedFastify.patch("/soft-delete/:id", softDeletePengeluaran);
}

export async function utangRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    typedFastify.get("/", getUtang);
    typedFastify.post("/simpan", createUtang);
    typedFastify.put("/update/:id", updateUtang);
    typedFastify.patch("/soft-delete/:id", softDeleteUtang);
}

export async function piutangRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    typedFastify.get("/", getPiutang);
    typedFastify.post("/simpan", createPiutang);
    typedFastify.put("/update/:id", updatePiutang);
    typedFastify.patch("/soft-delete/:id", softDeletePiutang);
}

export async function penjualanRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    typedFastify.get("/", getPenjualan);
}

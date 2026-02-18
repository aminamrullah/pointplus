import { FastifyInstance } from "fastify";
import {
    getPelanggan,
    createPelanggan,
    softDeletePelanggan,
    getKategoriPelanggan,
    createKategoriPelanggan,
    deleteKategoriPelanggan,
    updatePelanggan,
    updateKategoriPelanggan
} from "../controllers/pelangganController";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export default async function pelangganRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

    typedFastify.get("/", getPelanggan);
    typedFastify.post("/simpan", createPelanggan);
    typedFastify.patch("/soft-delete/:id", softDeletePelanggan);

    typedFastify.get("/kategori", getKategoriPelanggan);
    typedFastify.post("/simpankategori", createKategoriPelanggan);
    typedFastify.put("/update/:id", updatePelanggan);
    typedFastify.put("/updatekategori/:id", updateKategoriPelanggan);
    typedFastify.patch("/deletekategori/:id", deleteKategoriPelanggan);
}

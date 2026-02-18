import {
    getKategori, createKategori, updateKategori, deleteKategori,
    getSatuan, createSatuan, updateSatuan, deleteSatuan,
    getBahan, createBahan, updateBahan, deleteBahan
} from "../controllers/masterController.js";

export async function kategoriRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/", getKategori);
    typedFastify.post("/simpan", createKategori);
    typedFastify.put("/update/:id", updateKategori);
    typedFastify.delete("/delete/:id", deleteKategori);
}

export async function satuanRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/", getSatuan);
    typedFastify.post("/simpan", createSatuan);
    typedFastify.put("/update/:id", updateSatuan);
    typedFastify.delete("/delete/:id", deleteSatuan);
}

export async function bahanRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/", getBahan);
    typedFastify.post("/simpan", createBahan);
    typedFastify.put("/update/:id", updateBahan);
    typedFastify.delete("/delete/:id", deleteBahan);
}

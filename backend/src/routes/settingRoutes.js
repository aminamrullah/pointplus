import {
    getSetting, saveSetting,
    getPembayaran, createPembayaran, updatePembayaran, deletePembayaran, updatePembayaranStatus,
    getReward, saveReward,
    getBiaya, saveBiaya,
    getDiskon, createDiskon, updateDiskon, deleteDiskon,
    getStoreInfo
} from "../controllers/settingController.js";

export async function commonSettingRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/", getSetting);
    typedFastify.post("/simpan", saveSetting);
}

export async function pembayaranRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/", getPembayaran);
    typedFastify.post("/simpan", createPembayaran);
    typedFastify.put("/update/:id", updatePembayaran);
    typedFastify.patch("/delete/:id", deletePembayaran);
    typedFastify.post("/update-status", updatePembayaranStatus);
}

export async function rewardRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/", getReward);
    typedFastify.post("/simpan", saveReward);
}

export async function biayaRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/", getBiaya);
    typedFastify.post("/simpan", saveBiaya);
}

export async function diskonRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/", getDiskon);
    typedFastify.post("/simpan", createDiskon);
    typedFastify.put("/update/:id", updateDiskon);
    typedFastify.delete("/delete/:id", deleteDiskon);
}

export async function storeInfoRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();
    typedFastify.get("/", getStoreInfo);
}

import { db } from "../db/index.js";
import { kategori, satuan, bahanBaku } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

// Kategori
export const getKategori = async (request, reply) => {
    try {
        const user = request.user;
        const data = await db.select({
            id: kategori.id,
            id_toko: kategori.idToko,
            nama_kategori: kategori.namaKategori,
            icon: kategori.icon,
            created_at: kategori.createdAt,
            updated_at: kategori.updatedAt
        }).from(kategori).where(eq(kategori.idToko, user.id_toko));
        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createKategori = async (request, reply) => {
    try {
        const data = request.body;
        const user = request.user;
        const insertData = {
            idToko: user.id_toko,
            namaKategori: data.nama_kategori,
            icon: data.icon,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const [result] = await db.insert(kategori).values(insertData);
        return reply.send({ status: "success", message: "Kategori berhasil disimpan", data: result });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan kategori" });
    }
};

export const updateKategori = async (request, reply) => {
    try {
        const { id } = request.params;
        const data = request.body;
        const updateData = { updatedAt: new Date() };
        if (data.nama_kategori) updateData.namaKategori = data.nama_kategori;
        if (data.icon) updateData.icon = data.icon;

        const user = request.user;
        await db.update(kategori)
            .set(updateData)
            .where(and(eq(kategori.id, parseInt(id)), eq(kategori.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Kategori berhasil diperbarui" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui kategori" });
    }
};

export const deleteKategori = async (request, reply) => {
    try {
        const { id } = request.params;
        const user = request.user;
        await db.delete(kategori).where(and(eq(kategori.id, parseInt(id)), eq(kategori.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Kategori berhasil dihapus" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus kategori" });
    }
};

// Satuan
export const getSatuan = async (request, reply) => {
    try {
        const user = request.user;
        const data = await db.select({
            id: satuan.id,
            id_toko: satuan.idToko,
            nama_satuan: satuan.namaSatuan,
            created_at: satuan.createdAt,
            updated_at: satuan.updatedAt
        }).from(satuan).where(eq(satuan.idToko, user.id_toko));
        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createSatuan = async (request, reply) => {
    try {
        const data = request.body;
        const user = request.user;
        const insertData = {
            idToko: user.id_toko,
            namaSatuan: data.nama_satuan,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const [result] = await db.insert(satuan).values(insertData);
        return reply.send({ status: "success", message: "Satuan berhasil disimpan", data: result });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan satuan" });
    }
};

export const updateSatuan = async (request, reply) => {
    try {
        const { id } = request.params;
        const data = request.body;
        const updateData = { updatedAt: new Date() };
        if (data.nama_satuan) updateData.namaSatuan = data.nama_satuan;

        const user = request.user;
        await db.update(satuan)
            .set(updateData)
            .where(and(eq(satuan.id, parseInt(id)), eq(satuan.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Satuan berhasil diperbarui" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui satuan" });
    }
};

export const deleteSatuan = async (request, reply) => {
    try {
        const { id } = request.params;
        const user = request.user;
        await db.delete(satuan).where(and(eq(satuan.id, parseInt(id)), eq(satuan.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Satuan berhasil dihapus" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus satuan" });
    }
};

// Bahan Baku
export const getBahan = async (request, reply) => {
    try {
        const user = request.user;
        const data = await db.select({
            id: bahanBaku.id,
            id_toko: bahanBaku.idToko,
            nama_bahan: bahanBaku.namaBahan,
            harga: bahanBaku.harga,
            created_at: bahanBaku.createdAt,
            updated_at: bahanBaku.updatedAt
        }).from(bahanBaku).where(eq(bahanBaku.idToko, user.id_toko));
        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createBahan = async (request, reply) => {
    try {
        const data = request.body;
        const user = request.user;
        const insertData = {
            idToko: user.id_toko,
            namaBahan: data.nama_bahan,
            harga: data.harga,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const [result] = await db.insert(bahanBaku).values(insertData);
        return reply.send({ status: "success", message: "Bahan berhasil disimpan", data: result });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan bahan" });
    }
};

export const updateBahan = async (request, reply) => {
    try {
        const { id } = request.params;
        const data = request.body;
        const updateData = { updatedAt: new Date() };
        if (data.nama_bahan) updateData.namaBahan = data.nama_bahan;
        if (data.harga) updateData.harga = data.harga;

        const user = request.user;
        await db.update(bahanBaku)
            .set(updateData)
            .where(and(eq(bahanBaku.id, parseInt(id)), eq(bahanBaku.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Bahan berhasil diperbarui" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui bahan" });
    }
};

export const deleteBahan = async (request, reply) => {
    try {
        const { id } = request.params;
        const user = request.user;
        await db.delete(bahanBaku).where(and(eq(bahanBaku.id, parseInt(id)), eq(bahanBaku.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Bahan berhasil dihapus" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus bahan" });
    }
};

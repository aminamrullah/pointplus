import { db } from "../db/index.js";
import { pelanggan, kategoriCustomer } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export const getPelanggan = async (request, reply) => {
    try {
        const { kategori_id } = request.query;
        const user = request.user;

        let conditions = [
            eq(pelanggan.deleted, false),
            eq(pelanggan.idToko, user.id_toko)
        ];

        if (kategori_id) {
            conditions.push(eq(pelanggan.kategoriId, parseInt(kategori_id)));
        }

        const data = await db.select({
            id: pelanggan.id,
            idToko: pelanggan.idToko,
            kategori_id: pelanggan.kategoriId,
            nama: pelanggan.nama,
            hp: pelanggan.hp,
            deleted: pelanggan.deleted,
            createdAt: pelanggan.createdAt,
            updatedAt: pelanggan.updatedAt,
            kategoriPelanggan: kategoriCustomer.nama
        })
            .from(pelanggan)
            .leftJoin(kategoriCustomer, eq(pelanggan.kategoriId, kategoriCustomer.id))
            .where(and(...conditions));

        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error", error: error.message });
    }
};

export const createPelanggan = async (request, reply) => {
    try {
        const data = request.body;
        const user = request.user;
        const [result] = await db.insert(pelanggan).values({
            nama: data.nama,
            hp: data.hp,
            kategoriId: data.kategori_id || null,
            idToko: user.id_toko,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return reply.send({ status: "success", message: "Pelanggan berhasil disimpan", data: result });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan pelanggan", error: error.message });
    }
};

export const softDeletePelanggan = async (request, reply) => {
    try {
        const { id } = request.params;
        const user = request.user;
        await db.update(pelanggan)
            .set({ deleted: true, updatedAt: new Date() })
            .where(and(eq(pelanggan.id, parseInt(id)), eq(pelanggan.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Pelanggan berhasil dihapus" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus pelanggan", error: error.message });
    }
};

export const getKategoriPelanggan = async (request, reply) => {
    try {
        const user = request.user;
        const data = await db.select().from(kategoriCustomer).where(eq(kategoriCustomer.idToko, user.id_toko));
        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error", error: error.message });
    }
};

export const createKategoriPelanggan = async (request, reply) => {
    try {
        const data = request.body;
        const user = request.user;
        const [result] = await db.insert(kategoriCustomer).values({
            ...data,
            idToko: user.id_toko,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return reply.send({ status: "success", message: "Kategori pelanggan berhasil disimpan", data: result });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan kategori pelanggan", error: error.message });
    }
};

export const deleteKategoriPelanggan = async (request, reply) => {
    try {
        const { id } = request.params;
        const user = request.user;
        await db.delete(kategoriCustomer).where(and(eq(kategoriCustomer.id, parseInt(id)), eq(kategoriCustomer.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Kategori pelanggan berhasil dihapus" });
    } catch (error) {
        request.log.error(error);
    }
};

export const updatePelanggan = async (request, reply) => {
    try {
        const { id } = request.params;
        const data = request.body;
        const user = request.user;
        await db.update(pelanggan)
            .set({
                nama: data.nama,
                hp: data.hp,
                kategoriId: data.kategori_id || null,
                updatedAt: new Date()
            })
            .where(and(eq(pelanggan.id, parseInt(id)), eq(pelanggan.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Pelanggan berhasil diperbarui" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui pelanggan", error: error.message });
    }
};

export const updateKategoriPelanggan = async (request, reply) => {
    try {
        const { id } = request.params;
        const data = request.body;
        const user = request.user;
        await db.update(kategoriCustomer)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(kategoriCustomer.id, parseInt(id)), eq(kategoriCustomer.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Kategori pelanggan berhasil diperbarui" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui kategori pelanggan", error: error.message });
    }
};

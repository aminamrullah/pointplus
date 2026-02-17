import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db";
import { pelanggan, kategoriCustomer } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

export const getPelanggan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { kategori_id } = request.query as any;
        const user = request.user as any;

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
            kategori_id: pelanggan.kategoriId, // Changed to underscore to match frontend
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
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error", error: error.message });
    }
};

export const createPelanggan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = request.body as any;
        const user = request.user as any;
        const [result] = await db.insert(pelanggan).values({
            nama: data.nama,
            hp: data.hp,
            kategoriId: data.kategori_id || null, // Map frontend snake_case to backend camelCase
            idToko: user.id_toko,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return reply.send({ status: "success", message: "Pelanggan berhasil disimpan", data: result });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan pelanggan", error: error.message });
    }
};

export const softDeletePelanggan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const user = request.user as any;
        await db.update(pelanggan)
            .set({ deleted: true, updatedAt: new Date() })
            .where(and(eq(pelanggan.id, parseInt(id)), eq(pelanggan.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Pelanggan berhasil dihapus" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus pelanggan", error: error.message });
    }
};

export const getKategoriPelanggan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const data = await db.select().from(kategoriCustomer).where(eq(kategoriCustomer.idToko, user.id_toko));
        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error", error: error.message });
    }
};

export const createKategoriPelanggan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = request.body as any;
        const user = request.user as any;
        const [result] = await db.insert(kategoriCustomer).values({
            ...data,
            idToko: user.id_toko,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return reply.send({ status: "success", message: "Kategori pelanggan berhasil disimpan", data: result });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan kategori pelanggan", error: error.message });
    }
};

export const deleteKategoriPelanggan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const user = request.user as any;
        // Assume soft delete if field exists, otherwise hard delete
        await db.delete(kategoriCustomer).where(and(eq(kategoriCustomer.id, parseInt(id)), eq(kategoriCustomer.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Kategori pelanggan berhasil dihapus" });
    } catch (error: any) {
        request.log.error(error);
    }
};

export const updatePelanggan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const data = request.body as any;
        const user = request.user as any;
        await db.update(pelanggan)
            .set({
                nama: data.nama,
                hp: data.hp,
                kategoriId: data.kategori_id || null, // Map frontend snake_case to backend camelCase
                updatedAt: new Date()
            })
            .where(and(eq(pelanggan.id, parseInt(id)), eq(pelanggan.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Pelanggan berhasil diperbarui" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui pelanggan", error: error.message });
    }
};

export const updateKategoriPelanggan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const data = request.body as any;
        const user = request.user as any;
        // Check if id and idToko match
        await db.update(kategoriCustomer)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(kategoriCustomer.id, parseInt(id)), eq(kategoriCustomer.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Kategori pelanggan berhasil diperbarui" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui kategori pelanggan", error: error.message });
    }
};

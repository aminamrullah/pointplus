import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db";
import { pemasukan, pengeluaran, utang, piutang, order, kategoriCatatan, pelanggan } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Pemasukan
export const getPemasukan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const data = await db.select({
            id: pemasukan.id,
            id_toko: pemasukan.idToko,
            kategori: kategoriCatatan.nama,
            kategori_id: pemasukan.kategori,
            total: pemasukan.total,
            foto: pemasukan.foto,
            catatan: pemasukan.catatan,
            id_pelanggan: pemasukan.idPelanggan,
            nama_pelanggan: pelanggan.nama,
            tanggal: pemasukan.tanggal,
            createdAt: pemasukan.createdAt,
            updatedAt: pemasukan.updatedAt,
        })
            .from(pemasukan)
            .leftJoin(kategoriCatatan, eq(sql`CAST(${pemasukan.kategori} AS UNSIGNED)`, kategoriCatatan.id))
            .leftJoin(pelanggan, eq(sql`CAST(${pemasukan.idPelanggan} AS UNSIGNED)`, pelanggan.id))
            .where(and(eq(pemasukan.deleted, false), eq(pemasukan.idToko, user.id_toko)))
            .orderBy(desc(pemasukan.tanggal));

        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createPemasukan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = request.body as any;
        const user = request.user as any;

        // Map frontend fields (snake_case) to backend schema (camelCase)
        // and remove UI-only or conflicting fields
        const {
            id,
            id_toko,
            id_pelanggan,
            kategori_pelanggan,
            jenis,
            ...insertData
        } = data;

        const [result] = await db.insert(pemasukan).values({
            ...insertData,
            idPelanggan: id_pelanggan || null,
            idToko: user.id_toko,
            tanggal: insertData.tanggal ? new Date(insertData.tanggal) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);

        return reply.send({ status: "success", message: "Pemasukan berhasil disimpan", data: result });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Gagal menyimpan pemasukan",
            error: error.message
        });
    }
};

export const softDeletePemasukan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const user = request.user as any;
        await db.update(pemasukan)
            .set({ deleted: true, updatedAt: new Date() })
            .where(and(eq(pemasukan.id, parseInt(id)), eq(pemasukan.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Pemasukan berhasil dihapus" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus pemasukan" });
    }
};

export const updatePemasukan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const data = request.body as any;
        const user = request.user as any;

        const {
            id: _,
            idToko: __,
            id_toko,
            id_pelanggan,
            kategori_pelanggan,
            jenis,
            nama_pelanggan,
            ...updateData
        } = data;

        await db.update(pemasukan)
            .set({
                ...updateData,
                idPelanggan: id_pelanggan || null,
                tanggal: updateData.tanggal ? new Date(updateData.tanggal) : null,
                updatedAt: new Date()
            } as any)
            .where(and(eq(pemasukan.id, parseInt(id)), eq(pemasukan.idToko, user.id_toko)));

        return reply.send({ status: "success", message: "Pemasukan berhasil diperbarui" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Gagal memperbarui pemasukan",
            error: error.message
        });
    }
};

export const getKategoriCatatan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const data = await db.select().from(kategoriCatatan).where(eq(kategoriCatatan.idToko, user.id_toko));
        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createKategoriCatatan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = request.body as any;
        const user = request.user as any;
        const [result] = await db.insert(kategoriCatatan).values({
            ...data,
            idToko: user.id_toko,
        });
        return reply.send({ status: "success", message: "Kategori berhasil disimpan", data: result });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan kategori" });
    }
};

export const updateKategoriCatatan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const data = request.body as any;
        const user = request.user as any;
        const { id: _, idToko: __, ...updateData } = data;
        await db.update(kategoriCatatan)
            .set(updateData)
            .where(and(eq(kategoriCatatan.id, parseInt(id)), eq(kategoriCatatan.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Kategori berhasil diperbarui" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui kategori" });
    }
};

export const deleteKategoriCatatan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const user = request.user as any;
        await db.delete(kategoriCatatan)
            .where(and(eq(kategoriCatatan.id, parseInt(id)), eq(kategoriCatatan.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Kategori berhasil dihapus" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus kategori" });
    }
};

// Pengeluaran
export const getPengeluaran = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const data = await db.select({
            id: pengeluaran.id,
            id_toko: pengeluaran.idToko,
            kategori: kategoriCatatan.nama,
            kategori_id: pengeluaran.kategori,
            total: pengeluaran.total,
            foto: pengeluaran.foto,
            catatan: pengeluaran.catatan,
            id_pelanggan: pengeluaran.idPelanggan,
            nama_pelanggan: pelanggan.nama,
            tanggal: pengeluaran.tanggal,
            createdAt: pengeluaran.createdAt,
            updatedAt: pengeluaran.updatedAt,
        })
            .from(pengeluaran)
            .leftJoin(kategoriCatatan, eq(sql`CAST(${pengeluaran.kategori} AS UNSIGNED)`, kategoriCatatan.id))
            .leftJoin(pelanggan, eq(sql`CAST(${pengeluaran.idPelanggan} AS UNSIGNED)`, pelanggan.id))
            .where(and(eq(pengeluaran.deleted, false), eq(pengeluaran.idToko, user.id_toko)))
            .orderBy(desc(pengeluaran.tanggal));

        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createPengeluaran = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = request.body as any;
        const user = request.user as any;

        const {
            id,
            id_toko,
            id_pelanggan,
            kategori_pelanggan,
            jenis,
            ...insertData
        } = data;

        const [result] = await db.insert(pengeluaran).values({
            ...insertData,
            idPelanggan: id_pelanggan || null,
            idToko: user.id_toko,
            tanggal: insertData.tanggal ? new Date(insertData.tanggal) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);

        return reply.send({ status: "success", message: "Pengeluaran berhasil disimpan", data: result });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Gagal menyimpan pengeluaran",
            error: error.message
        });
    }
};

export const softDeletePengeluaran = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const user = request.user as any;
        await db.update(pengeluaran)
            .set({ deleted: true, updatedAt: new Date() })
            .where(and(eq(pengeluaran.id, parseInt(id)), eq(pengeluaran.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Pengeluaran berhasil dihapus" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus pengeluaran" });
    }
};

export const updatePengeluaran = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const data = request.body as any;
        const user = request.user as any;

        const {
            id: _,
            idToko: __,
            id_toko,
            id_pelanggan,
            kategori_pelanggan,
            jenis,
            nama_pelanggan,
            ...updateData
        } = data;

        await db.update(pengeluaran)
            .set({
                ...updateData,
                idPelanggan: id_pelanggan || null,
                tanggal: updateData.tanggal ? new Date(updateData.tanggal) : null,
                updatedAt: new Date()
            } as any)
            .where(and(eq(pengeluaran.id, parseInt(id)), eq(pengeluaran.idToko, user.id_toko)));

        return reply.send({ status: "success", message: "Pengeluaran berhasil diperbarui" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Gagal memperbarui pengeluaran",
            error: error.message
        });
    }
};

// Utang
export const getUtang = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const data = await db.select({
            id: utang.id,
            id_toko: utang.idToko,
            pelanggan: pelanggan.nama,
            id_pelanggan: utang.pelanggan,
            nama_pelanggan: pelanggan.nama,
            total: utang.total,
            foto: utang.foto,
            catatan: utang.catatan,
            tempo: utang.tempo,
            tanggal: utang.tanggal,
            status: utang.status,
            createdAt: utang.createdAt,
            updatedAt: utang.updatedAt,
        })
            .from(utang)
            .leftJoin(pelanggan, eq(sql`CAST(${utang.pelanggan} AS UNSIGNED)`, pelanggan.id))
            .where(and(eq(utang.deleted, false), eq(utang.idToko, user.id_toko)))
            .orderBy(desc(utang.tanggal));

        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
};

export const createUtang = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = request.body as any;
        const user = request.user as any;

        const {
            id,
            id_toko,
            id_pelanggan,
            kategori_pelanggan,
            jenis,
            ...insertData
        } = data;

        const [result] = await db.insert(utang).values({
            ...insertData,
            idToko: user.id_toko,
            tanggal: insertData.tanggal ? new Date(insertData.tanggal) : null,
            tempo: insertData.tempo ? new Date(insertData.tempo) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);

        return reply.send({ status: "success", message: "Utang berhasil disimpan", data: result });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Gagal menyimpan utang",
            error: error.message
        });
    }
};

export const softDeleteUtang = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const user = request.user as any;
        await db.update(utang)
            .set({ deleted: true, updatedAt: new Date() })
            .where(and(eq(utang.id, parseInt(id)), eq(utang.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Utang berhasil dihapus" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus utang" });
    }
};

export const updateUtang = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const data = request.body as any;
        const user = request.user as any;

        const {
            id: _,
            idToko: __,
            id_toko,
            id_pelanggan,
            kategori_pelanggan,
            jenis,
            nama_pelanggan,
            ...updateData
        } = data;

        await db.update(utang)
            .set({
                ...updateData,
                tanggal: updateData.tanggal ? new Date(updateData.tanggal) : null,
                tempo: updateData.tempo ? new Date(updateData.tempo) : null,
                updatedAt: new Date()
            } as any)
            .where(and(eq(utang.id, parseInt(id)), eq(utang.idToko, user.id_toko)));

        return reply.send({ status: "success", message: "Utang berhasil diperbarui" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Gagal memperbarui utang",
            error: error.message
        });
    }
};

// Piutang
export const getPiutang = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const data = await db.select({
            id: piutang.id,
            id_toko: piutang.idToko,
            pelanggan: pelanggan.nama,
            id_pelanggan: piutang.pelanggan,
            nama_pelanggan: pelanggan.nama,
            total: piutang.total,
            foto: piutang.foto,
            catatan: piutang.catatan,
            tempo: piutang.tempo,
            tanggal: piutang.tanggal,
            status: piutang.status,
            createdAt: piutang.createdAt,
            updatedAt: piutang.updatedAt,
        })
            .from(piutang)
            .leftJoin(pelanggan, eq(sql`CAST(${piutang.pelanggan} AS UNSIGNED)`, pelanggan.id))
            .where(and(eq(piutang.deleted, false), eq(piutang.idToko, user.id_toko)))
            .orderBy(desc(piutang.tanggal));

        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
};

export const createPiutang = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = request.body as any;
        const user = request.user as any;

        const {
            id,
            id_toko,
            id_pelanggan,
            kategori_pelanggan,
            jenis,
            ...insertData
        } = data;

        const [result] = await db.insert(piutang).values({
            ...insertData,
            idToko: user.id_toko,
            tanggal: insertData.tanggal ? new Date(insertData.tanggal) : null,
            tempo: insertData.tempo ? new Date(insertData.tempo) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);

        return reply.send({ status: "success", message: "Piutang berhasil disimpan", data: result });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Gagal menyimpan piutang",
            error: error.message
        });
    }
};

export const softDeletePiutang = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const user = request.user as any;
        await db.update(piutang)
            .set({ deleted: true, updatedAt: new Date() })
            .where(and(eq(piutang.id, parseInt(id)), eq(piutang.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Piutang berhasil dihapus" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus piutang" });
    }
};

export const updatePiutang = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const data = request.body as any;
        const user = request.user as any;

        const {
            id: _,
            idToko: __,
            id_toko,
            id_pelanggan,
            kategori_pelanggan,
            jenis,
            nama_pelanggan,
            ...updateData
        } = data;

        await db.update(piutang)
            .set({
                ...updateData,
                tanggal: updateData.tanggal ? new Date(updateData.tanggal) : null,
                tempo: updateData.tempo ? new Date(updateData.tempo) : null,
                updatedAt: new Date()
            } as any)
            .where(and(eq(piutang.id, parseInt(id)), eq(piutang.idToko, user.id_toko)));

        return reply.send({ status: "success", message: "Piutang berhasil diperbarui" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            status: "error",
            message: "Gagal memperbarui piutang",
            error: error.message
        });
    }
};

// Penjualan
export const getPenjualan = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const data = await db.select().from(order).where(eq(order.idToko, user.id_toko)).orderBy(desc(order.tanggal));
        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

import { db } from "../db/index.js";
import { users, userPermissions } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const getUsers = async (request, reply) => {
    try {
        const user = request.user;
        const data = await db.select().from(users).where(and(eq(users.deleted, false), eq(users.idToko, user.id_toko)));
        // Remove passwords from response
        const sanitizedData = data.map(({ password, ...user }) => user);
        return reply.send({ status: "success", data: sanitizedData });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createUser = async (request, reply) => {
    try {
        const { password, ...userData } = request.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = request.user;

        const [result] = await db.insert(users).values({
            ...userData,
            idToko: user.id_toko,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return reply.send({ status: "success", message: "User berhasil dibuat", data: result });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal membuat user" });
    }
};

export const updateUser = async (request, reply) => {
    try {
        const { id } = request.params;
        const { password, ...userData } = request.body;

        const updateData = { ...userData, updatedAt: new Date() };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await db.update(users)
            .set(updateData)
            .where(and(eq(users.id, parseInt(id)), eq(users.idToko, request.user.id_toko)));
        return reply.send({ status: "success", message: "User berhasil diperbarui" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui user" });
    }
};

export const softDeleteUser = async (request, reply) => {
    try {
        const { id } = request.params;
        await db.update(users)
            .set({ deleted: true, updatedAt: new Date() })
            .where(and(eq(users.id, parseInt(id)), eq(users.idToko, request.user.id_toko)));
        return reply.send({ status: "success", message: "User berhasil dihapus" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus user" });
    }
};

export const validateEmail = async (request, reply) => {
    try {
        const { email } = request.query;
        const [user] = await db.select().from(users).where(eq(users.username, email)).limit(1);
        return reply.send({ available: !user });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Email validation failed" });
    }
};

export const getUserPermissions = async (request, reply) => {
    try {
        const { userId } = request.params;
        const user = request.user;
        const data = await db.select().from(userPermissions).where(and(eq(userPermissions.userId, parseInt(userId)), eq(userPermissions.idToko, user.id_toko)));
        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal mengambil hak akses" });
    }
};

export const checkPermission = async (request, reply) => {
    try {
        const { userId } = request.params;
        const { permission } = request.query;
        const [data] = await db.select().from(userPermissions)
            .where(and(
                eq(userPermissions.userId, parseInt(userId)),
                eq(userPermissions.permission, permission),
                eq(userPermissions.idToko, request.user.id_toko)
            )).limit(1);
        return reply.send({ status: "success", data: !!data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal cek hak akses" });
    }
};

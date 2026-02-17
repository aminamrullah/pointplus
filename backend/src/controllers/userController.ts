import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db";
import { users, userPermissions } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const data = await db.select().from(users).where(and(eq(users.deleted, false), eq(users.idToko, user.id_toko)));
        // Remove passwords from response
        const sanitizedData = data.map(({ password, ...user }) => user);
        return reply.send({ status: "success", data: sanitizedData });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { password, ...userData } = request.body as any;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = request.user as any;

        const [result] = await db.insert(users).values({
            ...userData,
            idToko: user.id_toko,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return reply.send({ status: "success", message: "User berhasil dibuat", data: result });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal membuat user" });
    }
};

export const updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const { password, ...userData } = request.body as any;

        const updateData: any = { ...userData, updatedAt: new Date() };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await db.update(users)
            .set(updateData)
            .where(and(eq(users.id, parseInt(id)), eq(users.idToko, (request.user as any).id_toko)));
        return reply.send({ status: "success", message: "User berhasil diperbarui" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui user" });
    }
};

export const softDeleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        await db.update(users)
            .set({ deleted: true, updatedAt: new Date() })
            .where(and(eq(users.id, parseInt(id)), eq(users.idToko, (request.user as any).id_toko)));
        return reply.send({ status: "success", message: "User berhasil dihapus" });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus user" });
    }
};

export const validateEmail = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { email } = request.query as any;
        const [user] = await db.select().from(users).where(eq(users.username, email)).limit(1); // Using username as email for now based on common patterns
        return reply.send({ available: !user });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Email validation failed" });
    }
};

export const getUserPermissions = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userId } = request.params as any;
        const user = request.user as any;
        const data = await db.select().from(userPermissions).where(and(eq(userPermissions.userId, parseInt(userId)), eq(userPermissions.idToko, user.id_toko)));
        return reply.send({ status: "success", data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal mengambil hak akses" });
    }
};

export const checkPermission = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userId } = request.params as any;
        const { permission } = request.query as any;
        const [data] = await db.select().from(userPermissions)
            .where(and(
                eq(userPermissions.userId, parseInt(userId)),
                eq(userPermissions.permission, permission),
                eq(userPermissions.idToko, (request.user as any).id_toko)
            )).limit(1);
        return reply.send({ status: "success", data: !!data });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal cek hak akses" });
    }
};

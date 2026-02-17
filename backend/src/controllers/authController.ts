import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db";
import { users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { LoginInput } from "../schemas/authSchema";

export const login = async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) => {
    const { username, password } = request.body;

    try {
        const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

        if (!user) {
            return reply.status(401).send({
                success: false,
                status: "error",
                message: "Username atau Password salah",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return reply.status(401).send({
                success: false,
                status: "error",
                message: "Username atau Password salah",
            });
        }

        const token = await reply.jwtSign({
            id: user.id,
            id_toko: user.idToko,
            username: user.username,
            role: user.role,
        });

        return reply.status(200).send({
            success: true,
            status: "success",
            message: "Login berhasil",
            token,
            user: {
                id: user.id,
                id_toko: user.idToko,
                username: user.username,
                nama_lengkap: user.namaLengkap,
                role: user.role,
                hp: user.hp,
                is_premium: user.isPremium,
                package_type: user.packageType,
            },
        });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            success: false,
            status: "error",
            message: "Internal server error",
            error: error.message,
            cause: error.cause ? error.cause.message || error.cause : undefined
        });
    }
};

export const validateToken = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const decoded = await request.jwtVerify<{ id: number }>();
        const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);

        if (!user) {
            return reply.status(401).send({ status: "error", message: "User not found" });
        }

        return reply.status(200).send({
            success: true,
            status: "success",
            user: {
                id: user.id,
                id_toko: user.idToko,
                username: user.username,
                nama_lengkap: user.namaLengkap,
                role: user.role,
                hp: user.hp,
                is_premium: user.isPremium,
                package_type: user.packageType,
            },
        });
    } catch (error) {
        return reply.status(401).send({
            status: "error",
            message: "Token tidak valid",
        });
    }
};

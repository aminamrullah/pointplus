import { FastifyRequest, FastifyReply } from "fastify";

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
    } catch (err) {
        return reply.status(401).send({
            success: false,
            status: "error",
            message: "Sesi telah berakhir atau token tidak valid. Silakan login kembali.",
        });
    }
};

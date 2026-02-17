import { FastifyInstance } from "fastify";
import { login, validateToken } from "../controllers/authController";
import { loginSchema } from "../schemas/authSchema";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export default async function authRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

    typedFastify.post("/login", {
        schema: {
            body: loginSchema,
        },
    }, login);

    typedFastify.get("/validate-token", validateToken);

    typedFastify.post("/logout", async (request, reply) => {
        return reply.send({ success: true, status: "success", message: "Logout berhasil" });
    });
}

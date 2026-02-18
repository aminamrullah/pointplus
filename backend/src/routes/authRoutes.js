import { login, validateToken } from "../controllers/authController.js";
import { loginSchema } from "../schemas/authSchema.js";

export default async function authRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();

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

import { FastifyInstance } from "fastify";
import {
    getUsers,
    createUser,
    updateUser,
    softDeleteUser,
    validateEmail,
    getUserPermissions,
    checkPermission
} from "../controllers/userController";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export default async function userRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    fastify.addHook("preHandler", async (request, reply) => { try { await request.jwtVerify(); } catch (err) { reply.send(err); } });

    typedFastify.get("/", getUsers);
    typedFastify.post("/simpan", createUser);
    typedFastify.put("/update/:id", updateUser);
    typedFastify.patch("/soft-delete/:id", softDeleteUser);

    // Email validation
    typedFastify.get("/validate-email", validateEmail);

    // Permissions
    typedFastify.get("/:userId/permissions", getUserPermissions);
    typedFastify.get("/:userId/check-permission", checkPermission);
}

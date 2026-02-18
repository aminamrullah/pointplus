import {
    getUsers,
    createUser,
    updateUser,
    softDeleteUser,
    validateEmail,
    getUserPermissions,
    checkPermission
} from "../controllers/userController.js";

export default async function userRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();

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


import { getMyFeatures, seedFeatures, updatePlanFeatures } from "../controllers/featureController.js";
import { authenticate } from "../middleware/auth.js"; // Assuming auth middleware exists (I saw it earlier)

export default async function featureRoutes(fastify, options) {
    fastify.get("/features", { preHandler: [authenticate] }, getMyFeatures);

    // Admin Only - Should have stronger auth (e.g., check role='superadmin')
    fastify.post("/features/seed", { preHandler: [authenticate] }, seedFeatures);
    fastify.post("/plan/features", { preHandler: [authenticate] }, updatePlanFeatures);
}

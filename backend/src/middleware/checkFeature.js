
import { db } from "../db/index.js";
import { storePp, planFeatures, features, userPermissions } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

/**
 * Middleware to check if the current user's store has access to a specific feature
 * @param {string} featureKey - The key of the feature to check (e.g., 'export_excel')
 */
export const checkFeature = (featureKey) => {
    return async (request, reply) => {
        try {
            const idToko = request.user.id_toko;

            // 1. Get the store's package
            const [store] = await db.select().from(storePp).where(eq(storePp.id, idToko)).limit(1);
            const packageType = store?.packageType || 'free';

            // 2. Get the feature ID for the given key
            const [feature] = await db.select().from(features).where(eq(features.key, featureKey)).limit(1);

            if (!feature) {
                // If feature doesn't exist in DB, maybe fail safe or log error
                // For now, let's assume if it's not defined, it's not restricted? 
                // Or safer: deny access.
                request.log.warn(`Feature check failed: Feature '${featureKey}' not found in database.`);
                return reply.status(403).send({
                    success: false,
                    message: `Feature '${featureKey}' is not recognized.`
                });
            }

            // 3. Check if the package allows this feature
            const [allowed] = await db.select()
                .from(planFeatures)
                .where(and(
                    eq(planFeatures.plan, packageType),
                    eq(planFeatures.featureId, feature.id)
                ))
                .limit(1);

            if (!allowed) {
                return reply.status(403).send({
                    success: false,
                    message: "Upgrade paket anda untuk mengakses fitur ini.",
                    code: "FEATURE_RESTRICTED_PACKAGE",
                    requiredFeature: feature.name
                });
            }

            // 4. Check User Permission (for Cashiers)
            // Admins/Owners usually have full access to what the package allows.
            const userRole = request.user.role;
            if (userRole === 'kasir') {
                // Check if cashier has specific permission
                const [userPerm] = await db.select()
                    .from(userPermissions)
                    .where(and(
                        eq(userPermissions.userId, request.user.id),
                        eq(userPermissions.permission, featureKey),
                        eq(userPermissions.idToko, idToko)
                    ))
                    .limit(1);

                if (!userPerm) {
                    return reply.status(403).send({
                        success: false,
                        message: "Anda tidak memiliki akses ke fitur ini.",
                        code: "FEATURE_RESTRICTED_USER"
                    });
                }
            }
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ success: false, message: "Internal server error during feature check" });
        }
    };
};

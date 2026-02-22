
import { db } from "../db/index.js";
import { features, planFeatures, users, storePp, userPermissions } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

// Public: Get all features and their availability for the current user's store package
export const getMyFeatures = async (request, reply) => {
    try {
        const userId = request.user.id;
        const idToko = request.user.id_toko;

        // 1. Get Store Package
        const [store] = await db.select().from(storePp).where(eq(storePp.id, idToko)).limit(1);
        const packageType = store?.packageType || 'free';

        // 2. Get All Features
        const allFeatures = await db.select().from(features);

        // 3. Get Features allowed for this Package
        const planFeats = await db.select().from(planFeatures).where(eq(planFeatures.plan, packageType));
        const allowedFeatureIds = new Set(planFeats.map(pf => pf.featureId));

        // 4. Get User Permissions (if acting as cashier logic, but maybe we just return package capabilities here)
        // The prompt says: "bisa disetting juha akses nya oleh toko/akun utama dan tetap di batasi oleh paket akun toko/utama nya"
        // So we should return:
        // - isConfigurable: does the package allow this?
        // - isEnabled: does the user have permission?

        // Let's get user specific permissions
        const userPerms = await db.select().from(userPermissions).where(and(eq(userPermissions.userId, userId), eq(userPermissions.idToko, idToko)));
        const userPermSet = new Set(userPerms.map(up => up.permission));

        const result = allFeatures.map(feature => {
            const isPackageAllowed = allowedFeatureIds.has(feature.id);
            // If user is admin/superadmin within the store, they have all package-allowed features.
            // If user is cashier, they need specific permission AND package allowance.
            const isUserRoleAdmin = ['admin', 'superadmin', 'admintoko'].includes(request.user.role);

            const isUserAllowed = isPackageAllowed && (isUserRoleAdmin || userPermSet.has(feature.key));

            return {
                ...feature,
                isPackageAllowed, // Store level check (Locked vs Unlocked)
                isUserAllowed,    // User level check (Enabled vs Disabled)
            };
        });

        return reply.send({
            success: true,
            packageType,
            features: result
        });

    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ success: false, message: "Internal server error" });
    }
};

// Admin: Seed features (Safe to run multiple times)
export const seedFeatures = async (request, reply) => {
    try {
        // Example features list
        const defaultFeatures = [
            { name: "Laporan Keuangan Advanced", key: "advanced_reports", description: "Akses laporan keuangan detail" },
            { name: "Multi Gudang", key: "multi_warehouse", description: "Kelola stok di banyak gudang" },
            { name: "Manajemen Hutang Piutang", key: "debt_management", description: "Catat hutang dan piutang pelanggan" },
            { name: "Cetak Struk Custom", key: "custom_receipt", description: "Logo dan footer struk custom" },
            { name: "Export Excel", key: "export_excel", description: "Export data ke Excel" },
        ];

        for (const feat of defaultFeatures) {
            // Check if exists
            const [existing] = await db.select().from(features).where(eq(features.key, feat.key));
            if (!existing) {
                await db.insert(features).values(feat);
            }
        }

        // Seed Plan Defaults (Example)
        // Free: Only debt_management
        // Silver: debt_management, export_excel
        // Gold: All

        // This is simplified. Real admin panel would manage this via valid API.

        return reply.send({ success: true, message: "Features seeded" });
    } catch (error) {
        return reply.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Configure Plan Features
export const updatePlanFeatures = async (request, reply) => {
    // Only superadmin (system owner) can call this
    // TODO: Add proper middleware check for system superadmin
    const { plan, featureIds } = request.body; // featureIds: [1, 2, ...]

    try {
        // Clear existing for plan
        await db.delete(planFeatures).where(eq(planFeatures.plan, plan));

        const values = featureIds.map(fid => ({
            plan,
            featureId: fid
        }));

        if (values.length > 0) {
            await db.insert(planFeatures).values(values);
        }

        return reply.send({ success: true, message: `Updated features for plan ${plan}` });
    } catch (error) {
        return reply.status(500).send({ success: false, message: error.message });
    }
};

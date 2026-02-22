import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import {
    serializerCompiler,
    validatorCompiler,
    jsonSchemaTransform,
} from "fastify-type-provider-zod";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import kasirRoutes from "./routes/kasirRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import pelangganRoutes from "./routes/pelangganRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import {
    suplierRoutes,
    supplierPurchaseRoutes,
    supplierDeliveryRoutes,
    supplierPaymentRoutes,
} from "./routes/supplierRoutes.js";
import {
    kategoriRoutes,
    satuanRoutes,
    bahanRoutes,
} from "./routes/masterRoutes.js";
import {
    pemasukanRoutes,
    pengeluaranRoutes,
    utangRoutes,
    piutangRoutes,
    penjualanRoutes,
} from "./routes/transactionRoutes.js";
import {
    commonSettingRoutes,
    pembayaranRoutes,
    rewardRoutes,
    biayaRoutes,
    diskonRoutes,
    storeInfoRoutes,
} from "./routes/settingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import featureRoutes from "./routes/featureRoutes.js";
import path from "path";
import { fileURLToPath } from 'url';
import fastifyStatic from "@fastify/static";
import { authenticate } from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true,
    bodyLimit: 1048576 * 10, // 10 MB
});

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// Handle global errors and prevent information leakage
fastify.setErrorHandler(async (error, request, reply) => {
    if (error.code === "FST_ERR_CTP_EMPTY_JSON_BODY") {
        request.body = {};
        return;
    }

    const isDev = process.env.NODE_ENV === "development";

    // Log error for internal monitoring
    request.log.error(error);

    if (!reply.sent) {
        const statusCode = error.statusCode || 500;
        reply.code(statusCode).send({
            success: false,
            status: "error",
            message: statusCode === 500 && !isDev
                ? "Terjadi kesalahan pada server. Silakan coba lagi nanti."
                : error.message,
            // Only send stack/details in dev
            ...(isDev && {
                error: error.name || "Error",
                details: error.details,
                stack: error.stack
            }),
        });
    }
});

// Security Plugins
fastify.register(helmet, {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:", "*"],
            fontSrc: ["'self'", "https:", "data:"],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Rate Limiting - General protection against Brute Force and DoS
fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: (request, context) => {
        return {
            statusCode: 429,
            error: "Too Many Requests",
            message: "Terlalu banyak permintaan. Silakan tunggu sebentar.",
        };
    },
});

// CORS Configuration
fastify.register(cors, {
    origin: (origin, cb) => {
        const allowed = process.env.ALLOWED_ORIGINS?.split(",") || [];
        if (!origin || allowed.includes(origin) || process.env.NODE_ENV === "development") {
            cb(null, true);
            return;
        }
        cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
});

fastify.register(multipart, {
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit images to 5MB
    },
});

// Request Sanitization Hook
fastify.addHook("preValidation", async (request) => {
    if (request.body && typeof request.body === "object" && !Array.isArray(request.body)) {
        // Simple sanitization: Trim all strings in body
        Object.keys(request.body).forEach((key) => {
            if (typeof request.body[key] === "string") {
                request.body[key] = request.body[key].trim();
            }
        });
    }
});

// Serve static files
fastify.register(fastifyStatic, {
    root: path.join(__dirname, "../uploads"),
    prefix: "/uploads/",
});

// Auth
fastify.register(jwt, {
    secret: process.env.JWT_SECRET || "super-secret-key",
});

// Routes
fastify.register(
    async (api) => {
        // Global Auth Hook for all /api routes except public ones
        api.addHook("preHandler", async (request, reply) => {
            // List of public routes in /api
            const publicRoutes = ["/login", "/health"];
            const isPublic = publicRoutes.some(route => request.url.startsWith(`/api${route}`));

            if (!isPublic) {
                await authenticate(request, reply);
            }
        });

        api.register(authRoutes, { prefix: "/" }); // /api/login is here
        api.register(productRoutes, { prefix: "/produk" });
        api.register(kasirRoutes, { prefix: "/kasir" });
        api.register(dashboardRoutes, { prefix: "/dashboard" });
        api.register(pelangganRoutes, { prefix: "/pelanggan" });
        api.register(userRoutes, { prefix: "/users" });
        api.register(userRoutes, { prefix: "/user" });
        api.register(suplierRoutes, { prefix: "/suplier" });
        api.register(supplierPurchaseRoutes, { prefix: "/supplier-purchases" });
        api.register(supplierDeliveryRoutes, { prefix: "/supplier-deliveries" });
        api.register(supplierPaymentRoutes, { prefix: "/supplier-payments" });
        api.register(kategoriRoutes, { prefix: "/kategori" });
        api.register(satuanRoutes, { prefix: "/satuan" });
        api.register(bahanRoutes, { prefix: "/bahan" });
        api.register(pemasukanRoutes, { prefix: "/pemasukan" });
        api.register(pengeluaranRoutes, { prefix: "/pengeluaran" });
        api.register(utangRoutes, { prefix: "/utang" });
        api.register(piutangRoutes, { prefix: "/piutang" });
        api.register(penjualanRoutes, { prefix: "/penjualan" });
        api.register(commonSettingRoutes, { prefix: "/setting" });
        api.register(pembayaranRoutes, { prefix: "/pembayaran" });
        api.register(rewardRoutes, { prefix: "/reward" });
        api.register(biayaRoutes, { prefix: "/biaya" });
        api.register(diskonRoutes, { prefix: "/diskon" });
        api.register(storeInfoRoutes, { prefix: "/toko_pp" });
        api.register(reportRoutes, { prefix: "/reports" });
        api.register(featureRoutes, { prefix: "/" });
    },
    { prefix: "/api" },
);

// Health Check
fastify.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
});

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || "5000");
        const baseUrl = process.env.APP_BASE_URL || `http://localhost:${port}`;

        await fastify.listen({ port, host: "0.0.0.0" });
        console.log(`🚀 Server running at ${baseUrl}`);
        console.log(`📡 API Base URL set to: ${process.env.APP_BASE_URL}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

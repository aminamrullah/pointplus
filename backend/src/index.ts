import Fastify, { FastifyInstance } from "fastify";
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
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import kasirRoutes from "./routes/kasirRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import pelangganRoutes from "./routes/pelangganRoutes";
import userRoutes from "./routes/userRoutes";
import {
  suplierRoutes,
  supplierPurchaseRoutes,
  supplierDeliveryRoutes,
  supplierPaymentRoutes,
} from "./routes/supplierRoutes";
import {
  kategoriRoutes,
  satuanRoutes,
  bahanRoutes,
} from "./routes/masterRoutes";
import {
  pemasukanRoutes,
  pengeluaranRoutes,
  utangRoutes,
  piutangRoutes,
  penjualanRoutes,
} from "./routes/transactionRoutes";
import {
  commonSettingRoutes,
  pembayaranRoutes,
  rewardRoutes,
  biayaRoutes,
  diskonRoutes,
  storeInfoRoutes,
} from "./routes/settingRoutes";
import reportRoutes from "./routes/reportRoutes";

dotenv.config();

const fastify = Fastify({
  logger: true,
  bodyLimit: 1048576 * 10, // 10 MB
});

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// Handle empty JSON body - set to empty object instead of error
fastify.setErrorHandler(async (error: any, request, reply) => {
  if (error.code === "FST_ERR_CTP_EMPTY_JSON_BODY") {
    (request as any).body = {};
    return;
  }

  // Default error handler
  if (!reply.sent) {
    reply.code(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name || "Error",
      message: error.message,
    });
  }
});

import path from "path";
import fastifyStatic from "@fastify/static";

// Security Plugins
fastify.register(helmet, {
  crossOriginResourcePolicy: { policy: "cross-origin" },
});
fastify.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});
fastify.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
});
fastify.register(multipart);

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
  async (api: FastifyInstance) => {
    api.register(authRoutes, { prefix: "/" });
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
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(
      `🚀 Server advanced, cepat dan aman running at http://localhost:${port}`,
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

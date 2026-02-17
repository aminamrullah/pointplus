import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  getProducts,
  createProduct,
  updateProduct,
  updateCalculator,
  getReferences,
  lookupProductByStoreBarcode,
  updateProductStatus,
  softDeleteProduct,
  importProducts,
  exportProducts,
  exportCalculator,
  importCalculator,
} from "../controllers/productController";
import {
  productSchema,
  updateCalculatorSchema,
} from "../schemas/productSchema";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from "zod";

export default async function productRoutes(fastify: FastifyInstance) {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  // Auth Middleware
  fastify.addHook("preHandler", async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  typedFastify.get("/", getProducts);
  typedFastify.get("/references", getReferences);
  typedFastify.post(
    "/simpan",
    {
      schema: {
        body: productSchema,
      },
    },
    createProduct,
  );

  typedFastify.put(
    "/update/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: productSchema,
      },
    },
    updateProduct,
  );

  typedFastify.put(
    "/calculator/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: updateCalculatorSchema,
      },
    },
    updateCalculator,
  );

  typedFastify.get("/lookup", lookupProductByStoreBarcode);
  typedFastify.post("/update-status", updateProductStatus);
  typedFastify.patch("/soft-delete/:id", softDeleteProduct);
  typedFastify.post("/import", importProducts);
  typedFastify.get("/export", exportProducts);
  typedFastify.get("/export-calculator", exportCalculator);
  typedFastify.post("/import-calculator", importCalculator);
}

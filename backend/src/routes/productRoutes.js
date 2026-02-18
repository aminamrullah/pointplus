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
} from "../controllers/productController.js";
import {
    productSchema,
    updateCalculatorSchema,
} from "../schemas/productSchema.js";
import { z } from "zod";

export default async function productRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();

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

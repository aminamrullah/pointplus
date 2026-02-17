import { z } from "zod";

export const orderItemSchema = z.object({
    productId: z.number(),
    quantity: z.number(),
    price: z.number(),
    total: z.number(),
});

export const createOrderSchema = z.object({
    customerId: z.number().optional().nullable(),
    subTotal: z.number(),
    discount: z.number().or(z.string()).default(0),
    serviceFee: z.number().default(0),
    tax: z.number().default(0),
    total: z.number(),
    paymentMethod: z.string(),
    paidAmount: z.number().default(0),
    change: z.number().default(0),
    transactionId: z.string().optional(),
    items: z.array(orderItemSchema),
});

export type OrderInput = z.infer<typeof createOrderSchema>;

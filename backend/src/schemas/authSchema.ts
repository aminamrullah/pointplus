import { z } from "zod";

export const loginSchema = z.object({
    username: z.string().email("Username must be a valid email").or(z.string().min(3)),
    password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;

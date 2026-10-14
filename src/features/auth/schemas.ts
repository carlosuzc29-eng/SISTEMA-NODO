import { z } from "zod";

export const loginSchema = z.object({
  usuario: z
    .string()
    .min(2, "El usuario debe tener al menos 2 caracteres")
    .max(50, "El usuario no debe exceder 50 caracteres")
    .transform((val) => val.trim().toLowerCase()),
  pin: z
    .string()
    .regex(/^\d{6}$/, "El PIN debe tener exactamente 6 números"),
});

export type LoginInput = z.infer<typeof loginSchema>;

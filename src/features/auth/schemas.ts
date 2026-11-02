import { z } from "zod";

export const loginSchema = z.object({
  usuario: z
    .string()
    .min(2, "El usuario debe tener al menos 2 caracteres")
    .max(50, "El usuario no debe exceder 50 caracteres")
    .transform((val) => val.trim().toLowerCase()),
  pin: z
    .string()
    .min(4, "La clave debe tener al menos 4 caracteres")
    .max(30, "La clave no debe exceder 30 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

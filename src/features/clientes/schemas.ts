import { z } from "zod";

export const clienteSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  empresa: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.string().email("Correo electrónico inválido").optional().nullable().or(z.literal("")),
  notas: z.string().optional().nullable(),
});

export type ClienteInput = z.infer<typeof clienteSchema>;

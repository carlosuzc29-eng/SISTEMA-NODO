import { z } from "zod";

export const guardarMockupSchema = z.object({
  orden_id: z.string().min(1, "La orden es requerida"),
  modelo_tipo: z.enum(["caja_tuck_end", "caja_pizza", "bolsa_kraft"]),
  ancho_cm: z.number().positive("El ancho debe ser mayor a 0"),
  alto_cm: z.number().positive("El alto debe ser mayor a 0"),
  profundidad_cm: z.number().positive("La profundidad debe ser mayor a 0"),
  grosor_mm: z.number().positive().default(0.5),
  textura_arte_url: z.string().nullable().optional(),
  textura_acabado_url: z.string().nullable().optional(),
  acabado_barniz_uv: z.boolean().default(false),
  acabado_hot_stamping: z.enum(["ninguno", "oro", "plata", "cobre"]).default("ninguno"),
  acabado_relieve: z.boolean().default(false),
  snapshot_url: z.string().nullable().optional(),
});

export type GuardarMockupInput = z.infer<typeof guardarMockupSchema>;

export const aprobarArteSchema = z.object({
  token: z.string().min(1, "Token inválido"),
  nombre: z.string().min(2, "Ingresa tu nombre completo para la constancia de aprobación"),
  cargo_dni: z.string().optional().nullable(),
});

export type AprobarArteInput = z.infer<typeof aprobarArteSchema>;

export const solicitarCambiosSchema = z.object({
  token: z.string().min(1, "Token inválido"),
  nombre: z.string().min(2, "Ingresa tu nombre"),
  comentarios: z.string().min(5, "Por favor describe con claridad qué ajustes necesitas en el arte"),
});

export type SolicitarCambiosInput = z.infer<typeof solicitarCambiosSchema>;

import { z } from "zod";

export const crearOrdenSchema = z.object({
  cliente_id: z.string().min(1, "Selecciona un cliente para la orden"),
  tipo_trabajo_id: z.string().min(1, "Selecciona el tipo de trabajo"),
  titulo: z.string().min(3, "El título o descripción del producto debe tener al menos 3 caracteres"),
  descripcion: z.string().optional().nullable(),
  cantidad: z.coerce.number().int().min(1, "La cantidad debe ser mayor a 0"),
  material: z.string().min(2, "Especifica el material a utilizar"),
  medidas: z.string().min(2, "Indica las medidas del trabajo (ej. 10x15 cm o 60x60x140 mm)"),
  tintas: z.string().min(1, "Indica las tintas de impresión (ej. 4/0 CMYK)"),
  acabados: z.string().optional().nullable(),
  usa_planchas_existentes: z.boolean().optional().default(false),
  acabado_ids: z.array(z.string()).optional().default([]),
  notas_acabado: z.string().optional().nullable(),
  prioridad: z.enum(["baja", "normal", "alta", "urgente"]),
  fecha_entrega: z.string().min(1, "Indica la fecha de entrega prometida"),
  ruta: z.array(z.string()).min(1, "La ruta debe tener al menos un área de producción"),
});

export type CrearOrdenInput = z.input<typeof crearOrdenSchema>;

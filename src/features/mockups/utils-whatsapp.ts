import { brand } from "@/config/brand";

export interface GenerarMensajeWhatsAppParams {
  telefono?: string | null;
  clienteNombre: string;
  codigoOrden: string;
  tituloOrden: string;
  tokenAprobacion: string;
  baseUrl?: string;
}

export function generarEnlaceWhatsApp({
  telefono,
  clienteNombre,
  codigoOrden,
  tituloOrden,
  tokenAprobacion,
  baseUrl = "http://localhost:3000",
}: GenerarMensajeWhatsAppParams): string {
  const urlAprobacion = `${baseUrl}/aprobar/${tokenAprobacion}`;

  const mensaje = `Hola ${clienteNombre}! 👋

Te compartimos la vista interactiva 3D de tu pedido en *${brand.nombre}*:

📦 *Orden:* ${codigoOrden} — ${tituloOrden}
🔗 *Revisar y Aprobar Arte 3D:*
${urlAprobacion}

Puedes rotar el empaque 360°, abrir la tapa y confirmar tu aprobación o solicitar ajustes directamente desde tu móvil. ¡Quedamos atentos! ✨`;

  const encodedMensaje = encodeURIComponent(mensaje);

  if (telefono && telefono.trim().length > 0) {
    // Limpiar caracteres no numéricos
    const cleanPhone = telefono.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodedMensaje}`;
  }

  return `https://wa.me/?text=${encodedMensaje}`;
}

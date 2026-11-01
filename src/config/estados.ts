import { EstadoOT, EstadoEtapa } from "@/types/database";

/**
 * Metadata representativa de cada estado posible de una Orden de Trabajo (OT).
 */
export interface EstadoOtMetadata {
  id: EstadoOT;
  label: string;
  descripcion: string;
  badgeClass: string;
  badgeDotClass: string;
  icono: string;
  ordenEmbudo: number;
  esEnCurso: boolean;
  esTerminada: boolean;
  esCancelada: boolean;
}

/**
 * Metadata representativa de cada estado posible de una Etapa de Producción.
 */
export interface EstadoEtapaMetadata {
  id: EstadoEtapa;
  label: string;
  descripcion: string;
  badgeClass: string;
  badgeBg: string;
  icono: string;
  bloqueaTablero: boolean;
  requiereAccionOperador: boolean;
  esEnEspera: boolean; // Indica si pertenece a la columna unificada "En espera" en el Kanban
}

// ==============================================================================
// 1. CONFIGURACIÓN CENTRAL DE ESTADOS DE ORDEN (ESTADO_OT)
// ==============================================================================

export const ESTADOS_OT = {
  en_puerta: {
    id: "en_puerta",
    label: "En Puerta",
    descripcion: "Registrada y en espera de confirmación y liberación a planta",
    badgeClass: "bg-[var(--ink-yellow-subtle)] text-[var(--ink-yellow-foreground)] border border-[var(--ink-yellow)]/30",
    badgeDotClass: "bg-[var(--ink-yellow)]",
    icono: "DoorClosed",
    ordenEmbudo: 1,
    esEnCurso: false,
    esTerminada: false,
    esCancelada: false,
  },
  en_produccion: {
    id: "en_produccion",
    label: "En Producción",
    descripcion: "En ejecución activa a través de las estaciones de planta",
    badgeClass: "bg-[var(--ink-magenta-subtle)] text-[var(--ink-magenta-foreground)] border border-[var(--ink-magenta)]/30 font-semibold",
    badgeDotClass: "bg-[var(--ink-magenta)]",
    icono: "Play",
    ordenEmbudo: 2,
    esEnCurso: true,
    esTerminada: false,
    esCancelada: false,
  },
  lista_despacho: {
    id: "lista_despacho",
    label: "Lista para Despacho",
    descripcion: "Todas las fases de manufactura completadas; lista para entrega o retiro",
    badgeClass: "bg-[var(--color-registry-green-subtle)] text-[var(--color-registry-green-foreground)] border border-[var(--color-registry-green)]/30 font-semibold",
    badgeDotClass: "bg-[var(--color-registry-green)]",
    icono: "PackageCheck",
    ordenEmbudo: 3,
    esEnCurso: false,
    esTerminada: false,
    esCancelada: false,
  },
  despachada: {
    id: "despachada",
    label: "Despachada",
    descripcion: "Mercancía entregada formalmente al cliente o transporte",
    badgeClass: "bg-[var(--ink-key-subtle)] text-[var(--ink-key-foreground)] border border-border/80",
    badgeDotClass: "bg-[var(--ink-key)]",
    icono: "Truck",
    ordenEmbudo: 4,
    esEnCurso: false,
    esTerminada: true,
    esCancelada: false,
  },
  cancelada: {
    id: "cancelada",
    label: "Cancelada",
    descripcion: "Trabajo anulado u orden cancelada",
    badgeClass: "bg-[var(--destructive-subtle)] text-[var(--color-destructive)] border border-[var(--color-destructive)]/30",
    badgeDotClass: "bg-[var(--color-destructive)]",
    icono: "Ban",
    ordenEmbudo: 5,
    esEnCurso: false,
    esTerminada: false,
    esCancelada: true,
  },
  // Retrocompatibilidad con valores legacy
  recibida: {
    id: "recibida",
    label: "En Puerta (Recibida)",
    descripcion: "Legacy: mapeado a En Puerta",
    badgeClass: "bg-[var(--ink-yellow-subtle)] text-[var(--ink-yellow-foreground)] border border-[var(--ink-yellow)]/30",
    badgeDotClass: "bg-[var(--ink-yellow)]",
    icono: "DoorClosed",
    ordenEmbudo: 1,
    esEnCurso: false,
    esTerminada: false,
    esCancelada: false,
  },
  lista_entrega: {
    id: "lista_entrega",
    label: "Lista para Despacho",
    descripcion: "Legacy: mapeado a Lista para Despacho",
    badgeClass: "bg-[var(--color-registry-green-subtle)] text-[var(--color-registry-green-foreground)] border border-[var(--color-registry-green)]/30 font-semibold",
    badgeDotClass: "bg-[var(--color-registry-green)]",
    icono: "PackageCheck",
    ordenEmbudo: 3,
    esEnCurso: false,
    esTerminada: false,
    esCancelada: false,
  },
  entregada: {
    id: "entregada",
    label: "Despachada (Entregada)",
    descripcion: "Legacy: mapeado a Despachada",
    badgeClass: "bg-[var(--ink-key-subtle)] text-[var(--ink-key-foreground)] border border-border/80",
    badgeDotClass: "bg-[var(--ink-key)]",
    icono: "Truck",
    ordenEmbudo: 4,
    esEnCurso: false,
    esTerminada: true,
    esCancelada: false,
  },
} satisfies Record<EstadoOT, EstadoOtMetadata>;

// ==============================================================================
// 2. CONFIGURACIÓN CENTRAL DE ESTADOS DE ETAPA (ESTADO_ETAPA)
// ==============================================================================

export const ESTADOS_ETAPA = {
  bloqueada: {
    id: "bloqueada",
    label: "Bloqueada",
    descripcion: "En espera de que finalice la etapa anterior en la secuencia",
    badgeClass: "bg-muted text-muted-foreground border border-border/50",
    badgeBg: "bg-muted text-muted-foreground",
    icono: "Lock",
    bloqueaTablero: true,
    requiereAccionOperador: false,
    esEnEspera: false,
  },
  en_cola: {
    id: "en_cola",
    label: "En cola",
    descripcion: "Lista para ser tomada e iniciada por el operador del área",
    badgeClass: "bg-muted/80 text-foreground border border-border/80",
    badgeBg: "bg-muted/80 text-foreground",
    icono: "Clock",
    bloqueaTablero: false,
    requiereAccionOperador: true,
    esEnEspera: false,
  },
  en_proceso: {
    id: "en_proceso",
    label: "En proceso",
    descripcion: "En ejecución activa por un operador en la estación",
    badgeClass: "bg-[var(--ink-magenta-subtle)] text-[var(--ink-magenta-foreground)] border border-[var(--ink-magenta)]/35 font-semibold shadow-xs",
    badgeBg: "bg-[var(--ink-magenta)] text-[var(--color-card)] font-semibold",
    icono: "Play",
    bloqueaTablero: false,
    requiereAccionOperador: true,
    esEnEspera: false,
  },
  pausada: {
    id: "pausada",
    label: "Pausada",
    descripcion: "Detenida temporalmente por un motivo operativo justificado",
    badgeClass: "bg-[var(--ink-yellow-subtle)] text-[var(--ink-yellow-foreground)] border border-dashed border-[var(--ink-yellow)]/40",
    badgeBg: "bg-[var(--ink-yellow-subtle)] text-[var(--ink-yellow-foreground)] border border-dashed border-[var(--ink-yellow)]/40",
    icono: "Pause",
    bloqueaTablero: false,
    requiereAccionOperador: true,
    esEnEspera: true,
  },
  esperando_cliente: {
    id: "esperando_cliente",
    label: "Esperando Cliente",
    descripcion: "Detenida en espera de aprobación de arte digital o 3D por el cliente",
    badgeClass: "bg-[var(--ink-cyan-subtle)] text-[var(--ink-cyan-foreground)] border border-[var(--ink-cyan)]/35 font-medium",
    badgeBg: "bg-[var(--ink-cyan-subtle)] text-[var(--ink-cyan-foreground)] border border-[var(--ink-cyan)]/35",
    icono: "UserCheck",
    bloqueaTablero: false,
    requiereAccionOperador: false,
    esEnEspera: true,
  },
  esperando_proveedor: {
    id: "esperando_proveedor",
    label: "Esperando Proveedor",
    descripcion: "Material enviado a taller externo (laminado, barniz o insumo tercerizado)",
    badgeClass: "bg-[var(--color-pantone-orange-subtle)] text-[var(--color-pantone-orange-foreground)] border border-[var(--color-pantone-orange)]/35 font-medium",
    badgeBg: "bg-[var(--color-pantone-orange-subtle)] text-[var(--color-pantone-orange-foreground)] border border-[var(--color-pantone-orange)]/35",
    icono: "Truck",
    bloqueaTablero: false,
    requiereAccionOperador: true,
    esEnEspera: true,
  },
  secando: {
    id: "secando",
    label: "Secando",
    descripcion: "En reposo de secado tras impresión con temporizador activo",
    badgeClass: "bg-[var(--ink-cyan-subtle)] text-[var(--ink-cyan-foreground)] border border-[var(--ink-cyan)]/35 halftone-cyan",
    badgeBg: "bg-[var(--ink-cyan-subtle)] text-[var(--ink-cyan-foreground)] border border-[var(--ink-cyan)]/35",
    icono: "Timer",
    bloqueaTablero: false,
    requiereAccionOperador: false,
    esEnEspera: true,
  },
  omitida: {
    id: "omitida",
    label: "Omitida",
    descripcion: "Paso de la ruta no requerido para este trabajo o exonerado",
    badgeClass: "bg-muted/70 text-muted-foreground/80 line-through border border-border/40",
    badgeBg: "bg-muted/70 text-muted-foreground/80",
    icono: "SkipForward",
    bloqueaTablero: false,
    requiereAccionOperador: false,
    esEnEspera: false,
  },
  terminada: {
    id: "terminada",
    label: "Terminada",
    descripcion: "Etapa completada conforme a los estándares de calidad",
    badgeClass: "bg-[var(--color-registry-green-subtle)] text-[var(--color-registry-green-foreground)] border border-[var(--color-registry-green)]/35 font-semibold",
    badgeBg: "bg-[var(--color-registry-green-subtle)] text-[var(--color-registry-green-foreground)] border border-[var(--color-registry-green)]/35",
    icono: "Check",
    bloqueaTablero: false,
    requiereAccionOperador: false,
    esEnEspera: false,
  },
} satisfies Record<EstadoEtapa, EstadoEtapaMetadata>;

// ==============================================================================
// 3. MATRIZ DE TRANSICIONES PERMITIDAS
// ==============================================================================

export const TRANSICIONES_ESTADO_OT = {
  en_puerta: ["en_produccion", "cancelada"],
  en_produccion: ["lista_despacho", "cancelada"],
  lista_despacho: ["despachada", "en_produccion", "cancelada"],
  despachada: [],
  cancelada: [],
  // Retrocompatibilidad
  recibida: ["en_puerta", "en_produccion", "cancelada"],
  lista_entrega: ["lista_despacho", "despachada", "cancelada"],
  entregada: [],
} satisfies Record<EstadoOT, readonly EstadoOT[]>;

export const TRANSICIONES_ESTADO_ETAPA = {
  bloqueada: ["en_cola", "omitida"],
  en_cola: ["en_proceso", "pausada", "esperando_cliente", "esperando_proveedor", "omitida"],
  en_proceso: ["pausada", "esperando_cliente", "esperando_proveedor", "secando", "terminada", "omitida"],
  pausada: ["en_proceso", "omitida"],
  esperando_cliente: ["terminada", "pausada", "omitida"],
  esperando_proveedor: ["en_proceso", "pausada", "omitida"],
  secando: ["terminada", "omitida"],
  omitida: [],
  terminada: ["bloqueada", "en_cola"], // Permite reproceso cuando control de calidad rechaza
} satisfies Record<EstadoEtapa, readonly EstadoEtapa[]>;

// ==============================================================================
// 4. MAPEOS DE RETROCOMPATIBILIDAD Y NORMALIZACIÓN DE RUTAS
// ==============================================================================

/**
 * Normaliza estados legacy a sus equivalentes canónicos de Fase 4.
 */
export function normalizarEstadoOt(estado: string): EstadoOT {
  if (estado === "recibida") return "en_puerta";
  if (estado === "lista_entrega") return "lista_despacho";
  if (estado === "entregada") return "despachada";
  if (estado in ESTADOS_OT) return estado as EstadoOT;
  return "en_puerta";
}

/**
 * Mapeo de redirección para slugs de área antiguos hacia los 11 slugs canónicos.
 */
export const MAPEO_SLUGS_LEGACY: Record<string, string> = {
  diseno: "diseno-arte-final",
  impresion: "impresion-secado",
  corte: "corte-refile",
};

/**
 * Retorna el slug canónico de un área (aplica redirección transparente de legacy).
 */
export function normalizarSlugArea(slug: string): string {
  return MAPEO_SLUGS_LEGACY[slug] || slug;
}

// ==============================================================================
// 5. HELPERS Y VERIFICACIÓN EXHAUSTIVA (NEVER)
// ==============================================================================

/**
 * Verificador exhaustivo de TypeScript para garantizar que todos los casos sean manejados.
 */
export function assertNever(x: never, message: string = "Estado no manejado"): never {
  throw new Error(`${message}: ${JSON.stringify(x)}`);
}

/**
 * Obtiene la configuración y metadata tipada de un estado de Orden.
 */
export function getEstadoOtMetadata(estado: EstadoOT): EstadoOtMetadata {
  const meta = ESTADOS_OT[estado];
  if (!meta) {
    return ESTADOS_OT.en_puerta;
  }
  return meta;
}

/**
 * Obtiene la configuración y metadata tipada de un estado de Etapa.
 */
export function getEstadoEtapaMetadata(estado: EstadoEtapa): EstadoEtapaMetadata {
  const meta = ESTADOS_ETAPA[estado];
  if (!meta) {
    return ESTADOS_ETAPA.bloqueada;
  }
  return meta;
}

/**
 * Valida si una transición entre estados de OT es legal.
 */
export function esTransicionOtValida(origen: EstadoOT, destino: EstadoOT): boolean {
  const permitidos = TRANSICIONES_ESTADO_OT[origen] as readonly EstadoOT[];
  return permitidos ? permitidos.includes(destino) : false;
}

/**
 * Valida si una transición entre estados de Etapa es legal.
 */
export function esTransicionEtapaValida(origen: EstadoEtapa, destino: EstadoEtapa): boolean {
  const permitidos = TRANSICIONES_ESTADO_ETAPA[origen] as readonly EstadoEtapa[];
  return permitidos ? permitidos.includes(destino) : false;
}

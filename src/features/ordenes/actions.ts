"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { crearOrdenSchema, CrearOrdenInput } from "./schemas";
import {
  OrdenRow,
  OrdenEtapaRow,
  ClienteRow,
  TipoTrabajoRow,
  AreaRow,
  EventoOrdenRow,
  ComentarioRow,
  PrioridadOT,
  EstadoOT,
} from "@/types/database";
import { obtenerUsuarioActual } from "@/features/auth/actions";
import { mockStore } from "@/lib/mock-store";
import { revalidatePath } from "next/cache";

export type OrdenConRelaciones = OrdenRow & {
  cliente: ClienteRow;
  tipo_trabajo: TipoTrabajoRow;
  area_actual?: AreaRow | null;
  etapas?: (OrdenEtapaRow & { area: AreaRow })[];
  eventos?: EventoOrdenRow[];
  comentarios?: ComentarioRow[];
};

export async function crearOrdenAction(input: CrearOrdenInput): Promise<{
  ok: boolean;
  codigo?: string;
  error?: string;
}> {
  const result = crearOrdenSchema.safeParse(input);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message || "Datos incompletos" };
  }

  const data = result.data;
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: resRpc, error } = await supabase.rpc("crear_orden", {
        p_cliente_id: data.cliente_id,
        p_tipo_trabajo_id: data.tipo_trabajo_id,
        p_titulo: data.titulo,
        p_descripcion: data.descripcion || null,
        p_cantidad: data.cantidad,
        p_material: data.material || null,
        p_medidas: data.medidas || null,
        p_tintas: data.tintas || null,
        p_acabados: data.acabados || null,
        p_prioridad: data.prioridad,
        p_fecha_entrega: data.fecha_entrega,
        p_ruta: data.ruta,
      });

      if (!error && resRpc && typeof resRpc === "object") {
        const resp = resRpc as { ok: boolean; codigo: string };
        revalidatePath("/dashboard");
        revalidatePath("/ordenes");
        revalidatePath("/area", "layout");
        return { ok: true, codigo: resp.codigo };
      }
    } catch {
      // Continuar con store local
    }
  }

  const resMock = mockStore.crearOrden({
    cliente_id: data.cliente_id,
    tipo_trabajo_id: data.tipo_trabajo_id,
    titulo: data.titulo,
    descripcion: data.descripcion,
    cantidad: data.cantidad,
    material: data.material,
    medidas: data.medidas,
    tintas: data.tintas,
    acabados: data.acabados,
    prioridad: data.prioridad,
    fecha_entrega: data.fecha_entrega,
    ruta: data.ruta,
    creada_por: profile?.id,
  });

  revalidatePath("/dashboard");
  revalidatePath("/ordenes");
  revalidatePath("/area", "layout");

  return { ok: true, codigo: resMock.codigo };
}

export async function obtenerOrdenes(filtros?: {
  estado?: EstadoOT;
  prioridad?: PrioridadOT;
  area_id?: string;
  search?: string;
}): Promise<OrdenConRelaciones[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("ordenes")
        .select("*, cliente:clientes(*), tipo_trabajo:tipos_trabajo(*), area_actual:areas(*)")
        .order("created_at", { ascending: false });

      if (filtros?.estado) query = query.eq("estado", filtros.estado);
      if (filtros?.prioridad) query = query.eq("prioridad", filtros.prioridad);
      if (filtros?.area_id) query = query.eq("area_actual_id", filtros.area_id);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as unknown as OrdenConRelaciones[];
      }
    } catch {
      // Fallback
    }
  }

  let list = mockStore.ordenes.map((o) => {
    const cliente = mockStore.clientes.find((c) => c.id === o.cliente_id) || {
      id: o.cliente_id,
      nombre: "Cliente General",
      empresa: null,
      telefono: null,
      email: null,
      notas: null,
      created_at: "",
      updated_at: "",
    };
    const tipo = mockStore.tiposTrabajo.find((t) => t.id === o.tipo_trabajo_id) || {
      id: o.tipo_trabajo_id,
      nombre: "Trabajo General",
      descripcion: null,
      icono: "Box",
      ruta: [],
      modelo_empaque_id: null,
      activo: true,
      created_at: "",
      updated_at: "",
    };
    const area = mockStore.areas.find((a) => a.id === o.area_actual_id) || null;

    return {
      ...o,
      cliente,
      tipo_trabajo: tipo,
      area_actual: area,
    } as OrdenConRelaciones;
  });

  if (filtros?.estado) {
    list = list.filter((o) => o.estado === filtros.estado);
  }
  if (filtros?.prioridad) {
    list = list.filter((o) => o.prioridad === filtros.prioridad);
  }
  if (filtros?.area_id) {
    list = list.filter((o) => o.area_actual_id === filtros.area_id);
  }
  if (filtros?.search) {
    const s = filtros.search.toLowerCase();
    list = list.filter(
      (o) =>
        o.codigo.toLowerCase().includes(s) ||
        o.titulo.toLowerCase().includes(s) ||
        o.cliente.nombre.toLowerCase().includes(s) ||
        (o.cliente.empresa && o.cliente.empresa.toLowerCase().includes(s))
    );
  }

  return list;
}

export async function obtenerOrdenPorCodigo(codigo: string): Promise<OrdenConRelaciones | null> {
  const normCodigo = codigo.toUpperCase();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("ordenes")
        .select("*, cliente:clientes(*), tipo_trabajo:tipos_trabajo(*), area_actual:areas(*)")
        .eq("codigo", normCodigo)
        .single();

      if (!error && data) {
        // Obtener etapas con áreas
        const { data: etapas } = await supabase
          .from("orden_etapas")
          .select("*, area:areas(*)")
          .eq("orden_id", data.id)
          .order("secuencia", { ascending: true });

        // Obtener eventos
        const { data: eventos } = await supabase
          .from("eventos_orden")
          .select("*")
          .eq("orden_id", data.id)
          .order("created_at", { ascending: false });

        // Obtener comentarios
        const { data: comentarios } = await supabase
          .from("comentarios")
          .select("*")
          .eq("orden_id", data.id)
          .order("created_at", { ascending: true });

        return {
          ...(data as unknown as OrdenConRelaciones),
          etapas: etapas as unknown as (OrdenEtapaRow & { area: AreaRow })[],
          eventos: eventos || [],
          comentarios: comentarios || [],
        };
      }
    } catch {
      // Fallback local
    }
  }

  const orden = mockStore.ordenes.find((o) => o.codigo.toUpperCase() === normCodigo);
  if (!orden) return null;

  const cliente = mockStore.clientes.find((c) => c.id === orden.cliente_id) || {
    id: orden.cliente_id,
    nombre: "Cliente General",
    empresa: null,
    telefono: null,
    email: null,
    notas: null,
    created_at: "",
    updated_at: "",
  };
  const tipo = mockStore.tiposTrabajo.find((t) => t.id === orden.tipo_trabajo_id) || {
    id: orden.tipo_trabajo_id,
    nombre: "Trabajo General",
    descripcion: null,
    icono: "Box",
    ruta: [],
    modelo_empaque_id: null,
    activo: true,
    created_at: "",
    updated_at: "",
  };
  const areaActual = mockStore.areas.find((a) => a.id === orden.area_actual_id) || null;

  const etapas = mockStore.etapas
    .filter((e) => e.orden_id === orden.id)
    .sort((a, b) => a.secuencia - b.secuencia)
    .map((e) => ({
      ...e,
      area: mockStore.areas.find((a) => a.id === e.area_id) || mockStore.areas[0],
    }));

  const eventos = mockStore.eventos
    .filter((ev) => ev.orden_id === orden.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const comentarios = mockStore.comentarios
    .filter((c) => c.orden_id === orden.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return {
    ...orden,
    cliente,
    tipo_trabajo: tipo,
    area_actual: areaActual,
    etapas,
    eventos,
    comentarios,
  };
}

export async function marcarEntregadaAction(
  ordenId: string,
  entregadaA: string
): Promise<{ ok: boolean; error?: string }> {
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("marcar_entregada", {
        p_orden_id: ordenId,
        p_entregada_a: entregadaA,
      });

      if (!error && data) {
        revalidatePath("/dashboard");
        revalidatePath("/entregas");
        revalidatePath("/ordenes");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.marcarEntregada(ordenId, entregadaA, profile?.id);
    revalidatePath("/dashboard");
    revalidatePath("/entregas");
    revalidatePath("/ordenes");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al entregar orden";
    return { ok: false, error: message };
  }
}

export async function agregarComentarioAction(
  ordenId: string,
  texto: string
): Promise<{ ok: boolean; error?: string }> {
  if (!texto.trim()) return { ok: false, error: "El comentario no puede estar vacío" };
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("comentarios")
        .insert({
          orden_id: ordenId,
          autor_id: profile?.id || null,
          texto: texto.trim(),
        })
        .select()
        .single();

      if (!error && data) {
        revalidatePath(`/ordenes`, "layout");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  mockStore.agregarComentario(ordenId, texto.trim(), profile?.id);
  revalidatePath(`/ordenes`, "layout");
  return { ok: true };
}

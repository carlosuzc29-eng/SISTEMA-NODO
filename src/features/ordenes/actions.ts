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
  ProveedorRow,
  AcabadoRow,
  RechazoCalidadRow,
  UsuarioAreaRow,
  ProfileRow,
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
  acabados_rel?: AcabadoRow[];
  rechazos?: RechazoCalidadRow[];
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
        p_usa_planchas_existentes: data.usa_planchas_existentes ?? false,
        p_acabados_ids: data.acabado_ids || null,
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
    usa_planchas_existentes: data.usa_planchas_existentes,
    acabado_ids: data.acabado_ids,
    notas_acabado: data.notas_acabado,
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
    const etapas = mockStore.etapas
      .filter((e) => e.orden_id === o.id)
      .map((e) => ({
        ...e,
        area: mockStore.areas.find((a) => a.id === e.area_id)!,
      }))
      .sort((a, b) => a.secuencia - b.secuencia);

    return {
      ...o,
      cliente,
      tipo_trabajo: tipo,
      area_actual: area,
      etapas,
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

        // Obtener acabados
        const { data: ordenAcabados } = await supabase
          .from("orden_acabados")
          .select("acabado_id")
          .eq("orden_id", data.id);

        const acIds = (ordenAcabados || []).map((oa) => oa.acabado_id);
        let acabadosRel: AcabadoRow[] = [];
        if (acIds.length > 0) {
          const { data: acData } = await supabase
            .from("acabados")
            .select("*")
            .in("id", acIds);
          acabadosRel = (acData || []) as AcabadoRow[];
        }

        // Obtener rechazos de calidad
        const { data: rechazos } = await supabase
          .from("rechazos_calidad")
          .select("*")
          .eq("orden_id", data.id)
          .order("created_at", { ascending: false });

        return {
          ...(data as unknown as OrdenConRelaciones),
          etapas: etapas as unknown as (OrdenEtapaRow & { area: AreaRow })[],
          eventos: eventos || [],
          comentarios: comentarios || [],
          acabados_rel: acabadosRel,
          rechazos: rechazos || [],
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

  const acabadosRel = mockStore.ordenAcabados
    .filter((oa) => oa.orden_id === orden.id)
    .map((oa) => mockStore.acabados.find((a) => a.id === oa.acabado_id))
    .filter(Boolean) as AcabadoRow[];

  const rechazos = mockStore.rechazosCalidad.filter((r) => r.orden_id === orden.id);

  return {
    ...orden,
    cliente,
    tipo_trabajo: tipo,
    area_actual: areaActual,
    etapas,
    eventos,
    comentarios,
    acabados_rel: acabadosRel,
    rechazos,
  };
}

export async function liberarOrdenAction(ordenId: string): Promise<{ ok: boolean; error?: string }> {
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("liberar_orden", {
        p_orden_id: ordenId,
      });

      if (!error && data) {
        revalidatePath("/dashboard");
        revalidatePath("/ordenes");
        revalidatePath(`/ordenes`, "layout");
        revalidatePath("/area", "layout");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.liberarOrden(ordenId, profile?.id);
    revalidatePath("/dashboard");
    revalidatePath("/ordenes");
    revalidatePath(`/ordenes`, "layout");
    revalidatePath("/area", "layout");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al liberar orden";
    return { ok: false, error: message };
  }
}

export async function despacharOrdenAction(
  ordenId: string,
  despachadaA: string,
  transportista?: string | null,
  guiaDespacho?: string | null
): Promise<{ ok: boolean; error?: string }> {
  if (!despachadaA.trim()) {
    return { ok: false, error: "El nombre de quien retira o recibe es obligatorio" };
  }
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("despachar", {
        p_orden_id: ordenId,
        p_guia_despacho: guiaDespacho || null,
        p_despachada_a: despachadaA.trim(),
        p_transportista: transportista || null,
      });

      if (!error && data) {
        revalidatePath("/dashboard");
        revalidatePath("/despachos");
        revalidatePath("/entregas");
        revalidatePath("/ordenes");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.despachar(ordenId, guiaDespacho, despachadaA, profile?.id);
    revalidatePath("/dashboard");
    revalidatePath("/despachos");
    revalidatePath("/entregas");
    revalidatePath("/ordenes");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al despachar orden";
    return { ok: false, error: message };
  }
}

export async function marcarEntregadaAction(
  ordenId: string,
  entregadaA: string
): Promise<{ ok: boolean; error?: string }> {
  return despacharOrdenAction(ordenId, entregadaA, null, null);
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

export async function obtenerProveedores(): Promise<ProveedorRow[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("proveedores")
        .select("*")
        .order("nombre", { ascending: true });

      if (!error && data) {
        return data as ProveedorRow[];
      }
    } catch {
      // Fallback
    }
  }

  return [...mockStore.proveedores];
}

export async function obtenerAcabados(): Promise<AcabadoRow[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("acabados")
        .select("*")
        .order("nombre", { ascending: true });

      if (!error && data) {
        return data as AcabadoRow[];
      }
    } catch {
      // Fallback
    }
  }

  return [...mockStore.acabados];
}

export async function crearProveedorAction(data: {
  nombre: string;
  telefono?: string | null;
  tipo?: ProveedorRow["tipo"];
}): Promise<{ ok: boolean; error?: string }> {
  if (!data.nombre.trim()) return { ok: false, error: "El nombre es obligatorio" };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("proveedores").insert({
        nombre: data.nombre.trim(),
        telefono: data.telefono || null,
        tipo: data.tipo || "otros",
        activo: true,
      });
      if (!error) {
        revalidatePath("/configuracion");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.crearProveedor(data);
    revalidatePath("/configuracion");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al crear proveedor";
    return { ok: false, error: message };
  }
}

export async function actualizarProveedorAction(
  id: string,
  data: Partial<ProveedorRow>
): Promise<{ ok: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { id: _id, ...updatePayload } = data;
      const { error } = await supabase.from("proveedores").update(updatePayload).eq("id", id);
      if (!error) {
        revalidatePath("/configuracion");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.actualizarProveedor(id, data);
    revalidatePath("/configuracion");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar proveedor";
    return { ok: false, error: message };
  }
}

export async function crearAcabadoAction(data: {
  nombre: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!data.nombre.trim()) return { ok: false, error: "El nombre del acabado es obligatorio" };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("acabados").insert({
        nombre: data.nombre.trim(),
        activo: true,
      });
      if (!error) {
        revalidatePath("/configuracion");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.crearAcabado(data);
    revalidatePath("/configuracion");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al crear acabado";
    return { ok: false, error: message };
  }
}

export async function actualizarAcabadoAction(
  id: string,
  data: Partial<AcabadoRow>
): Promise<{ ok: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { id: _id, ...updatePayload } = data;
      const { error } = await supabase.from("acabados").update(updatePayload).eq("id", id);
      if (!error) {
        revalidatePath("/configuracion");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.actualizarAcabado(id, data);
    revalidatePath("/configuracion");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar acabado";
    return { ok: false, error: message };
  }
}

export async function actualizarAreaFlagsAction(
  areaId: string,
  flags: {
    tipo_espera?: AreaRow["tipo_espera"];
    requiere_aprobacion_cliente?: boolean;
    es_condicional?: boolean;
    es_control_calidad?: boolean;
    es_despacho?: boolean;
  }
): Promise<{ ok: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("areas").update(flags).eq("id", areaId);
      if (!error) {
        revalidatePath("/configuracion");
        revalidatePath("/area", "layout");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.actualizarAreaFlags(areaId, flags);
    revalidatePath("/configuracion");
    revalidatePath("/area", "layout");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar flags del área";
    return { ok: false, error: message };
  }
}

export async function asignarAreasUsuarioAction(
  usuarioId: string,
  areaIds: string[]
): Promise<{ ok: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      // Eliminar actuales
      await supabase.from("usuario_areas").delete().eq("usuario_id", usuarioId);
      // Insertar nuevas
      if (areaIds.length > 0) {
        const now = new Date().toISOString();
        await supabase
          .from("usuario_areas")
          .insert(areaIds.map((areaId) => ({ usuario_id: usuarioId, area_id: areaId, created_at: now })));
      }
      revalidatePath("/configuracion");
      return { ok: true };
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.asignarAreasUsuario(usuarioId, areaIds);
    revalidatePath("/configuracion");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al asignar áreas al usuario";
    return { ok: false, error: message };
  }
}

export async function obtenerUsuariosConAreas(): Promise<
  (ProfileRow & { area?: AreaRow | null; areas_asignadas: AreaRow[] })[]
> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("nombre_completo", { ascending: true });

      const { data: usuarioAreas } = await supabase
        .from("usuario_areas")
        .select("usuario_id, area_id");

      const { data: areasData } = await supabase
        .from("areas")
        .select("*");

      const allAreas = (areasData || []) as AreaRow[];

      if (profiles) {
        return (profiles as ProfileRow[]).map((p) => {
          const userAreaIds = (usuarioAreas || [])
            .filter((ua) => ua.usuario_id === p.id)
            .map((ua) => ua.area_id);

          const userAreas = allAreas.filter((a) => userAreaIds.includes(a.id));
          const mainArea = userAreas[0] || null;

          return {
            ...p,
            area: mainArea,
            areas_asignadas: userAreas,
          };
        });
      }
    } catch {
      // Fallback
    }
  }

  return mockStore.perfiles.map((p) => {
    const userAreas = mockStore.usuarioAreas
      .filter((ua) => ua.usuario_id === p.id)
      .map((ua) => mockStore.areas.find((a) => a.id === ua.area_id))
      .filter(Boolean) as AreaRow[];

    const mainArea = userAreas[0] || null;

    return {
      ...p,
      area: mainArea,
      areas_asignadas: userAreas,
    };
  });
}

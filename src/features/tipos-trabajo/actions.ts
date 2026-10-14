"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { TipoTrabajoRow, AreaRow, MotivoPausaRow } from "@/types/database";
import { mockStore } from "@/lib/mock-store";
import { revalidatePath } from "next/cache";

export async function obtenerAreas(): Promise<AreaRow[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .order("orden", { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback
    }
  }

  return [...mockStore.areas].sort((a, b) => a.orden - b.orden);
}

export async function obtenerTiposTrabajo(): Promise<TipoTrabajoRow[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("tipos_trabajo")
        .select("*")
        .eq("activo", true)
        .order("nombre", { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback
    }
  }

  return [...mockStore.tiposTrabajo].filter((t) => t.activo);
}

export async function obtenerMotivosPausa(): Promise<MotivoPausaRow[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("motivos_pausa")
        .select("*")
        .eq("activo", true);

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback
    }
  }

  return [...mockStore.motivosPausa].filter((m) => m.activo);
}

export async function crearTipoTrabajo(input: {
  nombre: string;
  descripcion?: string | null;
  icono?: string;
  ruta: string[];
}): Promise<{ ok: boolean; tipo?: TipoTrabajoRow; error?: string }> {
  if (!input.nombre.trim()) {
    return { ok: false, error: "El nombre es obligatorio" };
  }
  if (!input.ruta || input.ruta.length === 0) {
    return { ok: false, error: "Debes seleccionar al menos un área para la ruta" };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("tipos_trabajo")
        .insert({
          nombre: input.nombre,
          descripcion: input.descripcion || null,
          icono: input.icono || "Box",
          ruta: input.ruta,
          modelo_empaque_id: null,
          activo: true,
        })
        .select()
        .single();

      if (!error && data) {
        revalidatePath("/configuracion");
        return { ok: true, tipo: data };
      }
    } catch {
      // Local fallback
    }
  }

  const nuevo: TipoTrabajoRow = {
    id: crypto.randomUUID(),
    nombre: input.nombre,
    descripcion: input.descripcion || null,
    icono: input.icono || "Box",
    ruta: input.ruta,
    modelo_empaque_id: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockStore.tiposTrabajo.push(nuevo);
  revalidatePath("/configuracion");
  return { ok: true, tipo: nuevo };
}

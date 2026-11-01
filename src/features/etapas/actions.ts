"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { obtenerUsuarioActual } from "@/features/auth/actions";
import { mockStore } from "@/lib/mock-store";
import { revalidatePath } from "next/cache";

export async function iniciarEtapaAction(etapaId: string): Promise<{ ok: boolean; error?: string }> {
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("iniciar_etapa", {
        p_etapa_id: etapaId,
      });

      if (!error && data) {
        revalidatePath("/dashboard");
        revalidatePath("/area", "layout");
        revalidatePath("/ordenes", "layout");
        return { ok: true };
      }
    } catch {
      // Continuar con store local
    }
  }

  try {
    mockStore.iniciarEtapa(etapaId, profile?.id);
    revalidatePath("/dashboard");
    revalidatePath("/area", "layout");
    revalidatePath("/ordenes", "layout");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al iniciar etapa";
    return { ok: false, error: message };
  }
}

export async function pausarEtapaAction(
  etapaId: string,
  motivoId: string,
  nota?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("pausar_etapa", {
        p_etapa_id: etapaId,
        p_motivo_id: motivoId,
        p_nota: nota || null,
      });

      if (!error && data) {
        revalidatePath("/dashboard");
        revalidatePath("/area", "layout");
        revalidatePath("/ordenes", "layout");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.pausarEtapa(etapaId, motivoId, nota, profile?.id);
    revalidatePath("/dashboard");
    revalidatePath("/area", "layout");
    revalidatePath("/ordenes", "layout");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al pausar etapa";
    return { ok: false, error: message };
  }
}

export async function reanudarEtapaAction(etapaId: string): Promise<{ ok: boolean; error?: string }> {
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("reanudar_etapa", {
        p_etapa_id: etapaId,
      });

      if (!error && data) {
        revalidatePath("/dashboard");
        revalidatePath("/area", "layout");
        revalidatePath("/ordenes", "layout");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.reanudarEtapa(etapaId, profile?.id);
    revalidatePath("/dashboard");
    revalidatePath("/area", "layout");
    revalidatePath("/ordenes", "layout");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al reanudar etapa";
    return { ok: false, error: message };
  }
}

export async function terminarEtapaAction(etapaId: string): Promise<{ ok: boolean; esFinal?: boolean; error?: string }> {
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("terminar_etapa", {
        p_etapa_id: etapaId,
      });

      if (!error && data && typeof data === "object") {
        const res = data as { ok: boolean; es_final: boolean };
        revalidatePath("/dashboard");
        revalidatePath("/area", "layout");
        revalidatePath("/ordenes", "layout");
        revalidatePath("/entregas");
        return { ok: true, esFinal: res.es_final };
      }
    } catch {
      // Fallback
    }
  }

  try {
    const res = mockStore.terminarEtapa(etapaId, profile?.id);
    revalidatePath("/dashboard");
    revalidatePath("/area", "layout");
    revalidatePath("/ordenes", "layout");
    revalidatePath("/despachos");
    revalidatePath("/entregas");
    return { ok: true, esFinal: res.es_final };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al terminar etapa";
    return { ok: false, error: message };
  }
}

export async function enviarAProveedorAction(
  etapaId: string,
  proveedorId: string,
  fechaEstimadaRetorno?: string | null,
  notas?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("enviar_a_proveedor", {
        p_etapa_id: etapaId,
        p_proveedor_id: proveedorId,
        p_fecha_estimada: fechaEstimadaRetorno || null,
        p_notas: notas || null,
      });

      if (!error && data) {
        revalidatePath("/dashboard");
        revalidatePath("/area", "layout");
        revalidatePath("/ordenes", "layout");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.enviarAProveedor(etapaId, proveedorId, profile?.id);
    revalidatePath("/dashboard");
    revalidatePath("/area", "layout");
    revalidatePath("/ordenes", "layout");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al enviar a proveedor";
    return { ok: false, error: message };
  }
}

export async function recibirDeProveedorAction(
  etapaId: string,
  notas?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("recibir_de_proveedor", {
        p_etapa_id: etapaId,
        p_notas: notas || null,
      });

      if (!error && data) {
        revalidatePath("/dashboard");
        revalidatePath("/area", "layout");
        revalidatePath("/ordenes", "layout");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.recibirDeProveedor(etapaId, profile?.id);
    revalidatePath("/dashboard");
    revalidatePath("/area", "layout");
    revalidatePath("/ordenes", "layout");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al recibir de proveedor";
    return { ok: false, error: message };
  }
}

export async function iniciarSecadoAction(
  etapaId: string,
  horas: number = 4,
  notas?: string | null
): Promise<{ ok: boolean; secadoHasta?: string; error?: string }> {
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("iniciar_secado", {
        p_etapa_id: etapaId,
        p_horas: horas,
        p_notas: notas || null,
      });

      if (!error && data && typeof data === "object") {
        const res = data as { ok: boolean; secado_hasta: string };
        revalidatePath("/dashboard");
        revalidatePath("/area", "layout");
        revalidatePath("/ordenes", "layout");
        return { ok: true, secadoHasta: res.secado_hasta };
      }
    } catch {
      // Fallback
    }
  }

  try {
    const res = mockStore.iniciarSecado(etapaId, horas, profile?.id);
    revalidatePath("/dashboard");
    revalidatePath("/area", "layout");
    revalidatePath("/ordenes", "layout");
    return { ok: true, secadoHasta: res.secado_hasta };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al iniciar secado";
    return { ok: false, error: message };
  }
}

export async function omitirEtapaAction(
  etapaId: string,
  motivo: string
): Promise<{ ok: boolean; error?: string }> {
  if (!motivo.trim()) {
    return { ok: false, error: "Debes especificar un motivo para omitir esta estación" };
  }
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("omitir_etapa", {
        p_etapa_id: etapaId,
        p_motivo: motivo.trim(),
      });

      if (!error && data) {
        revalidatePath("/dashboard");
        revalidatePath("/area", "layout");
        revalidatePath("/ordenes", "layout");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.omitirEtapa(etapaId, motivo.trim(), profile?.id);
    revalidatePath("/dashboard");
    revalidatePath("/area", "layout");
    revalidatePath("/ordenes", "layout");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al omitir etapa";
    return { ok: false, error: message };
  }
}

export async function aprobarCalidadAction(
  etapaId: string,
  notas?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("aprobar_calidad", {
        p_etapa_id: etapaId,
        p_notas: notas || null,
      });

      if (!error && data) {
        revalidatePath("/dashboard");
        revalidatePath("/area", "layout");
        revalidatePath("/ordenes", "layout");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.aprobarCalidad(etapaId, profile?.id);
    revalidatePath("/dashboard");
    revalidatePath("/area", "layout");
    revalidatePath("/ordenes", "layout");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al aprobar control de calidad";
    return { ok: false, error: message };
  }
}

export async function rechazarCalidadAction(
  etapaId: string,
  areaDestinoId: string,
  motivo: string,
  cantidadAfectada?: number | null
): Promise<{ ok: boolean; error?: string }> {
  if (!motivo.trim()) {
    return { ok: false, error: "El motivo del rechazo es obligatorio" };
  }
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("rechazar_calidad", {
        p_etapa_id: etapaId,
        p_area_destino_id: areaDestinoId,
        p_motivo: motivo.trim(),
        p_cantidad_afectada: cantidadAfectada || null,
      });

      if (!error && data) {
        revalidatePath("/dashboard");
        revalidatePath("/area", "layout");
        revalidatePath("/ordenes", "layout");
        return { ok: true };
      }
    } catch {
      // Fallback
    }
  }

  try {
    mockStore.rechazarCalidad(
      etapaId,
      areaDestinoId,
      motivo.trim(),
      cantidadAfectada,
      profile?.id
    );
    revalidatePath("/dashboard");
    revalidatePath("/area", "layout");
    revalidatePath("/ordenes", "layout");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al registrar reproceso";
    return { ok: false, error: message };
  }
}

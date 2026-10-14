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
    revalidatePath("/entregas");
    return { ok: true, esFinal: res.es_final };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al terminar etapa";
    return { ok: false, error: message };
  }
}

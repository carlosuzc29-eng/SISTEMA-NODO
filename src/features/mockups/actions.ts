"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { obtenerUsuarioActual } from "@/features/auth/actions";
import { mockStore } from "@/lib/mock-store";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  guardarMockupSchema,
  GuardarMockupInput,
  aprobarArteSchema,
  AprobarArteInput,
  solicitarCambiosSchema,
  SolicitarCambiosInput,
} from "./schemas";
import {
  MockupEmpaqueRow,
  AprobacionClienteRow,
  OrdenRow,
  ClienteRow,
} from "@/types/database";

export async function guardarMockupAction(
  input: GuardarMockupInput
): Promise<{ ok: boolean; mockup?: MockupEmpaqueRow; error?: string }> {
  const result = guardarMockupSchema.safeParse(input);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message };
  }

  const data = result.data;
  const { profile } = await obtenerUsuarioActual();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      // Upsert por orden_id
      const { data: upserted, error } = await supabase
        .from("mockups_empaque")
        .upsert(
          {
            orden_id: data.orden_id,
            modelo_tipo: data.modelo_tipo,
            ancho_cm: data.ancho_cm,
            alto_cm: data.alto_cm,
            profundidad_cm: data.profundidad_cm,
            grosor_mm: data.grosor_mm,
            textura_arte_url: data.textura_arte_url || null,
            textura_acabado_url: data.textura_acabado_url || null,
            acabado_barniz_uv: data.acabado_barniz_uv,
            acabado_hot_stamping: data.acabado_hot_stamping,
            acabado_relieve: data.acabado_relieve,
            angulo_apertura: 0,
            snapshot_url: data.snapshot_url || null,
            creado_por: profile?.id || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "orden_id" }
        )
        .select()
        .single();

      if (!error && upserted) {
        revalidatePath(`/ordenes`, "layout");
        return { ok: true, mockup: upserted };
      }
    } catch {
      // Fallback
    }
  }

  const mockup = mockStore.guardarMockup({
    ...data,
    creado_por: profile?.id || null,
  });

  revalidatePath(`/ordenes`, "layout");
  return { ok: true, mockup };
}

export async function obtenerMockupPorOrdenAction(
  ordenId: string
): Promise<MockupEmpaqueRow | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("mockups_empaque")
        .select("*")
        .eq("orden_id", ordenId)
        .single();

      if (!error && data) {
        return data;
      }
    } catch {
      // Fallback
    }
  }

  return mockStore.obtenerMockupPorOrden(ordenId);
}

export async function generarTokenAprobacionAction(
  ordenId: string,
  mockupId: string
): Promise<{ ok: boolean; token?: string; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("generar_token_aprobacion", {
        p_orden_id: ordenId,
        p_mockup_id: mockupId,
      });

      if (!error && data && typeof data === "object") {
        const resp = data as { ok: boolean; token: string };
        revalidatePath(`/ordenes`, "layout");
        return { ok: true, token: resp.token };
      }
    } catch {
      // Fallback
    }
  }

  const res = mockStore.generarTokenAprobacion(ordenId, mockupId);
  revalidatePath(`/ordenes`, "layout");
  return { ok: true, token: res.token };
}

export async function obtenerDatosAprobacionAction(token: string): Promise<{
  ok: boolean;
  data?: {
    aprobacion: AprobacionClienteRow;
    orden: OrdenRow;
    mockup: MockupEmpaqueRow;
    cliente: ClienteRow;
  };
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: aprobacion, error: apErr } = await supabase
        .from("aprobaciones_cliente")
        .select("*, orden:ordenes(*), mockup:mockups_empaque(*)")
        .eq("token", token)
        .single();

      if (!apErr && aprobacion) {
        const orden = (aprobacion as unknown as { orden: OrdenRow }).orden;
        const mockup = (aprobacion as unknown as { mockup: MockupEmpaqueRow }).mockup;

        const { data: cliente } = await supabase
          .from("clientes")
          .select("*")
          .eq("id", orden.cliente_id)
          .single();

        return {
          ok: true,
          data: {
            aprobacion: aprobacion as unknown as AprobacionClienteRow,
            orden,
            mockup,
            cliente: (cliente as unknown as ClienteRow) || {
              id: orden.cliente_id,
              nombre: "Cliente General",
              empresa: null,
              telefono: null,
              email: null,
              notas: null,
              created_at: "",
              updated_at: "",
            },
          },
        };
      }
    } catch {
      // Fallback
    }
  }

  const localData = mockStore.obtenerAprobacionPorToken(token);
  if (!localData) {
    return { ok: false, error: "El enlace de aprobación no existe o ha caducado" };
  }

  return { ok: true, data: localData };
}

export async function aprobarArteAction(
  input: AprobarArteInput
): Promise<{ ok: boolean; error?: string }> {
  const result = aprobarArteSchema.safeParse(input);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message };
  }

  const data = result.data;
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || headerStore.get("x-real-ip") || null;
  const userAgent = headerStore.get("user-agent") || null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: resRpc, error } = await supabase.rpc("aprobar_arte_cliente", {
        p_token: data.token,
        p_nombre: data.nombre,
        p_cargo_dni: data.cargo_dni || null,
        p_ip: ip,
        p_user_agent: userAgent,
      });

      if (!error && resRpc) {
        revalidatePath(`/aprobar/${data.token}`);
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
    mockStore.aprobarArteCliente(
      data.token,
      data.nombre,
      data.cargo_dni,
      ip,
      userAgent
    );
    revalidatePath(`/aprobar/${data.token}`);
    revalidatePath("/dashboard");
    revalidatePath("/area", "layout");
    revalidatePath("/ordenes", "layout");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al procesar la aprobación";
    return { ok: false, error: msg };
  }
}

export async function solicitarCambiosAction(
  input: SolicitarCambiosInput
): Promise<{ ok: boolean; error?: string }> {
  const result = solicitarCambiosSchema.safeParse(input);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message };
  }

  const data = result.data;
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || headerStore.get("x-real-ip") || null;
  const userAgent = headerStore.get("user-agent") || null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: resRpc, error } = await supabase.rpc("solicitar_cambios_cliente", {
        p_token: data.token,
        p_nombre: data.nombre,
        p_comentarios: data.comentarios,
        p_ip: ip,
        p_user_agent: userAgent,
      });

      if (!error && resRpc) {
        revalidatePath(`/aprobar/${data.token}`);
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
    mockStore.solicitarCambiosCliente(
      data.token,
      data.nombre,
      data.comentarios,
      ip,
      userAgent
    );
    revalidatePath(`/aprobar/${data.token}`);
    revalidatePath("/dashboard");
    revalidatePath("/area", "layout");
    revalidatePath("/ordenes", "layout");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al solicitar cambios";
    return { ok: false, error: msg };
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { clienteSchema, ClienteInput } from "./schemas";
import { ClienteRow } from "@/types/database";
import { mockStore } from "@/lib/mock-store";
import { revalidatePath } from "next/cache";

export async function obtenerClientes(): Promise<ClienteRow[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nombre", { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch {
      // Continuar con store local
    }
  }

  return [...mockStore.clientes].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function crearCliente(input: ClienteInput): Promise<{
  ok: boolean;
  cliente?: ClienteRow;
  error?: string;
}> {
  const result = clienteSchema.safeParse(input);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message };
  }

  const data = result.data;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: inserted, error } = await supabase
        .from("clientes")
        .insert({
          nombre: data.nombre,
          empresa: data.empresa || null,
          telefono: data.telefono || null,
          email: data.email || null,
          notas: data.notas || null,
        })
        .select()
        .single();

      if (!error && inserted) {
        revalidatePath("/clientes");
        revalidatePath("/ordenes/nueva");
        return { ok: true, cliente: inserted };
      }
    } catch {
      // Store local fallback
    }
  }

  const nuevoCliente: ClienteRow = {
    id: crypto.randomUUID(),
    nombre: data.nombre,
    empresa: data.empresa || null,
    telefono: data.telefono || null,
    email: data.email || null,
    notas: data.notas || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockStore.clientes.unshift(nuevoCliente);
  revalidatePath("/clientes");
  revalidatePath("/ordenes/nueva");

  return { ok: true, cliente: nuevoCliente };
}

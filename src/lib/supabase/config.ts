/**
 * Determina si Supabase tiene credenciales reales configuradas en el entorno.
 * Si las variables contienen valores dummy/placeholder o están vacías,
 * el sistema opera en modo local ultrarrápido (0ms latencia) sin intentar
 * conexiones remotas que bloqueen la interfaz por timeout de red.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (url.includes("dummy") || url.includes("placeholder")) return false;
  if (anonKey.includes("dummy") || anonKey.includes("placeholder")) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

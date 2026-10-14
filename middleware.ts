import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ProfileRow, AreaRow } from "@/types/database";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const isPublicRoute =
    pathname === "/login" ||
    pathname.startsWith("/aprobar/") ||
    pathname.startsWith("/brand/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/_next/");

  // Verificar sesión local dev o sesión Supabase
  const devSessionCookie = request.cookies.get("nodo26_session");
  let profile: (ProfileRow & { areas?: AreaRow | null }) | null = null;

  if (devSessionCookie?.value) {
    try {
      profile = JSON.parse(devSessionCookie.value);
    } catch {
      profile = null;
    }
  }

  // Actualizar sesión Supabase si está configurado con credenciales reales
  let supabaseResponse = NextResponse.next({ request });
  let user = null;

  if (isSupabaseConfigured()) {
    try {
      const sessionRes = await updateSession(request);
      supabaseResponse = sessionRes.supabaseResponse;
      user = sessionRes.user;

      if (user && !profile) {
        const { data: profileData } = await sessionRes.supabase
          .from("profiles")
          .select("*, areas(*)")
          .eq("id", user.id)
          .single();
        profile = profileData as unknown as (ProfileRow & { areas?: AreaRow | null }) | null;
      }
    } catch {
      // Si Supabase remoto falla o no responde
    }
  }

  const isAuth = !!profile || !!user;

  // 1. Si no está autenticado y la ruta es protegida
  if (!isAuth && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Si está autenticado
  if (isAuth && profile) {
    const rol = profile.rol;
    const areaSlug = profile.areas?.slug;

    // Si intenta entrar al login estando autenticado, redirigir a su pantalla de inicio
    if (pathname === "/login" || pathname === "/") {
      if (rol === "operador" && areaSlug) {
        return NextResponse.redirect(new URL(`/area/${areaSlug}`, request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Restricciones para ROL OPERADOR:
    if (rol === "operador") {
      const esRutaDeSuArea = pathname === `/area/${areaSlug}`;
      if (!esRutaDeSuArea && !pathname.startsWith("/api/")) {
        return NextResponse.redirect(new URL(`/area/${areaSlug || "mi-area"}`, request.url));
      }
    }

    // Restricciones para CONFIGURACIÓN: solo admin
    if (pathname.startsWith("/configuracion") && rol !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Restricciones para REPORTES: solo admin o supervisor
    if (pathname.startsWith("/reportes") && rol !== "admin" && rol !== "supervisor") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

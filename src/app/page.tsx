import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { profile } = await obtenerUsuarioActual();

  if (!profile) {
    redirect("/login");
  }

  if (profile.rol === "operador") {
    const areaSlug = profile.area?.slug || "mi-area";
    redirect(`/area/${areaSlug}`);
  }

  redirect("/dashboard");
}

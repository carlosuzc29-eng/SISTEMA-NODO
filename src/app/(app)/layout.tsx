import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/actions";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { OperatorHeader } from "@/components/layout/operator-header";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await obtenerUsuarioActual();

  // Si no hay perfil en sesión, enviar al login
  if (!profile) {
    redirect("/login");
  }

  const isOperador = profile.rol === "operador";

  if (isOperador) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <OperatorHeader profile={profile} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar profile={profile} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

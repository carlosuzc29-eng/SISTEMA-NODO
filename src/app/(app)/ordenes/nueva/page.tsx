import { obtenerClientes } from "@/features/clientes/actions";
import { obtenerTiposTrabajo, obtenerAreas } from "@/features/tipos-trabajo/actions";
import { WizardNuevaOt } from "@/components/ordenes/wizard-nueva-ot";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nueva Orden de Trabajo — Control de Producción",
};

export default async function NuevaOrdenPage() {
  const [clientes, tiposTrabajo, areas] = await Promise.all([
    obtenerClientes(),
    obtenerTiposTrabajo(),
    obtenerAreas(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300 pb-12">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
            <Link href="/ordenes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Crear Nueva Orden de Trabajo (OT)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registra el cliente, las especificaciones técnicas y programa la ruta de producción.
            </p>
          </div>
        </div>
      </div>

      {/* Asistente Wizard */}
      <WizardNuevaOt
        clientes={clientes}
        tiposTrabajo={tiposTrabajo}
        areas={areas}
      />
    </div>
  );
}

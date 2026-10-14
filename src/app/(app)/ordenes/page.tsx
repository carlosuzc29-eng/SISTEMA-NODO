import { obtenerOrdenes } from "@/features/ordenes/actions";
import { obtenerAreas } from "@/features/tipos-trabajo/actions";
import { OtTable } from "@/components/ordenes/ot-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FileSpreadsheet } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Órdenes de Trabajo (OT) — Control de Producción",
};

export default async function OrdenesPage() {
  const [ordenes, areas] = await Promise.all([
    obtenerOrdenes(),
    obtenerAreas(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Órdenes de Trabajo (OT)
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Listado general de trabajos en planta, entregas y trazabilidad completa.
          </p>
        </div>

        <Button asChild className="rounded-xl shadow-sm h-10 font-semibold px-4">
          <Link href="/ordenes/nueva">
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Nueva Orden de Trabajo</span>
          </Link>
        </Button>
      </div>

      {/* Tabla con Búsqueda, Filtros y Exportación */}
      <OtTable ordenes={ordenes} areas={areas} />
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/features/auth/actions";
import { obtenerAreas, obtenerMotivosPausa } from "@/features/tipos-trabajo/actions";
import { obtenerOrdenes, OrdenConRelaciones } from "@/features/ordenes/actions";
import { KanbanBoard } from "@/components/areas/kanban-board";
import { Badge } from "@/components/ui/badge";
import { mockStore } from "@/lib/mock-store";
import { OrdenEtapaRow } from "@/types/database";

export const dynamic = "force-dynamic";

interface AreaPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { slug } = await params;
  const [areas, motivosPausa, todasLasOrdenes] = await Promise.all([
    obtenerAreas(),
    obtenerMotivosPausa(),
    obtenerOrdenes(),
  ]);

  const area = areas.find((a) => a.slug === slug);
  if (!area) {
    notFound();
  }

  const { profile } = await obtenerUsuarioActual();

  // Validación de seguridad para Operadores: solo su área asignada
  if (profile?.rol === "operador") {
    const miAreaSlug = profile.area?.slug;
    if (miAreaSlug && miAreaSlug !== slug) {
      redirect(`/area/${miAreaSlug}`);
    }
  }

  // Filtrar etapas de esta área y emparejar con su orden completa
  const etapasDelArea = mockStore.etapas.filter((e) => e.area_id === area.id);
  const ordenesMap = new Map(todasLasOrdenes.map((o) => [o.id, o]));

  const ordenesConEtapas: { orden: OrdenConRelaciones; etapa: OrdenEtapaRow }[] = [];
  etapasDelArea.forEach((etapa) => {
    const orden = ordenesMap.get(etapa.orden_id);
    if (orden) {
      ordenesConEtapas.push({ orden, etapa });
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Encabezado del Tablero si entra como Supervisor o Admin */}
      {profile?.rol !== "operador" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <span
              className="h-5 w-5 rounded-full shadow-sm"
              style={{ backgroundColor: area.color_hex }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Tablero de Producción
                </span>
                <span className="text-xs text-muted-foreground">• Estación 0{area.orden}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Estación de {area.nombre}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="font-semibold text-xs"
              style={{ borderColor: area.color_hex, color: area.color_hex }}
            >
              Vista de Supervisión
            </Badge>
          </div>
        </div>
      )}

      {/* Tablero Kanban conectado con mutaciones RPC */}
      <KanbanBoard
        area={area}
        ordenesConEtapas={ordenesConEtapas}
        motivosPausa={motivosPausa}
      />
    </div>
  );
}

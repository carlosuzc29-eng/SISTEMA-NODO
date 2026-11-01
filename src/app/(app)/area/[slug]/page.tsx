import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { obtenerUsuarioActual } from "@/features/auth/actions";
import { obtenerAreas, obtenerMotivosPausa } from "@/features/tipos-trabajo/actions";
import { obtenerOrdenes, obtenerProveedores, OrdenConRelaciones } from "@/features/ordenes/actions";
import { KanbanBoard } from "@/components/areas/kanban-board";
import { Badge } from "@/components/ui/badge";
import { mockStore } from "@/lib/mock-store";
import { OrdenEtapaRow, AreaRow } from "@/types/database";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

export const dynamic = "force-dynamic";

interface AreaPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { slug } = await params;
  const [areas, motivosPausa, todasLasOrdenes, proveedores] = await Promise.all([
    obtenerAreas(),
    obtenerMotivosPausa(),
    obtenerOrdenes(),
    obtenerProveedores(),
  ]);

  const area = areas.find((a) => a.slug === slug);
  if (!area) {
    notFound();
  }

  const { profile } = await obtenerUsuarioActual();

  // Validación de seguridad para Operadores: verificar si el área está entre sus áreas asignadas
  const misAreas =
    profile?.rol === "operador"
      ? profile.areas_asignadas && profile.areas_asignadas.length > 0
        ? profile.areas_asignadas
        : profile.area
        ? [profile.area]
        : []
      : areas;

  if (profile?.rol === "operador") {
    const tieneAcceso = misAreas.some((a) => a.slug === slug);
    if (!tieneAcceso && misAreas.length > 0) {
      redirect(`/area/${misAreas[0].slug}`);
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

  // Áreas visibles para el selector (si tiene más de 1 área asignada, o si es admin/supervisor)
  const mostrarSelectorAreas = misAreas.length > 1;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Selector de Áreas si el usuario tiene múltiples áreas asignadas o es Supervisor/Admin */}
      {mostrarSelectorAreas && (
        <div className="bg-card/70 backdrop-blur-md rounded-2xl border border-border/80 p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="h-3.5 w-3.5" />
              {profile?.rol === "operador"
                ? "Tus Estaciones Asignadas"
                : "Cambiar Estación de Trabajo"}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {misAreas.length} estaciones disponibles
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {misAreas.map((a) => {
              const isActive = a.slug === slug;
              const activasEnEstaArea = mockStore.etapas.filter(
                (e) => e.area_id === a.id && e.estado !== "bloqueada" && e.estado !== "terminada" && e.estado !== "omitida"
              ).length;

              return (
                <Link
                  key={a.id}
                  href={`/area/${a.slug}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all border",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background/80 hover:bg-muted text-foreground border-border/70 hover:border-border"
                  )}
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full shadow-xs",
                      isActive ? "ring-2 ring-white/50" : ""
                    )}
                    style={{ backgroundColor: a.color_hex }}
                  />
                  <span>{a.nombre}</span>
                  {activasEnEstaArea > 0 && (
                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md tabular-nums",
                        isActive
                          ? "bg-black/20 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {activasEnEstaArea}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Encabezado del Tablero si entra como Supervisor o Admin */}
      {profile?.rol !== "operador" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
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
                <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
                  Fase {area.fase.replace("_", " ")}
                </Badge>
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
        proveedores={proveedores}
        todasLasAreas={areas}
      />
    </div>
  );
}

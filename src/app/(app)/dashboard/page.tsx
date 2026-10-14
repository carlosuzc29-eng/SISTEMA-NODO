import { obtenerDashboardData } from "@/features/dashboard/actions";
import { FlowMap } from "@/components/dashboard/flow-map";
import { OtSemaphore } from "@/components/ordenes/ot-semaphore";
import { TimelineFeed } from "@/components/ordenes/timeline-feed";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  Plus,
  Tv,
  ChevronRight,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — Control de Producción",
};

interface DashboardPageProps {
  searchParams: Promise<{ tv?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { tv } = await searchParams;
  const isTvMode = tv === "1";
  const data = await obtenerDashboardData();

  return (
    <div
      className={cn(
        "space-y-6",
        isTvMode && "p-6 sm:p-10 max-w-[1920px] mx-auto space-y-8"
      )}
    >
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2
              className={cn(
                "font-bold tracking-tight text-foreground",
                isTvMode ? "text-3xl sm:text-4xl" : "text-2xl"
              )}
            >
              Tablero General de Producción
            </h2>
            {isTvMode && (
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 text-primary text-xs font-mono font-semibold"
              >
                MODO TV ACTIVO
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Control de flujo en vivo, cuellos de botella y órdenes en planta.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-lg h-9 text-xs font-mono"
          >
            <Link href={isTvMode ? "/dashboard" : "/dashboard?tv=1"}>
              <Tv className="h-3.5 w-3.5 mr-1.5" />
              <span>{isTvMode ? "Salir de TV" : "Modo TV"}</span>
            </Link>
          </Button>

          {!isTvMode && (
            <Button
              asChild
              size="sm"
              className="rounded-lg h-9 text-xs font-semibold shadow-xs"
            >
              <Link href="/ordenes/nueva">
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Nueva OT</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tarjetas KPI Principales (Stat Cards con entrada escalonada) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Activas */}
        <Card
          variant="stat"
          className={cn(
            "animate-stat-enter",
            isTvMode && "p-6 [@media(hover:hover)]:hover:none"
          )}
          style={{ animationDelay: "0ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
            <span className="label-caps text-muted-foreground">
              OTs Activas
            </span>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div
              className={cn(
                "font-mono font-bold tabular-nums text-foreground tracking-[-0.03em]",
                isTvMode ? "text-5xl sm:text-6xl" : "text-3xl sm:text-4xl"
              )}
            >
              {data.kpis.activas}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground">En tránsito</span>
              <span className="text-[11px] font-mono font-medium text-primary flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                en planta
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Listas para Entrega */}
        <Card
          variant="stat"
          className={cn(
            "animate-stat-enter",
            isTvMode && "p-6 [@media(hover:hover)]:hover:none"
          )}
          style={{ animationDelay: "40ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
            <span className="label-caps text-muted-foreground">
              Listas p/ Entrega
            </span>
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div
              className={cn(
                "font-mono font-bold tabular-nums text-[var(--success)] tracking-[-0.03em]",
                isTvMode ? "text-5xl sm:text-6xl" : "text-3xl sm:text-4xl"
              )}
            >
              {data.kpis.listasEntrega}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground">Por retirar</span>
              <span className="text-[11px] font-mono font-medium text-[var(--success)] flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />
                despacho
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Atrasadas / Crítico */}
        <Card
          variant="stat"
          className={cn(
            "animate-stat-enter",
            data.kpis.atrasadas > 0
              ? "border-destructive/60 bg-destructive-subtle/25 ring-1 ring-destructive/20"
              : "border-border/80",
            isTvMode && "p-6 [@media(hover:hover)]:hover:none"
          )}
          style={{ animationDelay: "80ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
            <span
              className={cn(
                "label-caps",
                data.kpis.atrasadas > 0 ? "text-destructive font-bold" : "text-muted-foreground"
              )}
            >
              Atrasadas / Crítico
            </span>
            <AlertTriangle
              className={cn(
                "h-4 w-4",
                data.kpis.atrasadas > 0 ? "text-destructive" : "text-muted-foreground"
              )}
            />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div
              className={cn(
                "font-mono font-bold tabular-nums tracking-[-0.03em]",
                data.kpis.atrasadas > 0 ? "text-destructive" : "text-foreground",
                isTvMode ? "text-5xl sm:text-6xl" : "text-3xl sm:text-4xl"
              )}
            >
              {data.kpis.atrasadas}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground">Prioridad alta</span>
              <span
                className={cn(
                  "text-[11px] font-mono font-medium",
                  data.kpis.atrasadas > 0 ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {data.kpis.atrasadas > 0 ? "atención req." : "al día"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Entregadas */}
        <Card
          variant="stat"
          className={cn(
            "animate-stat-enter",
            isTvMode && "p-6 [@media(hover:hover)]:hover:none"
          )}
          style={{ animationDelay: "120ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
            <span className="label-caps text-muted-foreground">
              Entregadas (Sem)
            </span>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div
              className={cn(
                "font-mono font-bold tabular-nums text-foreground tracking-[-0.03em]",
                isTvMode ? "text-5xl sm:text-6xl" : "text-3xl sm:text-4xl"
              )}
            >
              {data.kpis.entregadasEstaSemana}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground">Completadas</span>
              <span className="text-[11px] font-mono font-medium text-foreground/80">
                histórico
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Flujo de Producción por Estación */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Mapa de Flujo de Producción por Estación
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Carga operativa en tiempo real y detección automática de cuellos de botella
              </CardDescription>
            </div>
            {!isTvMode && (
              <Button asChild variant="ghost" size="sm" className="text-xs h-8">
                <Link href="/ordenes">Ver todas las órdenes</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <FlowMap areasMetricas={data.flujoAreas} />
        </CardContent>
      </Card>

      {/* Listas para Entrega y Próximas a Vencer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Listos para Entrega */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4 text-[var(--success)]" />
                Listas para Retiro / Despacho
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Órdenes que completaron todas las etapas en planta
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono tabular-nums text-xs">
              {data.listasParaEntrega.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.listasParaEntrega.length > 0 ? (
              data.listasParaEntrega.map((orden) => (
                <div
                  key={orden.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-card hover:bg-muted/40 transition-[background-color] duration-150 ease-[var(--ease-out)]"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-foreground">
                        {orden.codigo}
                      </span>
                      <span className="font-medium text-xs text-foreground truncate max-w-[200px]">
                        {orden.titulo}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {orden.cliente.empresa || orden.cliente.nombre} •{" "}
                      <span className="font-mono tabular-nums">{orden.cantidad.toLocaleString("es-ES")}</span> uds
                    </p>
                  </div>

                  {!isTvMode && (
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs rounded-md px-2.5">
                      <Link href={`/ordenes/${orden.codigo}`}>
                        Ver
                      </Link>
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground italic">
                No hay órdenes esperando entrega en este momento.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas a vencer / Atrasadas */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
                Prioridad de Entrega (Próximas y Atrasadas)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Ordenadas cronológicamente según fecha pactada
              </CardDescription>
            </div>
            {!isTvMode && (
              <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                <Link href="/ordenes">Ver todas</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {data.proximasOVencidas.length > 0 ? (
              data.proximasOVencidas.map((orden) => (
                <div
                  key={orden.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-card hover:bg-muted/40 transition-[background-color] duration-150 ease-[var(--ease-out)]"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-foreground">
                        {orden.codigo}
                      </span>
                      <span className="font-medium text-xs text-foreground truncate max-w-[180px]">
                        {orden.titulo}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {orden.cliente.empresa || orden.cliente.nombre} • {orden.tipo_trabajo.nombre}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <OtSemaphore fechaEntrega={orden.fecha_entrega} />
                    {!isTvMode && (
                      <Button asChild size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-md">
                        <Link href={`/ordenes/${orden.codigo}`}>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground italic">
                Sin órdenes pendientes de entrega.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      {!isTvMode && (
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Actividad Reciente en Planta
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Feed de eventos y transiciones en vivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineFeed eventos={data.actividadReciente} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { obtenerDashboardData } from "@/features/dashboard/actions";
import { FlowMap } from "@/components/dashboard/flow-map";
import { OtSemaphore } from "@/components/ordenes/ot-semaphore";
import { TimelineFeed } from "@/components/ordenes/timeline-feed";
import { TvAutoRefresh } from "@/components/dashboard/tv-auto-refresh";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Clock,
  Truck,
  Plus,
  Tv,
  ChevronRight,
  Layers,
  ArrowUpRight,
  TrendingUp,
  DoorOpen,
  CalendarCheck,
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
        isTvMode && "fixed inset-0 z-50 bg-background overflow-y-auto p-6 sm:p-10 space-y-8"
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
                MODO TV ACTIVO • PANTALLA PLANTA
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Flujo en vivo de las 11 estaciones de la imprenta, alertas y despachos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isTvMode && <TvAutoRefresh intervalSeconds={30} />}

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl h-9 text-xs font-mono"
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
              className="rounded-xl h-9 text-xs font-semibold shadow-xs"
            >
              <Link href="/ordenes/nueva">
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Nueva OT</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* 5 Métricas Principales (Stat Cards) con Tintas de Proceso */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Activas en Planta — Magenta de Prensa */}
        <Card
          variant="stat"
          className={cn(
            "rounded-2xl border-border/80 shadow-xs relative overflow-hidden",
            isTvMode && "p-4 crop-marks"
          )}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--ink-magenta)]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Activas en Planta
            </span>
            <Activity className="h-4 w-4 text-[var(--ink-magenta)]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div
              className={cn(
                "font-display font-mono font-bold tabular-nums text-foreground tracking-tight",
                isTvMode ? "text-5xl" : "text-3xl"
              )}
            >
              {data.kpis.activas}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground">En producción</span>
              <span className="text-[11px] font-mono font-medium text-[var(--ink-magenta)] flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                en máquinas
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: En Puerta (Pendientes) — Crema Cálido / Ámbar */}
        <Card
          variant="stat"
          className={cn(
            "rounded-2xl border-border/80 shadow-xs relative overflow-hidden",
            data.kpis.enPuerta > 0 ? "border-[var(--ink-yellow)]/40 bg-[var(--ink-yellow-subtle)]/40" : "",
            isTvMode && "p-4 crop-marks"
          )}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--ink-yellow)]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              En Puerta
            </span>
            <DoorOpen className="h-4 w-4 text-[var(--ink-yellow-foreground)]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div
              className={cn(
                "font-display font-mono font-bold tabular-nums text-foreground tracking-tight",
                isTvMode ? "text-5xl" : "text-3xl"
              )}
            >
              {data.kpis.enPuerta}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground">Por liberar</span>
              <span className="text-[11px] font-mono font-medium text-[var(--ink-yellow-foreground)]">
                recepción
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Listas para Despacho — Verde de Registro */}
        <Card
          variant="stat"
          className={cn(
            "rounded-2xl border-border/80 shadow-xs relative overflow-hidden",
            isTvMode && "p-4 crop-marks"
          )}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-registry-green)]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Listas Despacho
            </span>
            <Truck className="h-4 w-4 text-[var(--color-registry-green)]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div
              className={cn(
                "font-display font-mono font-bold tabular-nums text-[var(--color-registry-green-foreground)] dark:text-[var(--color-registry-green)] tracking-tight",
                isTvMode ? "text-5xl" : "text-3xl"
              )}
            >
              {data.kpis.listasDespacho}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground">Embaladas</span>
              <span className="text-[11px] font-mono font-medium text-[var(--color-registry-green-foreground)] dark:text-[var(--color-registry-green)] flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />
                por entregar
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Atrasadas — Rojo Tinta */}
        <Card
          variant="stat"
          className={cn(
            "rounded-2xl shadow-xs relative overflow-hidden",
            data.kpis.atrasadas > 0
              ? "border-destructive/60 bg-destructive/10 ring-1 ring-destructive/20"
              : "border-border/80",
            isTvMode && "p-4 crop-marks"
          )}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-destructive" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
            <span
              className={cn(
                "text-[11px] font-mono font-semibold uppercase tracking-wider",
                data.kpis.atrasadas > 0 ? "text-destructive font-bold" : "text-muted-foreground"
              )}
            >
              Atrasadas
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
                "font-display font-mono font-bold tabular-nums tracking-tight",
                data.kpis.atrasadas > 0 ? "text-destructive" : "text-foreground",
                isTvMode ? "text-5xl" : "text-3xl"
              )}
            >
              {data.kpis.atrasadas}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground">Vencidas</span>
              <span
                className={cn(
                  "text-[11px] font-mono font-medium",
                  data.kpis.atrasadas > 0 ? "text-destructive font-bold" : "text-muted-foreground"
                )}
              >
                {data.kpis.atrasadas > 0 ? "atención" : "al día"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 5: Entregadas en la semana — Cian de Proceso */}
        <Card
          variant="stat"
          className={cn(
            "rounded-2xl border-border/80 shadow-xs relative overflow-hidden",
            isTvMode && "p-4 crop-marks"
          )}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--ink-cyan)]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Entregadas Semana
            </span>
            <CalendarCheck className="h-4 w-4 text-[var(--ink-cyan-foreground)] dark:text-[var(--ink-cyan)]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div
              className={cn(
                "font-display font-mono font-bold tabular-nums text-foreground tracking-tight",
                isTvMode ? "text-5xl" : "text-3xl"
              )}
            >
              {data.kpis.entregadasEstaSemana}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground">Despachadas</span>
              <span className="text-[11px] font-mono font-medium text-[var(--ink-cyan-foreground)] dark:text-[var(--ink-cyan)]">
                últimos 7d
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flujo de Producción de las 11 Áreas Agrupadas en 3 Fases */}
      <Card className="rounded-2xl border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle
                className={cn(
                  "font-bold flex items-center gap-2",
                  isTvMode ? "text-xl" : "text-base"
                )}
              >
                <Layers className="h-4 w-4 text-primary" />
                Flujo Operativo por Fases (11 Estaciones)
              </CardTitle>
              <CardDescription className="text-xs">
                Carga de trabajo en tiempo real a lo largo de Pre-prensa, Prensa y Post-prensa
              </CardDescription>
            </div>
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
              Actualización continua
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <FlowMap areasMetricas={data.flujoAreas} isTvMode={isTvMode} />
        </CardContent>
      </Card>

      {/* Secciones inferiores del dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trabajos Próximos a Vencer o Atrasados */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Prioridades y Vencimientos
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-mono">
                <Link href="/ordenes">Ver todas ({data.proximasOVencidas.length})</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.proximasOVencidas.length > 0 ? (
              data.proximasOVencidas.map((orden) => (
                <Link
                  key={orden.id}
                  href={`/ordenes/${orden.codigo}`}
                  className="p-3 rounded-xl border border-border/70 hover:border-primary/50 bg-card/60 transition-[background-color,border-color] duration-120 ease-[var(--ease-out)] flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-mono font-bold text-xs group-hover:text-primary transition-colors">
                      {orden.codigo}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-medium text-foreground truncate">
                        {orden.titulo}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {orden.cliente.empresa || orden.cliente.nombre}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <OtSemaphore fechaEntrega={orden.fecha_entrega} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic py-6 text-center">
                No hay órdenes pendientes en este momento.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actividad Reciente en Planta */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Eventos Recientes en Planta
            </CardTitle>
            <CardDescription className="text-xs">
              Historial de cambios de estado, pausas, secados y avances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineFeed eventos={data.actividadReciente} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

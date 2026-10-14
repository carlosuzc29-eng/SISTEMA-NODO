import { obtenerDashboardData } from "@/features/dashboard/actions";
import { FlowMap } from "@/components/dashboard/flow-map";
import { OtSemaphore } from "@/components/ordenes/ot-semaphore";
import { DeliveryModal } from "@/components/dashboard/delivery-modal";
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
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowRight,
} from "lucide-react";

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
    <div className={`space-y-8 animate-in fade-in-50 duration-300 ${isTvMode ? "p-4 sm:p-8" : ""}`}>
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Tablero General de Producción
            </h2>
            {isTvMode && (
              <Badge variant="destructive" className="animate-pulse text-xs">
                Modo TV Activo
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Control de flujo en vivo, cuellos de botella y órdenes en planta.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="rounded-xl h-9 text-xs">
            <Link href={isTvMode ? "/dashboard" : "/dashboard?tv=1"}>
              <Tv className="h-4 w-4 mr-1.5" />
              <span>{isTvMode ? "Salir de Modo TV" : "Modo TV"}</span>
            </Link>
          </Button>

          <Button asChild size="sm" className="rounded-xl h-9 text-xs font-semibold shadow-sm">
            <Link href="/ordenes/nueva">
              <Plus className="h-4 w-4 mr-1" />
              <span>Nueva OT</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 shadow-sm hover:shadow transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              OTs Activas en Planta
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold tabular-nums text-foreground">
              {data.kpis.activas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En tránsito por las áreas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm hover:shadow transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Listas para Entrega
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {data.kpis.listasEntrega}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Esperando retiro por el cliente
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm hover:shadow transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Atrasadas / Por Vencer
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl sm:text-4xl font-bold tabular-nums ${
                data.kpis.atrasadas > 0 ? "text-destructive" : "text-foreground"
              }`}
            >
              {data.kpis.atrasadas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requieren atención prioritaria
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm hover:shadow transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Entregadas en el Sistema
            </CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold tabular-nums text-foreground">
              {data.kpis.entregadasEstaSemana}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completadas satisfactoriamente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Flujo de Producción */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Mapa de Flujo de Producción por Estación
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Carga operativa en tiempo real y detección automática de cuellos de botella
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/ordenes">Ver todas las órdenes</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FlowMap areasMetricas={data.flujoAreas} />
        </CardContent>
      </Card>

      {/* Listas para Entrega y Próximas a Vencer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listos para Entrega */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-500" />
                Listas para Retiro / Entrega
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Órdenes que completaron todas sus etapas de producción
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-bold tabular-nums text-xs">
              {data.listasParaEntrega.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.listasParaEntrega.length > 0 ? (
              data.listasParaEntrega.map((orden) => (
                <div
                  key={orden.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card hover:bg-accent/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {orden.codigo}
                      </span>
                      <span className="font-semibold text-xs text-foreground truncate max-w-[200px]">
                        {orden.titulo}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cliente: {orden.cliente.empresa || orden.cliente.nombre} •{" "}
                      {orden.cantidad.toLocaleString("es-ES")} uds
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline" className="h-8 text-xs rounded-lg">
                      <Link href={`/ordenes/${orden.codigo}`}>
                        Ver
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground italic">
                No hay órdenes esperando entrega en este momento.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas a vencer / Atrasadas */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Prioridad de Entrega (Próximas y Atrasadas)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Ordenadas cronológicamente según fecha pactada
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/ordenes">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.proximasOVencidas.length > 0 ? (
              data.proximasOVencidas.map((orden) => (
                <div
                  key={orden.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card hover:bg-accent/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {orden.codigo}
                      </span>
                      <span className="font-semibold text-xs text-foreground truncate max-w-[180px]">
                        {orden.titulo}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {orden.cliente.empresa || orden.cliente.nombre} • {orden.tipo_trabajo.nombre}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <OtSemaphore fechaEntrega={orden.fecha_entrega} />
                    <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                      <Link href={`/ordenes/${orden.codigo}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground italic">
                Sin órdenes pendientes de entrega.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
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
    </div>
  );
}

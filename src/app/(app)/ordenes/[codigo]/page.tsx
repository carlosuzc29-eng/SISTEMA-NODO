import { notFound } from "next/navigation";
import { obtenerOrdenPorCodigo } from "@/features/ordenes/actions";
import { OtStepper } from "@/components/ordenes/ot-stepper";
import { OtSemaphore } from "@/components/ordenes/ot-semaphore";
import { TimelineFeed } from "@/components/ordenes/timeline-feed";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Box,
  Truck,
  FileText,
  Clock,
  MessageSquare,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface OrdenDetallePageProps {
  params: Promise<{ codigo: string }>;
}

export default async function OrdenDetallePage({ params }: OrdenDetallePageProps) {
  const { codigo } = await params;
  const orden = await obtenerOrdenPorCodigo(codigo);

  if (!orden) {
    notFound();
  }

  const estadoBadge: Record<string, { label: string; className: string }> = {
    recibida: { label: "Recibida", className: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
    en_produccion: { label: "En Producción", className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20" },
    lista_entrega: { label: "Lista para Entrega", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" },
    entregada: { label: "Entregada", className: "bg-gray-500/15 text-gray-700 dark:text-gray-400" },
    cancelada: { label: "Cancelada", className: "bg-red-500/15 text-red-700 dark:text-red-400" },
  };

  const infoEstado = estadoBadge[orden.estado] || estadoBadge.recibida;

  return (
    <div className="space-y-6 pb-16">
      {/* Botón Volver y Encabezado de la Orden */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
            <Link href="/ordenes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-2xl text-foreground tracking-tight">
                {orden.codigo}
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-medium ${infoEstado.className}`}
              >
                {infoEstado.label}
              </span>
              <OtSemaphore fechaEntrega={orden.fecha_entrega} />
            </div>
            <h1 className="text-lg font-semibold text-foreground mt-0.5">
              {orden.titulo}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {orden.estado === "lista_entrega" && (
            <Button asChild size="sm" className="rounded-lg bg-[var(--success)] hover:opacity-90 text-[var(--success-foreground)] font-medium text-xs shadow-xs">
              <Link href="/entregas">
                <Truck className="h-3.5 w-3.5 mr-1.5" />
                <span>Marcar como Entregada</span>
              </Link>
            </Button>
          )}

          {/* Enlace al Estudio de Mockup 3D */}
          <Button asChild variant="outline" size="sm" className="rounded-lg text-xs font-mono font-medium gap-1.5 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20">
            <Link href={`/ordenes/${orden.codigo}/mockup`}>
              <Box className="h-3.5 w-3.5" />
              <span>Mockup 3D y Aprobación</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stepper Horizontal de Avance */}
      {orden.etapas && orden.etapas.length > 0 && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Ruta y Estado de Producción
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <OtStepper etapas={orden.etapas} />
          </CardContent>
        </Card>
      )}

      {/* Ficha Técnica del Producto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Ficha Técnica de Fabricación
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Parámetros técnicos indicados al momento de registrar la orden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-border/60">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold block">
                  Cliente / Empresa
                </span>
                <span className="font-bold text-foreground text-base">
                  {orden.cliente.empresa || orden.cliente.nombre}
                </span>
                {orden.cliente.empresa && (
                  <span className="text-xs text-muted-foreground block">
                    Contacto: {orden.cliente.nombre}
                  </span>
                )}
                {orden.cliente.telefono && (
                  <span className="text-xs text-muted-foreground font-mono block">
                    {orden.cliente.telefono}
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold block">
                  Tiraje / Cantidad
                </span>
                <span className="font-bold text-foreground text-2xl tabular-nums text-primary">
                  {orden.cantidad.toLocaleString("es-ES")} uds
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  Tipo: {orden.tipo_trabajo.nombre}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block mb-0.5">Material:</span>
                <span className="font-semibold text-foreground">{orden.material || "Estándar"}</span>
              </div>
              <div className="p-3 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block mb-0.5">Medidas:</span>
                <span className="font-semibold text-foreground">{orden.medidas || "Estándar"}</span>
              </div>
              <div className="p-3 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block mb-0.5">Tintas:</span>
                <span className="font-semibold text-foreground">{orden.tintas || "CMYK"}</span>
              </div>
              <div className="p-3 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block mb-0.5">Acabados:</span>
                <span className="font-semibold text-foreground">{orden.acabados || "Estándar"}</span>
              </div>
            </div>

            {orden.descripcion && (
              <div className="p-3.5 rounded-xl border border-border/60 bg-card text-xs space-y-1">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">
                  Descripción / Instrucciones Especiales:
                </span>
                <p className="text-foreground leading-relaxed">{orden.descripcion}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen de Entrega e Info de Creación */}
        <div className="space-y-6">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-500" />
                Compromiso de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Fecha límite:</span>
                <span className="font-bold text-foreground text-sm font-mono">
                  {orden.fecha_entrega}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Semáforo:</span>
                <OtSemaphore fechaEntrega={orden.fecha_entrega} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Prioridad:</span>
                <Badge variant="outline" className="uppercase font-bold text-[10px]">
                  {orden.prioridad}
                </Badge>
              </div>
              {orden.entregada_a && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 mt-2">
                  <span className="font-bold block">Entregada con éxito</span>
                  <span>Retirado por: {orden.entregada_a}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Línea de Tiempo de Eventos y Comentarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Línea de Tiempo de Producción
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Registro histórico inmutable de eventos de la orden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineFeed eventos={orden.eventos || []} />
          </CardContent>
        </Card>

        {/* Comentarios */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Comentarios y Notas de Área
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Comunicación interna entre supervisores y operadores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orden.comentarios && orden.comentarios.length > 0 ? (
              <div className="space-y-3">
                {orden.comentarios.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs space-y-1">
                    <p className="text-foreground leading-relaxed">{c.texto}</p>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      {new Date(c.created_at).toLocaleString("es-ES")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-4 text-center">
                Sin notas ni comentarios registrados.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

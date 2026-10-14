"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrdenConRelaciones } from "@/features/ordenes/actions";
import { OrdenEtapaRow } from "@/types/database";
import { Play, Pause, Check, RotateCw, Box } from "lucide-react";
import { differenceInCalendarDays, parseISO, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface OtCardProps {
  orden: OrdenConRelaciones;
  etapaActual?: OrdenEtapaRow | null;
  onIniciar?: (etapaId: string) => void;
  onPausar?: (etapaId: string) => void;
  onReanudar?: (etapaId: string) => void;
  onTerminar?: (etapaId: string) => void;
  onSelect?: (orden: OrdenConRelaciones) => void;
  isActionPending?: boolean;
}

export function OtCard({
  orden,
  etapaActual,
  onIniciar,
  onPausar,
  onReanudar,
  onTerminar,
  onSelect,
  isActionPending = false,
}: OtCardProps) {
  const isUrgente = orden.prioridad === "urgente";

  // Cálculo de urgencia para barra lateral de semáforo
  const hoy = new Date();
  const fecha = typeof orden.fecha_entrega === "string" ? parseISO(orden.fecha_entrega) : orden.fecha_entrega;
  const diasDiferencia = differenceInCalendarDays(fecha, hoy);

  let urgencyBarColor = "bg-[var(--success)]";
  let urgencyText = `${diasDiferencia}d`;
  let urgencyTextClass = "text-[var(--success)]";

  if (diasDiferencia < 0) {
    urgencyBarColor = "bg-destructive";
    urgencyText = `${Math.abs(diasDiferencia)}d atraso`;
    urgencyTextClass = "text-destructive font-semibold";
  } else if (isToday(fecha)) {
    urgencyBarColor = "bg-destructive";
    urgencyText = "Vence hoy";
    urgencyTextClass = "text-destructive font-semibold";
  } else if (diasDiferencia <= 2) {
    urgencyBarColor = "bg-[var(--warning)]";
    urgencyText = `${diasDiferencia}d restantes`;
    urgencyTextClass = "text-[var(--warning)]";
  }

  const iniciales = (orden.cliente.empresa || orden.cliente.nombre)
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      onClick={() => onSelect && onSelect(orden)}
      className={cn(
        "rounded-xl border bg-card text-card-foreground p-3.5 shadow-xs relative overflow-hidden cursor-pointer",
        "transition-[box-shadow,border-color,transform] duration-150 ease-[var(--ease-out)]",
        "active:scale-[0.99] hover:border-border hover:shadow-sm pl-4",
        isUrgente
          ? "border-destructive/40 ring-1 ring-destructive/20"
          : "border-border/80"
      )}
    >
      {/* Semáforo como barra lateral de color (sustituye al círculo) */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", urgencyBarColor)} />

      {/* Cabecera de la Tarjeta */}
      <div className="flex items-center justify-between gap-2 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-xs tracking-tight text-foreground">
            {orden.codigo}
          </span>
          {isUrgente && (
            <Badge
              variant="destructive"
              className="text-[9px] font-mono uppercase tracking-wider py-0 px-1.5"
            >
              Urgente
            </Badge>
          )}
        </div>

        <span className={cn("text-[10px] font-mono tabular-nums", urgencyTextClass)}>
          {urgencyText}
        </span>
      </div>

      {/* Información del Trabajo */}
      <div className="space-y-0.5 py-0.5">
        <h4 className="font-medium text-xs text-foreground line-clamp-1 leading-snug">
          {orden.titulo}
        </h4>
        <div className="flex items-center gap-1.5 pt-0.5">
          {/* Avatar del cliente / responsable */}
          <div className="h-4 w-4 rounded-full bg-muted border border-border/80 flex items-center justify-center text-[9px] font-mono font-bold text-muted-foreground shrink-0">
            {iniciales}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {orden.cliente.empresa || orden.cliente.nombre}
          </p>
        </div>
      </div>

      {/* Especificaciones Rápidas */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 mt-1.5 border-t border-border/50">
        <div className="flex items-center gap-1 truncate max-w-[130px]">
          <Box className="h-3 w-3 shrink-0" />
          <span className="truncate">{orden.tipo_trabajo.nombre}</span>
        </div>
        <div className="font-mono font-medium tabular-nums text-foreground bg-muted/60 px-1.5 py-0.5 rounded text-[10px]">
          {orden.cantidad.toLocaleString("es-ES")} uds
        </div>
      </div>

      {/* Botones de Acción Operativa (si está en tablero de área) */}
      {etapaActual && (
        <div
          className="pt-2.5 mt-2 border-t border-border/50 flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {etapaActual.estado === "en_cola" && onIniciar && (
            <Button
              type="button"
              size="sm"
              disabled={isActionPending}
              onClick={() => onIniciar(etapaActual.id)}
              className="w-full h-9 font-medium text-xs rounded-lg shadow-xs"
            >
              <Play className="h-3 w-3 mr-1 fill-current" />
              <span>Iniciar Estación</span>
            </Button>
          )}

          {etapaActual.estado === "en_proceso" && (
            <>
              {onPausar && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isActionPending}
                  onClick={() => onPausar(etapaActual.id)}
                  className="flex-1 h-9 font-medium text-xs rounded-lg border-[var(--warning)]/40 text-[var(--warning)] hover:bg-[var(--warning-subtle)]"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  <span>Pausar</span>
                </Button>
              )}
              {onTerminar && (
                <Button
                  type="button"
                  size="sm"
                  disabled={isActionPending}
                  onClick={() => onTerminar(etapaActual.id)}
                  className="flex-1 h-9 font-medium text-xs rounded-lg bg-[var(--success)] text-[var(--success-foreground)] hover:opacity-90 shadow-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  <span>Terminar</span>
                </Button>
              )}
            </>
          )}

          {etapaActual.estado === "pausada" && onReanudar && (
            <Button
              type="button"
              size="sm"
              disabled={isActionPending}
              onClick={() => onReanudar(etapaActual.id)}
              className="w-full h-9 font-medium text-xs rounded-lg bg-[var(--warning)] text-[var(--warning-foreground)] hover:opacity-90 shadow-xs"
            >
              <RotateCw className="h-3 w-3 mr-1" />
              <span>Reanudar</span>
            </Button>
          )}

          {etapaActual.estado === "terminada" && (
            <div className="w-full flex items-center justify-between text-xs text-[var(--success)] font-medium py-0.5">
              <span className="flex items-center gap-1 text-[11px]">
                <Check className="h-3 w-3" />
                Etapa completada
              </span>
              <span className="tabular-nums font-mono text-[10px]">
                {etapaActual.minutos_trabajados} min
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

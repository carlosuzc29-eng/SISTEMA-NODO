"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OtSemaphore } from "./ot-semaphore";
import { OrdenConRelaciones } from "@/features/ordenes/actions";
import { OrdenEtapaRow } from "@/types/database";
import { Play, Pause, Check, RotateCw, AlertTriangle, Box, ChevronRight } from "lucide-react";

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
  const isAlta = orden.prioridad === "alta";

  const prioridadColor: Record<string, string> = {
    urgente: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
    alta: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    normal: "bg-muted text-muted-foreground border-border/80",
    baja: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-border/60",
  };

  const prioridadEtiqueta: Record<string, string> = {
    urgente: "Urgente",
    alta: "Alta",
    normal: "Normal",
    baja: "Baja",
  };

  return (
    <div
      onClick={() => onSelect && onSelect(orden)}
      className={`rounded-2xl border bg-card text-card-foreground p-4 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/50 relative overflow-hidden group ${
        isUrgente
          ? "border-red-500/40 ring-1 ring-red-500/20"
          : "border-border/80"
      }`}
    >
      {/* Barra superior de acento si es urgente o tiene color de área */}
      {isUrgente && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
      )}

      {/* Cabecera de la Tarjeta */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
            {orden.codigo}
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] font-bold uppercase tracking-wider py-0 px-2 ${prioridadColor[orden.prioridad]}`}
          >
            {isUrgente && <AlertTriangle className="h-2.5 w-2.5 mr-1 inline" />}
            {prioridadEtiqueta[orden.prioridad]}
          </Badge>
        </div>

        <OtSemaphore fechaEntrega={orden.fecha_entrega} />
      </div>

      {/* Información del Trabajo y Cliente */}
      <div className="space-y-1 py-1">
        <h4 className="font-semibold text-sm text-foreground line-clamp-1 leading-snug">
          {orden.titulo}
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {orden.cliente.empresa
            ? `${orden.cliente.empresa} (${orden.cliente.nombre})`
            : orden.cliente.nombre}
        </p>
      </div>

      {/* Especificaciones Rápidas */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 mt-1 border-t border-border/60">
        <div className="flex items-center gap-1.5">
          <Box className="h-3.5 w-3.5" />
          <span className="font-medium truncate max-w-[140px]">
            {orden.tipo_trabajo.nombre}
          </span>
        </div>
        <div className="font-bold tabular-nums text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
          {orden.cantidad.toLocaleString("es-ES")} uds
        </div>
      </div>

      {/* Botones de Acción Operativa (si está en un tablero de área) */}
      {etapaActual && (
        <div
          className="pt-3 mt-2 border-t border-border/60 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {etapaActual.estado === "en_cola" && onIniciar && (
            <Button
              type="button"
              size="sm"
              disabled={isActionPending}
              onClick={() => onIniciar(etapaActual.id)}
              className="w-full h-10 font-semibold rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Play className="h-4 w-4 mr-1.5 fill-current" />
              <span>Iniciar Trabajo</span>
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
                  className="flex-1 h-10 font-medium rounded-xl border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                >
                  <Pause className="h-4 w-4 mr-1" />
                  <span>Pausar</span>
                </Button>
              )}
              {onTerminar && (
                <Button
                  type="button"
                  size="sm"
                  disabled={isActionPending}
                  onClick={() => onTerminar(etapaActual.id)}
                  className="flex-1 h-10 font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  <Check className="h-4 w-4 mr-1" />
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
              className="w-full h-10 font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
            >
              <RotateCw className="h-4 w-4 mr-1.5" />
              <span>Reanudar Trabajo</span>
            </Button>
          )}

          {etapaActual.estado === "terminada" && (
            <div className="w-full flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium py-1">
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                Etapa completada
              </span>
              <span className="tabular-nums font-mono text-[11px]">
                {etapaActual.minutos_trabajados} min
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrdenConRelaciones } from "@/features/ordenes/actions";
import { OrdenEtapaRow, AreaRow, ProveedorRow } from "@/types/database";
import {
  Play,
  Pause,
  Check,
  RotateCw,
  Box,
  AlertTriangle,
  Wind,
  Truck,
  Clock,
  FastForward,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  differenceInCalendarDays,
  differenceInSeconds,
  formatDistanceToNow,
  parseISO,
  isToday,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface OtCardProps {
  orden: OrdenConRelaciones;
  etapaActual?: OrdenEtapaRow | null;
  areaConfig?: AreaRow | null;
  proveedores?: ProveedorRow[];
  onIniciar?: (etapaId: string) => void;
  onPausar?: (etapaId: string) => void;
  onReanudar?: (etapaId: string) => void;
  onTerminar?: (etapaId: string) => void;
  onIniciarSecado?: (etapaId: string) => void;
  onEnviarProveedor?: (etapaId: string) => void;
  onRecibirProveedor?: (etapaId: string) => void;
  onAprobarCalidad?: (etapaId: string) => void;
  onRechazarCalidad?: (etapaId: string) => void;
  onOmitir?: (etapaId: string) => void;
  onSelect?: (orden: OrdenConRelaciones) => void;
  isActionPending?: boolean;
}

export function OtCard({
  orden,
  etapaActual,
  areaConfig,
  proveedores = [],
  onIniciar,
  onPausar,
  onReanudar,
  onTerminar,
  onIniciarSecado,
  onEnviarProveedor,
  onRecibirProveedor,
  onAprobarCalidad,
  onRechazarCalidad,
  onOmitir,
  onSelect,
  isActionPending = false,
}: OtCardProps) {
  const isUrgente = orden.prioridad === "urgente";
  const esReproceso = etapaActual && (etapaActual.intento || 1) > 1;

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

  // Tiempo transcurrido en el estado actual
  const tiempoEnEstado = etapaActual?.updated_at
    ? formatDistanceToNow(new Date(etapaActual.updated_at), { locale: es, addSuffix: false })
    : null;

  // Countdown para secado
  const [segundosRestantesSecado, setSegundosRestantesSecado] = useState<number | null>(() => {
    if (etapaActual?.estado === "secando" && etapaActual.secado_hasta) {
      return Math.max(0, differenceInSeconds(new Date(etapaActual.secado_hasta), new Date()));
    }
    return null;
  });

  useEffect(() => {
    if (etapaActual?.estado !== "secando" || !etapaActual.secado_hasta) {
      setSegundosRestantesSecado(null);
      return;
    }

    const timer = setInterval(() => {
      const diff = differenceInSeconds(new Date(etapaActual.secado_hasta!), new Date());
      setSegundosRestantesSecado(Math.max(0, diff));
    }, 1000);

    return () => clearInterval(timer);
  }, [etapaActual?.estado, etapaActual?.secado_hasta]);

  const secadoTerminado = segundosRestantesSecado !== null && segundosRestantesSecado <= 0;

  const formatSecadoCountdown = (secs: number) => {
    const horas = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (horas > 0) {
      return `${horas}h ${mins}m ${s}s`;
    }
    return `${mins}m ${s}s`;
  };

  const proveedorAsignado = etapaActual?.proveedor_id
    ? proveedores.find((p) => p.id === etapaActual.proveedor_id)
    : null;

  const iniciales = (orden.cliente.empresa || orden.cliente.nombre)
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      data-testid="ot-card"
      data-codigo={orden.codigo}
      onClick={() => onSelect && onSelect(orden)}
      className={cn(
        "rounded-xl border bg-card text-card-foreground p-3.5 shadow-xs relative overflow-hidden cursor-pointer",
        "transition-[box-shadow,border-color,transform] duration-150 ease-[var(--ease-out)]",
        "active:scale-[0.99] hover:border-border hover:shadow-sm pl-4",
        isUrgente
          ? "border-destructive/40 ring-1 ring-destructive/20"
          : esReproceso
          ? "border-amber-500/50 ring-1 ring-amber-500/20"
          : "border-border/80"
      )}
    >
      {/* Semáforo como barra lateral de color */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", urgencyBarColor)} />

      {/* Cabecera de la Tarjeta */}
      <div className="flex items-center justify-between gap-2 pb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
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

          {/* Bandera discreta de reproceso */}
          {esReproceso && (
            <Badge
              variant="outline"
              className="text-[9px] bg-destructive/10 text-destructive border-destructive/30 font-semibold py-0 px-1.5 gap-1"
            >
              <AlertTriangle className="h-2.5 w-2.5" />
              Reproceso (intento {etapaActual?.intento})
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {tiempoEnEstado && (
            <span className="text-[10px] text-muted-foreground/80 font-mono" title="Tiempo en este estado">
              {tiempoEnEstado}
            </span>
          )}
          <span className={cn("text-[10px] font-mono tabular-nums", urgencyTextClass)}>
            {urgencyText}
          </span>
        </div>
      </div>

      {/* Información del Trabajo */}
      <div className="space-y-0.5 py-0.5">
        <h4 className="font-medium text-xs text-foreground line-clamp-1 leading-snug">
          {orden.titulo}
        </h4>
        <div className="flex items-center gap-1.5 pt-0.5">
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

      {/* Bloque especial para tarjeta en espera */}
      {etapaActual && (
        <>
          {/* Motivo de espera: SECANDO */}
          {etapaActual.estado === "secando" && (
            <div className="mt-2 p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-300 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold text-[11px]">
                  <Wind className="h-3.5 w-3.5 animate-pulse" />
                  Secado en progreso
                </span>
                <span className="font-mono font-bold text-[11px] tabular-nums">
                  {secadoTerminado
                    ? "✓ Listo"
                    : segundosRestantesSecado !== null
                    ? formatSecadoCountdown(segundosRestantesSecado)
                    : "Secando"}
                </span>
              </div>
              {etapaActual.secado_hasta && (
                <p className="text-[10px] opacity-80">
                  Hasta: {format(new Date(etapaActual.secado_hasta), "dd/MM HH:mm")}
                </p>
              )}
            </div>
          )}

          {/* Motivo de espera: PROVEEDOR */}
          {etapaActual.estado === "esperando_proveedor" && (
            <div className="mt-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs space-y-0.5">
              <div className="flex items-center justify-between font-semibold text-[11px]">
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  En Proveedor Externo
                </span>
                {etapaActual.enviado_proveedor_en && (
                  <span className="text-[10px] font-mono opacity-80">
                    {format(new Date(etapaActual.enviado_proveedor_en), "dd/MM")}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium truncate">
                {proveedorAsignado ? proveedorAsignado.nombre : "Proveedor asignado"}
              </p>
            </div>
          )}

          {/* Motivo de espera: APROBACIÓN DE CLIENTE */}
          {etapaActual.estado === "esperando_cliente" && (
            <div className="mt-2 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                <Clock className="h-3.5 w-3.5 animate-spin" />
                Esperando aprobación de cliente
              </div>
              <p className="text-[10px] opacity-80 mt-0.5">
                Enlace digital 3D pendiente de respuesta.
              </p>
            </div>
          )}

          {/* Motivo de espera: PAUSADA */}
          {etapaActual.estado === "pausada" && etapaActual.nota_pausa && (
            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                Pausa operativa
              </p>
              <p className="text-[11px] truncate mt-0.5">{etapaActual.nota_pausa}</p>
            </div>
          )}
        </>
      )}

      {/* Botones de Acción Operativa */}
      {etapaActual && (
        <div
          className="pt-2.5 mt-2 border-t border-border/50 flex flex-wrap items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* EN COLA */}
          {etapaActual.estado === "en_cola" && (
            <>
              {onIniciar && (
                <Button
                  type="button"
                  size="sm"
                  disabled={isActionPending}
                  onClick={() => onIniciar(etapaActual.id)}
                  className="flex-1 h-9 font-medium text-xs rounded-lg shadow-xs"
                >
                  <Play className="h-3 w-3 mr-1 fill-current" />
                  <span>Iniciar Estación</span>
                </Button>
              )}
              {areaConfig?.es_condicional && onOmitir && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isActionPending}
                  onClick={() => onOmitir(etapaActual.id)}
                  className="h-9 font-medium text-xs rounded-lg text-muted-foreground hover:text-foreground"
                  title="Omitir estación condicional"
                >
                  <FastForward className="h-3 w-3 mr-1" />
                  <span>Omitir</span>
                </Button>
              )}
            </>
          )}

          {/* EN PROCESO */}
          {etapaActual.estado === "en_proceso" && (
            <>
              {/* Si es CONTROL DE CALIDAD: botones prominentes Aprobar / Rechazar */}
              {areaConfig?.es_control_calidad ? (
                <>
                  {onRechazarCalidad && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isActionPending}
                      onClick={() => onRechazarCalidad(etapaActual.id)}
                      className="flex-1 h-9 font-medium text-xs rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      <span>Rechazar / Reproceso</span>
                    </Button>
                  )}
                  {onAprobarCalidad && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isActionPending}
                      onClick={() => onAprobarCalidad(etapaActual.id)}
                      className="flex-1 h-9 font-medium text-xs rounded-lg bg-[var(--success)] text-[var(--success-foreground)] hover:opacity-90 shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      <span>Aprobar QC</span>
                    </Button>
                  )}
                </>
              ) : (
                /* Áreas de producción normales */
                <>
                  {onPausar && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isActionPending}
                      onClick={() => onPausar(etapaActual.id)}
                      className="h-9 px-2.5 font-medium text-xs rounded-lg border-[var(--warning)]/40 text-[var(--warning)] hover:bg-[var(--warning-subtle)]"
                      title="Pausar trabajo"
                    >
                      <Pause className="h-3 w-3 mr-1" />
                      <span>Pausar</span>
                    </Button>
                  )}

                  {/* Botón especial si el área tiene SECADO */}
                  {areaConfig?.tipo_espera === "secado" && onIniciarSecado && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isActionPending}
                      onClick={() => onIniciarSecado(etapaActual.id)}
                      className="h-9 px-2.5 font-medium text-xs rounded-lg border-sky-500/40 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10"
                    >
                      <Wind className="h-3 w-3 mr-1" />
                      <span>Secar</span>
                    </Button>
                  )}

                  {/* Botón especial si el área tiene PROVEEDOR */}
                  {areaConfig?.tipo_espera === "proveedor" && onEnviarProveedor && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isActionPending}
                        onClick={() => onEnviarProveedor(etapaActual.id)}
                        className="h-9 px-2.5 font-medium text-xs rounded-lg border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                      >
                        <Truck className="h-3 w-3 mr-1" />
                        <span>Proveedor</span>
                      </Button>
                    )}

                  {/* Botón Terminar */}
                  {onTerminar && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isActionPending}
                      onClick={() => onTerminar(etapaActual.id)}
                      className="flex-1 h-9 font-medium text-xs rounded-lg bg-[var(--success)] text-[var(--success-foreground)] hover:opacity-90 shadow-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      <span>Completar</span>
                    </Button>
                  )}
                </>
              )}
            </>
          )}

          {/* PAUSADA */}
          {etapaActual.estado === "pausada" && onReanudar && (
            <Button
              type="button"
              size="sm"
              disabled={isActionPending}
              onClick={() => onReanudar(etapaActual.id)}
              className="w-full h-9 font-medium text-xs rounded-lg bg-[var(--warning)] text-[var(--warning-foreground)] hover:opacity-90 shadow-xs"
            >
              <RotateCw className="h-3 w-3 mr-1" />
              <span>Reanudar Trabajo</span>
            </Button>
          )}

          {/* SECANDO */}
          {etapaActual.estado === "secando" && onTerminar && (
            <div className="flex gap-1.5 w-full">
              <Button
                type="button"
                size="sm"
                disabled={isActionPending || !secadoTerminado}
                onClick={() => onTerminar(etapaActual.id)}
                className={cn(
                  "flex-1 h-9 font-medium text-xs rounded-lg shadow-xs transition-colors",
                  secadoTerminado
                    ? "bg-[var(--success)] text-[var(--success-foreground)] hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
                title={
                  secadoTerminado
                    ? "Finalizar estación y avanzar"
                    : "Secado en curso. El botón se habilitará al completarse el tiempo."
                }
              >
                <Check className="h-3 w-3 mr-1" />
                <span>{secadoTerminado ? "Completar Secado" : "Esperando Secado..."}</span>
              </Button>
              {!secadoTerminado && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isActionPending}
                  onClick={() => onTerminar(etapaActual.id)}
                  className="h-9 px-2 text-[10px] text-sky-600 border-sky-400/40 hover:bg-sky-500/10 shrink-0 font-bold"
                  title="Forzar avance de secado (Supervisor/Admin)"
                >
                  <span>Forzar Secado</span>
                </Button>
              )}
            </div>
          )}

          {/* ESPERANDO PROVEEDOR */}
          {etapaActual.estado === "esperando_proveedor" && onRecibirProveedor && (
            <Button
              type="button"
              size="sm"
              disabled={isActionPending}
              onClick={() => onRecibirProveedor(etapaActual.id)}
              className="w-full h-9 font-medium text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <Truck className="h-3 w-3 mr-1" />
              <span>Recibir de Proveedor</span>
            </Button>
          )}

          {/* TERMINADA */}
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

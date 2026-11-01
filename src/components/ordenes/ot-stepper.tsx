"use client";

import React from "react";
import { AreaRow, OrdenEtapaRow, RechazoCalidadRow, FaseArea } from "@/types/database";
import {
  Check,
  Clock,
  Play,
  Pause,
  Lock,
  UserCheck,
  Truck,
  Timer,
  SkipForward,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { getEstadoEtapaMetadata } from "@/config/estados";
import { cn } from "@/lib/utils";

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Lock,
  Clock,
  Play,
  Pause,
  UserCheck,
  Truck,
  Timer,
  SkipForward,
  Check,
};

const FASES_TITULOS: Record<FaseArea, { label: string; badgeClass: string }> = {
  pre_prensa: {
    label: "Pre-prensa",
    badgeClass: "bg-[var(--ink-cyan-subtle)] text-[var(--ink-cyan-foreground)] border-[var(--ink-cyan)]/30",
  },
  prensa: {
    label: "Prensa",
    badgeClass: "bg-[var(--ink-magenta-subtle)] text-[var(--ink-magenta-foreground)] border-[var(--ink-magenta)]/30",
  },
  post_prensa: {
    label: "Post-prensa",
    badgeClass: "bg-[var(--color-registry-green-subtle)] text-[var(--color-registry-green-foreground)] border-[var(--color-registry-green)]/30",
  },
};

interface OtStepperProps {
  etapas: (OrdenEtapaRow & { area: AreaRow })[];
  rechazos?: RechazoCalidadRow[];
}

export function OtStepper({ etapas, rechazos = [] }: OtStepperProps) {
  const sorted = [...etapas].sort((a, b) => a.secuencia - b.secuencia);
  const ultimoRechazo = rechazos.length > 0 ? rechazos[0] : null;

  // Encontrar el nombre del área destino del reproceso
  const areaDestinoRechazo = ultimoRechazo
    ? sorted.find((e) => e.area.id === ultimoRechazo.area_destino_id)?.area
    : null;

  const fases: FaseArea[] = ["pre_prensa", "prensa", "post_prensa"];

  return (
    <div className="space-y-4">
      {/* Banner de Reproceso si ocurrió rechazo de calidad */}
      {ultimoRechazo && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3.5 flex items-center justify-between gap-3 text-destructive animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider font-display">
                  Reproceso de Calidad Registrado
                </span>
                <span className="text-[11px] font-mono bg-destructive/20 px-2 py-0.2 rounded font-bold">
                  {new Date(ultimoRechazo.created_at).toLocaleDateString("es-ES")}
                </span>
              </div>
              <p className="text-xs text-foreground font-medium mt-0.5 flex items-center gap-1.5">
                <span>Control de Calidad</span>
                <ArrowRight className="h-3 w-3 text-destructive" />
                <span className="font-bold text-destructive underline">
                  {areaDestinoRechazo?.nombre || "Estación de origen"}
                </span>
                <span className="text-muted-foreground font-normal">
                  — Motivo: &quot;{ultimoRechazo.motivo}&quot;
                </span>
              </p>
            </div>
          </div>

          {ultimoRechazo.cantidad_afectada && (
            <span className="text-xs font-mono font-bold shrink-0 bg-card px-2.5 py-1 rounded-lg border border-destructive/30">
              {ultimoRechazo.cantidad_afectada} pliegos afectados
            </span>
          )}
        </div>
      )}

      {/* Flujo agrupado en 3 Fases («Recorrido del Pliego») */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fases.map((fase) => {
          const configFase = FASES_TITULOS[fase];
          const etapasDeFase = sorted.filter((e) => e.area.fase === fase);
          if (etapasDeFase.length === 0) return null;

          return (
            <div
              key={fase}
              className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-display">
                  Fase: {configFase.label}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-mono uppercase px-2 py-0.5 rounded-md border font-semibold",
                    configFase.badgeClass
                  )}
                >
                  {etapasDeFase.filter((e) => e.estado === "terminada").length}/
                  {etapasDeFase.length}
                </span>
              </div>

              <div className="space-y-2">
                {etapasDeFase.map((etapa) => {
                  const info = getEstadoEtapaMetadata(etapa.estado);
                  const IconComp = ICON_COMPONENTS[info.icono] || Clock;
                  const isTerminada = etapa.estado === "terminada";
                  const isEnProceso = etapa.estado === "en_proceso";
                  const isOmitida = etapa.estado === "omitida";
                  const isEnEspera = info.esEnEspera;
                  const esDestinoRechazo =
                    ultimoRechazo && ultimoRechazo.area_destino_id === etapa.area.id;

                  return (
                    <div
                      key={etapa.id}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs transition-[background-color,border-color,box-shadow] duration-150 ease-[var(--ease-out)] flex items-center justify-between",
                        isEnProceso
                          ? "bg-[var(--ink-magenta-subtle)] border-[var(--ink-magenta)] ring-1 ring-[var(--ink-magenta)]/30 shadow-xs"
                          : isEnEspera
                          ? "bg-[var(--ink-yellow-subtle)] border-[var(--ink-yellow)]/40"
                          : isTerminada
                          ? "bg-card border-border/70"
                          : isOmitida
                          ? "bg-muted/30 border-dashed border-border/60 opacity-60"
                          : "bg-card/60 border-border/60 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={cn(
                            "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border",
                            isTerminada
                              ? "bg-[var(--color-registry-green)] border-[var(--color-registry-green)] text-[var(--color-card)]"
                              : isEnProceso
                              ? "bg-[var(--ink-magenta)] border-[var(--ink-magenta)] text-[var(--color-card)]"
                              : isEnEspera
                              ? "bg-[var(--ink-yellow)] border-[var(--ink-yellow)] text-[var(--ink-yellow-foreground)]"
                              : "bg-muted border-border text-muted-foreground"
                          )}
                        >
                          <IconComp className="h-3.5 w-3.5" />
                        </div>

                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground truncate">
                              {etapa.area.nombre}
                            </span>
                            {etapa.intento && etapa.intento > 1 && (
                              <span className="text-[11px] bg-destructive/15 text-destructive font-mono font-bold px-1.5 py-0.2 rounded">
                                #{etapa.intento}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground block truncate">
                            {info.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 pl-2">
                        {esDestinoRechazo && (
                          <span className="text-[11px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                            Reproceso
                          </span>
                        )}
                        {etapa.minutos_trabajados > 0 && (
                          <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                            {etapa.minutos_trabajados}m
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

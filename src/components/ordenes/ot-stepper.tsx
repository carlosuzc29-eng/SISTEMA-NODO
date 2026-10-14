"use client";

import React from "react";
import { AreaRow, OrdenEtapaRow } from "@/types/database";
import { Check, Clock, Play, Pause, Lock } from "lucide-react";

interface OtStepperProps {
  etapas: (OrdenEtapaRow & { area: AreaRow })[];
}

export function OtStepper({ etapas }: OtStepperProps) {
  const sorted = [...etapas].sort((a, b) => a.secuencia - b.secuencia);

  const total = sorted.length;
  const terminadasCount = sorted.filter((e) => e.estado === "terminada").length;
  const progressRatio = total > 1 ? Math.min(1, terminadasCount / (total - 1)) : 0;

  const estadoInfo: Record<
    string,
    { label: string; icon: React.ElementType; badgeBg: string }
  > = {
    bloqueada: { label: "Bloqueada", icon: Lock, badgeBg: "bg-muted text-muted-foreground" },
    en_cola: { label: "En cola", icon: Clock, badgeBg: "bg-muted text-foreground" },
    en_proceso: { label: "En proceso", icon: Play, badgeBg: "bg-primary text-primary-foreground font-semibold" },
    pausada: { label: "Pausada", icon: Pause, badgeBg: "bg-[var(--warning-subtle)] text-[var(--warning)] border border-[var(--warning)]/30" },
    esperando_cliente: { label: "Aprobación", icon: Clock, badgeBg: "bg-[var(--info-subtle)] text-[var(--info)] border border-[var(--info)]/30" },
    terminada: { label: "Terminada", icon: Check, badgeBg: "bg-[var(--success-subtle)] text-[var(--success)] border border-[var(--success)]/30" },
  };

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="min-w-[560px] flex items-center justify-between relative px-4">
        {/* Línea conectora base */}
        <div className="absolute top-5 left-10 right-10 h-1 bg-border/60 -z-0" />

        {/* Línea conectora de progreso (scaleX con origin-left) */}
        <div
          className="absolute top-5 left-10 right-10 h-1 bg-[var(--success)] -z-0 origin-left transition-transform duration-300 ease-[var(--ease-out)]"
          style={{ transform: `scaleX(${progressRatio})` }}
        />

        {sorted.map((etapa) => {
          const info = estadoInfo[etapa.estado] || estadoInfo.bloqueada;
          const IconComp = info.icon;
          const areaColor = etapa.area.color_hex;
          const isTerminada = etapa.estado === "terminada";
          const isEnProceso = etapa.estado === "en_proceso";

          return (
            <div
              key={etapa.id}
              className="flex flex-col items-center text-center relative z-10 px-2"
            >
              {/* Círculo indicador */}
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-[transform,background-color,border-color] duration-150 ease-[var(--ease-out)] shadow-xs ${
                  isTerminada
                    ? "bg-[var(--success)] border-[var(--success)] text-[var(--success-foreground)]"
                    : isEnProceso
                    ? "bg-primary border-primary text-primary-foreground ring-2 ring-primary/25"
                    : "bg-card border-border/80 text-muted-foreground"
                }`}
                style={
                  isEnProceso || isTerminada
                    ? undefined
                    : { borderColor: areaColor, color: areaColor }
                }
              >
                <IconComp className="h-4 w-4" />
              </div>

              {/* Nombre de la Estación */}
              <div className="mt-2">
                <span className="font-semibold text-xs text-foreground block font-mono">
                  {etapa.area.nombre}
                </span>
                <span
                  className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-md font-medium mt-1 ${info.badgeBg}`}
                >
                  {info.label}
                </span>
              </div>

              {/* Minutos trabajados si aplica */}
              {etapa.minutos_trabajados > 0 && (
                <span className="text-[10px] text-muted-foreground mt-0.5 tabular-nums font-mono">
                  {etapa.minutos_trabajados} min
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

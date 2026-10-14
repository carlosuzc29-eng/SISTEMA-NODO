"use client";

import React from "react";
import { AreaRow, OrdenEtapaRow } from "@/types/database";
import { Check, Clock, Play, Pause, Lock } from "lucide-react";

interface OtStepperProps {
  etapas: (OrdenEtapaRow & { area: AreaRow })[];
}

export function OtStepper({ etapas }: OtStepperProps) {
  const sorted = [...etapas].sort((a, b) => a.secuencia - b.secuencia);

  const estadoInfo: Record<
    string,
    { label: string; icon: React.ElementType; badgeBg: string }
  > = {
    bloqueada: { label: "Bloqueada", icon: Lock, badgeBg: "bg-muted text-muted-foreground" },
    en_cola: { label: "En cola", icon: Clock, badgeBg: "bg-slate-200 dark:bg-slate-800 text-foreground" },
    en_proceso: { label: "En proceso", icon: Play, badgeBg: "bg-primary text-primary-foreground animate-pulse" },
    pausada: { label: "Pausada", icon: Pause, badgeBg: "bg-amber-500 text-white" },
    esperando_cliente: { label: "Aprobación", icon: Clock, badgeBg: "bg-purple-600 text-white" },
    terminada: { label: "Terminada", icon: Check, badgeBg: "bg-emerald-500 text-white" },
  };

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="min-w-[600px] flex items-center justify-between relative">
        {/* Línea conectora */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-border/80 -z-0" />

        {sorted.map((etapa, idx) => {
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
                className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-md border-2 transition-all ${
                  isTerminada
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isEnProceso
                    ? "bg-primary border-primary text-white scale-110 shadow-primary/30"
                    : "bg-card border-border/80 text-muted-foreground"
                }`}
                style={
                  isEnProceso || isTerminada
                    ? undefined
                    : { borderColor: areaColor, color: areaColor }
                }
              >
                <IconComp className="h-5 w-5" />
              </div>

              {/* Nombre de la Estación */}
              <div className="mt-2.5">
                <span className="font-bold text-xs text-foreground block">
                  {etapa.area.nombre}
                </span>
                <span
                  className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 ${info.badgeBg}`}
                >
                  {info.label}
                </span>
              </div>

              {/* Minutos trabajados si aplica */}
              {etapa.minutos_trabajados > 0 && (
                <span className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
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

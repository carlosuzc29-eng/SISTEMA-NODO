"use client";

import React from "react";
import Link from "next/link";
import { FlowAreaMetric } from "@/features/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { FaseArea } from "@/types/database";
import { cn } from "@/lib/utils";

interface FlowMapProps {
  areasMetricas: FlowAreaMetric[];
  isTvMode?: boolean;
}

const FASES_TITULOS: Record<
  FaseArea,
  { label: string; desc: string; badgeClass: string; inkBorder: string }
> = {
  pre_prensa: {
    label: "Fase 1: Pre-prensa",
    desc: "Diseño, CTP/Planchas y Materiales",
    badgeClass: "bg-[var(--ink-cyan-subtle)] text-[var(--ink-cyan-foreground)] border-[var(--ink-cyan)]/30",
    inkBorder: "border-[var(--ink-cyan)]",
  },
  prensa: {
    label: "Fase 2: Prensa",
    desc: "Impresión Offset / Digital y Acabados",
    badgeClass: "bg-[var(--ink-magenta-subtle)] text-[var(--ink-magenta-foreground)] border-[var(--ink-magenta)]/30",
    inkBorder: "border-[var(--ink-magenta)]",
  },
  post_prensa: {
    label: "Fase 3: Post-prensa",
    desc: "Troquelado, Corte, Calidad, Embalaje y Despacho",
    badgeClass: "bg-[var(--color-registry-green-subtle)] text-[var(--color-registry-green-foreground)] border-[var(--color-registry-green)]/30",
    inkBorder: "border-[var(--color-registry-green)]",
  },
};

export function FlowMap({ areasMetricas, isTvMode = false }: FlowMapProps) {
  const fases: FaseArea[] = ["pre_prensa", "prensa", "post_prensa"];

  return (
    <div className="space-y-6">
      {fases.map((fase) => {
        const configFase = FASES_TITULOS[fase];
        const areasDeFase = areasMetricas.filter((m) => m.area.fase === fase);
        if (areasDeFase.length === 0) return null;

        const totalEnFase = areasDeFase.reduce((acc, curr) => acc + curr.totalActivas, 0);

        return (
          <div key={fase} className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <span className={cn("font-bold uppercase tracking-wider font-display", isTvMode ? "text-base" : "text-xs")}>
                  {configFase.label}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  • {configFase.desc}
                </span>
              </div>
              <span
                className={cn(
                  "text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-md border font-semibold",
                  configFase.badgeClass
                )}
              >
                {totalEnFase} {totalEnFase === 1 ? "orden activa" : "órdenes activas"}
              </span>
            </div>

            <div
              className={cn(
                "grid gap-3.5",
                fase === "post_prensa"
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
                  : fase === "pre_prensa"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2"
              )}
            >
              {areasDeFase.map(({ area, enCola, enProceso, pausadas, totalActivas, esCuelloBotella }, idx) => (
                <div
                  key={area.id}
                  className={cn(
                    "rounded-2xl border bg-card p-3.5 relative overflow-hidden transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)] group flex flex-col justify-between shadow-xs",
                    esCuelloBotella
                      ? "border-destructive/60 bg-destructive/5 shadow-xs ring-1 ring-destructive/20"
                      : "border-border/80 hover:border-primary/40",
                    isTvMode && "p-4 crop-marks"
                  )}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Barra de color de estación superior con tono de proceso */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: area.color_hex }}
                  />

                  <div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                        0{area.orden}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {esCuelloBotella && (
                          <Badge variant="destructive" className="text-[11px] py-0 px-1.5 gap-1 font-mono font-semibold">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            <span>Cuello</span>
                          </Badge>
                        )}
                        <span
                          className="h-2.5 w-2.5 rounded-full ring-1 ring-border shadow-xs"
                          style={{ backgroundColor: area.color_hex }}
                        />
                      </div>
                    </div>

                    <h4
                      className={cn(
                        "font-semibold text-foreground mt-1.5 truncate group-hover:text-primary transition-colors",
                        isTvMode ? "text-base" : "text-xs"
                      )}
                      title={area.nombre}
                    >
                      {area.nombre}
                    </h4>
                    <span className="text-[11px] text-muted-foreground block font-mono mt-0.5">
                      {totalActivas} {totalActivas === 1 ? "orden activa" : "órdenes activas"}
                    </span>

                    {/* Contadores por Estado de Etapa */}
                    <div className="grid grid-cols-3 gap-1 py-2 mt-2.5 border-y border-border/50 text-center">
                      <div>
                        <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                          Cola
                        </span>
                        <span className="text-xs font-mono font-bold tabular-nums text-foreground">
                          {enCola}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-mono uppercase text-[var(--ink-magenta)] block">
                          Proc
                        </span>
                        <span className="text-xs font-mono font-bold tabular-nums text-[var(--ink-magenta)]">
                          {enProceso}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-mono uppercase text-[var(--ink-yellow-foreground)] block">
                          Esp
                        </span>
                        <span className="text-xs font-mono font-bold tabular-nums text-[var(--ink-yellow-foreground)]">
                          {pausadas}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enlace al Tablero de Área */}
                  {!isTvMode && (
                    <div className="pt-2.5">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-[11px] font-mono font-medium rounded-xl h-7 px-2.5 group-hover:bg-muted/70 transition-[background-color,color] duration-120 ease-[var(--ease-out)]"
                      >
                        <Link href={`/area/${area.slug}`}>
                          <span>Abrir tablero</span>
                          <ArrowRight className="h-3 w-3 transition-transform duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

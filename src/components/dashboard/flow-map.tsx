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
  { label: string; desc: string; badgeClass: string }
> = {
  pre_prensa: {
    label: "Fase 1: Pre-prensa",
    desc: "Diseño, CTP/Planchas y Materiales",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  prensa: {
    label: "Fase 2: Prensa",
    desc: "Impresión Offset / Digital y Acabados",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  post_prensa: {
    label: "Fase 3: Post-prensa",
    desc: "Troquelado, Corte, Calidad, Embalaje y Despacho",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
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
            <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-bold uppercase tracking-wider", isTvMode ? "text-sm" : "text-xs")}>
                  {configFase.label}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  • {configFase.desc}
                </span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border font-semibold",
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
              {areasDeFase.map(({ area, enCola, enProceso, pausadas, totalActivas, esCuelloBotella }) => (
                <div
                  key={area.id}
                  className={cn(
                    "rounded-2xl border bg-card p-3.5 relative overflow-hidden transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)] group flex flex-col justify-between shadow-xs",
                    esCuelloBotella
                      ? "border-destructive/60 bg-destructive/5 shadow-xs ring-1 ring-destructive/20"
                      : "border-border/80 hover:border-primary/40",
                    isTvMode && "p-4"
                  )}
                >
                  {/* Barra de color de área superior */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: area.color_hex }}
                  />

                  <div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        0{area.orden}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {esCuelloBotella && (
                          <Badge variant="destructive" className="text-[9px] py-0 px-1 gap-1 font-mono font-semibold">
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
                        "font-semibold text-foreground mt-1 truncate group-hover:text-primary transition-colors",
                        isTvMode ? "text-base" : "text-xs"
                      )}
                      title={area.nombre}
                    >
                      {area.nombre}
                    </h4>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {totalActivas} {totalActivas === 1 ? "activa" : "activas"}
                    </span>

                    {/* Contadores por Estado de Etapa */}
                    <div className="grid grid-cols-3 gap-1 py-2 mt-2 border-y border-border/50 text-center">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-muted-foreground block">
                          Cola
                        </span>
                        <span className="text-xs font-mono font-bold tabular-nums text-foreground">
                          {enCola}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-muted-foreground block">
                          Proc
                        </span>
                        <span className="text-xs font-mono font-bold tabular-nums text-primary">
                          {enProceso}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-muted-foreground block">
                          Esp
                        </span>
                        <span className="text-xs font-mono font-bold tabular-nums text-amber-500">
                          {pausadas}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enlace al Tablero de Área */}
                  {!isTvMode && (
                    <div className="pt-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-[11px] font-mono font-medium rounded-lg h-7 px-2 group-hover:bg-muted/70"
                      >
                        <Link href={`/area/${area.slug}`}>
                          <span>Abrir</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
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

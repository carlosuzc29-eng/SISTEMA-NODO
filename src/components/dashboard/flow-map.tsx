"use client";

import React from "react";
import Link from "next/link";
import { FlowAreaMetric } from "@/features/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface FlowMapProps {
  areasMetricas: FlowAreaMetric[];
}

export function FlowMap({ areasMetricas }: FlowMapProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {areasMetricas.map(({ area, enCola, enProceso, pausadas, totalActivas, esCuelloBotella }, idx) => (
        <div
          key={area.id}
          className={`rounded-xl border bg-card p-4 relative overflow-hidden transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)] group flex flex-col justify-between ${
            esCuelloBotella
              ? "border-destructive/60 bg-destructive-subtle/10 shadow-xs ring-1 ring-destructive/20"
              : "border-border/80 hover:border-primary/40 shadow-xs"
          }`}
        >
          {/* Barra de color de área superior */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: area.color_hex }}
          />

          <div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="label-caps text-muted-foreground/80">
                Estación 0{idx + 1}
              </span>
              <div className="flex items-center gap-1.5">
                {esCuelloBotella && (
                  <Badge variant="destructive" className="text-[10px] py-0 px-1.5 gap-1 font-mono font-semibold">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    <span>Cuello de botella</span>
                  </Badge>
                )}
                <span
                  className="h-2 w-2 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: area.color_hex }}
                />
              </div>
            </div>

            <h4 className="font-semibold text-base text-foreground mt-1.5 group-hover:text-primary transition-[color] duration-150 ease-[var(--ease-out)]">
              {area.nombre}
            </h4>
            <span className="text-[11px] text-muted-foreground block font-mono">
              {totalActivas} {totalActivas === 1 ? "orden activa" : "órdenes activas"}
            </span>

            {/* Contadores por Estado de Etapa */}
            <div className="grid grid-cols-3 gap-2 py-2.5 mt-3 border-y border-border/50 text-center">
              <div>
                <span className="label-caps text-muted-foreground block">
                  En Cola
                </span>
                <span className="text-sm font-mono font-bold tabular-nums text-foreground">
                  {enCola}
                </span>
              </div>
              <div>
                <span className="label-caps text-muted-foreground block">
                  Proceso
                </span>
                <span className="text-sm font-mono font-bold tabular-nums text-primary">
                  {enProceso}
                </span>
              </div>
              <div>
                <span className="label-caps text-muted-foreground block">
                  Pausa
                </span>
                <span className="text-sm font-mono font-bold tabular-nums text-[var(--warning)]">
                  {pausadas}
                </span>
              </div>
            </div>
          </div>

          {/* Enlace al Tablero de Área */}
          <div className="pt-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full justify-between text-xs font-mono font-medium rounded-lg h-8 group-hover:bg-muted/70"
            >
              <Link href={`/area/${area.slug}`}>
                <span>Abrir Estación</span>
                <ArrowRight className="h-3 w-3 transition-[transform] duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

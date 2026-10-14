"use client";

import React from "react";
import Link from "next/link";
import { FlowAreaMetric } from "@/features/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, Layers } from "lucide-react";

interface FlowMapProps {
  areasMetricas: FlowAreaMetric[];
}

export function FlowMap({ areasMetricas }: FlowMapProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {areasMetricas.map(({ area, enCola, enProceso, pausadas, totalActivas, esCuelloBotella }, idx) => (
        <div
          key={area.id}
          className={`rounded-2xl border bg-card p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md group flex flex-col justify-between ${
            esCuelloBotella
              ? "border-red-500/50 shadow-red-500/10 ring-1 ring-red-500/20"
              : "border-border/80 hover:border-primary/50"
          }`}
        >
          {/* Barra de color de área superior */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: area.color_hex }}
          />

          <div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Estación 0{idx + 1}
              </span>
              <div className="flex items-center gap-1.5">
                {esCuelloBotella && (
                  <Badge variant="destructive" className="text-[10px] py-0 px-1.5 gap-1 animate-pulse">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    <span>Cuello de botella</span>
                  </Badge>
                )}
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: area.color_hex }}
                />
              </div>
            </div>

            <h4 className="font-bold text-lg text-foreground mt-2 group-hover:text-primary transition-colors">
              {area.nombre}
            </h4>
            <span className="text-xs text-muted-foreground block">
              {totalActivas} {totalActivas === 1 ? "orden activa" : "órdenes activas"}
            </span>

            {/* Contadores por Estado de Etapa */}
            <div className="grid grid-cols-3 gap-2 py-3 mt-3 border-y border-border/60 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  En Cola
                </span>
                <span className="text-base font-bold tabular-nums text-foreground">
                  {enCola}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Proceso
                </span>
                <span className="text-base font-bold tabular-nums text-primary">
                  {enProceso}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Pausa
                </span>
                <span className="text-base font-bold tabular-nums text-amber-500">
                  {pausadas}
                </span>
              </div>
            </div>
          </div>

          {/* Enlace al Tablero de Área */}
          <div className="pt-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full justify-between text-xs font-semibold rounded-xl group-hover:bg-accent/80"
            >
              <Link href={`/area/${area.slug}`}>
                <span>Abrir Tablero de {area.nombre}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

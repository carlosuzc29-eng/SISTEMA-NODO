"use client";

import React from "react";
import { AreaRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Plus, X, ArrowRight, Layers, ArrowLeft } from "lucide-react";

interface RouteBuilderProps {
  todasLasAreas: AreaRow[];
  rutaSeleccionada: string[]; // IDs de áreas
  onChange: (nuevaRuta: string[]) => void;
}

export function RouteBuilder({
  todasLasAreas,
  rutaSeleccionada,
  onChange,
}: RouteBuilderProps) {
  const areasMap = new Map(todasLasAreas.map((a) => [a.id, a]));

  const handleRemove = (index: number) => {
    if (rutaSeleccionada.length <= 1) return;
    const copia = [...rutaSeleccionada];
    copia.splice(index, 1);
    onChange(copia);
  };

  const handleAdd = (areaId: string) => {
    onChange([...rutaSeleccionada, areaId]);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rutaSeleccionada.length) return;
    const copia = [...rutaSeleccionada];
    const temp = copia[index];
    copia[index] = copia[targetIndex];
    copia[targetIndex] = temp;
    onChange(copia);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Layers className="h-4 w-4" />
          Ruta de Producción (Secuencia de Estaciones)
        </label>
        <span className="text-xs text-muted-foreground">
          {rutaSeleccionada.length} estaciones programadas
        </span>
      </div>

      {/* Chips de Ruta Ordenada */}
      <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl border border-border/80 bg-muted/20 min-h-[64px]">
        {rutaSeleccionada.map((areaId, idx) => {
          const area = areasMap.get(areaId);
          if (!area) return null;
          const isFirst = idx === 0;
          const isLast = idx === rutaSeleccionada.length - 1;

          return (
            <React.Fragment key={`${areaId}-${idx}`}>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white font-medium text-xs shadow-sm transition-all"
                style={{ backgroundColor: area.color_hex }}
              >
                <span className="bg-black/20 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span>{area.nombre}</span>

                {/* Controles de Reordenamiento */}
                <div className="flex items-center gap-0.5 ml-1 bg-black/10 rounded-md p-0.5">
                  {!isFirst && (
                    <button
                      type="button"
                      title="Mover a la izquierda"
                      onClick={() => handleMove(idx, "left")}
                      className="hover:bg-white/20 p-0.5 rounded text-white"
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </button>
                  )}
                  {!isLast && (
                    <button
                      type="button"
                      title="Mover a la derecha"
                      onClick={() => handleMove(idx, "right")}
                      className="hover:bg-white/20 p-0.5 rounded text-white"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Botón Quitar */}
                {rutaSeleccionada.length > 1 && (
                  <button
                    type="button"
                    title="Quitar área"
                    onClick={() => handleRemove(idx)}
                    className="hover:bg-black/30 p-0.5 rounded-full text-white/80 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {!isLast && (
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Agregar Estación Adicional */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-muted-foreground block">
          Agregar estación a la ruta:
        </span>
        <div className="flex flex-wrap gap-2">
          {todasLasAreas.map((area) => (
            <Button
              key={area.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAdd(area.id)}
              className="h-8 text-xs rounded-xl border-dashed hover:border-solid gap-1.5"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: area.color_hex }}
              />
              <Plus className="h-3 w-3 text-muted-foreground" />
              <span>{area.nombre}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

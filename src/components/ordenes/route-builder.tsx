"use client";

import React from "react";
import { AreaRow, FaseArea } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, X, ArrowRight, Layers, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RouteBuilderProps {
  todasLasAreas: AreaRow[];
  rutaSeleccionada: string[]; // IDs de áreas seleccionadas en orden
  onChange: (nuevaRuta: string[]) => void;
  usaPlanchasExistentes?: boolean;
  onTogglePlanchas?: (checked: boolean) => void;
}

const FASES_CONFIG: Record<
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
    desc: "Impresión y Acabados exteriores",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  post_prensa: {
    label: "Fase 3: Post-prensa",
    desc: "Troquelado, Corte, Calidad, Embalaje y Despacho",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
};

export function RouteBuilder({
  todasLasAreas,
  rutaSeleccionada,
  onChange,
  usaPlanchasExistentes = false,
  onTogglePlanchas,
}: RouteBuilderProps) {
  const areasMap = new Map(todasLasAreas.map((a) => [a.id, a]));

  const handleToggleArea = (areaId: string) => {
    if (rutaSeleccionada.includes(areaId)) {
      if (rutaSeleccionada.length <= 1) return;
      onChange(rutaSeleccionada.filter((id) => id !== areaId));
    } else {
      // Insertar respetando el orden natural del flujo de producción
      const targetArea = areasMap.get(areaId);
      if (!targetArea) return;

      const nuevaRuta = [...rutaSeleccionada, areaId].sort((aId, bId) => {
        const ordenA = areasMap.get(aId)?.orden || 99;
        const ordenB = areasMap.get(bId)?.orden || 99;
        return ordenA - ordenB;
      });
      onChange(nuevaRuta);
    }
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

  // Agrupar todas las áreas por fase
  const fases: FaseArea[] = ["pre_prensa", "prensa", "post_prensa"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Layers className="h-4 w-4" />
          Constructor de Ruta de Producción
        </label>
        <span className="text-xs font-mono font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg">
          {rutaSeleccionada.length} de {todasLasAreas.length} estaciones activas
        </span>
      </div>

      {/* Switch Especial: Usa planchas existentes */}
      {onTogglePlanchas && (
        <div className="p-4 rounded-2xl border border-sky-500/30 bg-sky-500/5 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              ¿Usa planchas CTP existentes en taller?
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Si está activo, la estación de <strong>Planchas</strong> se omitirá automáticamente de la ruta.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-medium">
              {usaPlanchasExistentes ? "Sí (Omitir)" : "No (Grabar)"}
            </span>
            <Switch
              checked={usaPlanchasExistentes}
              onCheckedChange={onTogglePlanchas}
            />
          </div>
        </div>
      )}

      {/* Vista de Secuencia Activa */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Secuencia programada para esta orden:
        </span>
        <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl border border-border/80 bg-muted/20 min-h-[64px]">
          {rutaSeleccionada.map((areaId, idx) => {
            const area = areasMap.get(areaId);
            if (!area) return null;
            const isFirst = idx === 0;
            const isLast = idx === rutaSeleccionada.length - 1;

            return (
              <React.Fragment key={`${areaId}-${idx}`}>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white font-medium text-xs shadow-xs transition-all"
                  style={{ backgroundColor: area.color_hex }}
                >
                  <span className="bg-black/20 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span>{area.nombre}</span>

                  {/* Reordenamiento */}
                  <div className="flex items-center gap-0.5 ml-1 bg-black/15 rounded-md p-0.5">
                    {!isFirst && (
                      <button
                        type="button"
                        title="Mover antes"
                        onClick={() => handleMove(idx, "left")}
                        className="hover:bg-white/20 p-0.5 rounded text-white"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                    )}
                    {!isLast && (
                      <button
                        type="button"
                        title="Mover después"
                        onClick={() => handleMove(idx, "right")}
                        className="hover:bg-white/20 p-0.5 rounded text-white"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Quitar */}
                  {rutaSeleccionada.length > 1 && (
                    <button
                      type="button"
                      title="Excluir de la ruta"
                      onClick={() => handleToggleArea(areaId)}
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
      </div>

      {/* Áreas agrupadas por las 3 fases para activar / desactivar */}
      <div className="space-y-4 pt-2">
        <span className="text-xs font-semibold text-muted-foreground block">
          Estaciones disponibles organizadas por Fase (activa o desactiva las opcionales):
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fases.map((fase) => {
            const config = FASES_CONFIG[fase];
            const areasDeFase = todasLasAreas
              .filter((a) => a.fase === fase)
              .sort((a, b) => a.orden - b.orden);

            return (
              <div
                key={fase}
                className="rounded-2xl border border-border/80 bg-card/60 p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div>
                    <h4 className="font-bold text-xs text-foreground">
                      {config.label}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {config.desc}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border font-semibold",
                      config.badgeClass
                    )}
                  >
                    {areasDeFase.filter((a) => rutaSeleccionada.includes(a.id)).length}/{areasDeFase.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {areasDeFase.map((area) => {
                    const isSelected = rutaSeleccionada.includes(area.id);
                    const esOpcional = area.es_condicional;

                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => handleToggleArea(area.id)}
                        className={cn(
                          "w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between",
                          isSelected
                            ? "bg-card border-border shadow-xs text-foreground"
                            : "bg-muted/30 border-dashed border-border/60 text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: isSelected ? area.color_hex : "gray",
                            }}
                          />
                          <span className="truncate">{area.nombre}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {esOpcional && (
                            <span className="text-[9px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                              Opcional
                            </span>
                          )}
                          <div
                            className={cn(
                              "h-4 w-4 rounded-md border flex items-center justify-center text-[10px]",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border/80 bg-background"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

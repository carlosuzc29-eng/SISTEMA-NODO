"use client";

import React, { useState } from "react";
import { AreaRow, OrdenEtapaRow } from "@/types/database";
import { OrdenConRelaciones } from "@/features/ordenes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, X, Undo2 } from "lucide-react";

interface RechazoModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: OrdenConRelaciones;
  etapaActual: OrdenEtapaRow;
  areasDisponibles: AreaRow[];
  onConfirm: (areaDestinoId: string, motivo: string, cantidadAfectada?: number | null) => void;
  isPending?: boolean;
}

export function RechazoModal({
  isOpen,
  onClose,
  orden,
  etapaActual,
  areasDisponibles,
  onConfirm,
  isPending = false,
}: RechazoModalProps) {
  // Las áreas destino posibles son aquellas en la ruta de la orden con secuencia menor a la etapa QC
  const areaActualConfig = areasDisponibles.find((a) => a.id === etapaActual.area_id);
  const etapasPrevias = (orden.etapas && orden.etapas.length > 0)
    ? orden.etapas
        .filter((e) => e.secuencia < etapaActual.secuencia)
        .sort((a, b) => a.secuencia - b.secuencia)
    : [];

  const areasDestino: AreaRow[] = etapasPrevias.length > 0
    ? (etapasPrevias
        .map((e) => areasDisponibles.find((a) => a.id === e.area_id) || e.area)
        .filter(Boolean) as AreaRow[])
    : areasDisponibles.filter((a) => a.orden < (areaActualConfig?.orden || 9) && a.activa);

  const defaultDestinoId = areasDestino[areasDestino.length - 1]?.id || "";
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const areaDestinoId = selectedAreaId || defaultDestinoId;

  const [motivo, setMotivo] = useState("");
  const [cantidadAfectada, setCantidadAfectada] = useState<number | undefined>(undefined);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaDestinoId || !motivo.trim()) return;
    onConfirm(areaDestinoId, motivo.trim(), cantidadAfectada);
  };

  const proximoIntento = (etapaActual.intento || 1) + 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-destructive/50 p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <h3 className="font-bold text-lg text-foreground font-display">
                Rechazar Trabajo en Control de Calidad
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Orden {orden.codigo} • Pasará a Reproceso (Intento #{proximoIntento})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2.5 text-xs text-destructive dark:text-red-300">
            <Undo2 className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Regla de reproceso</p>
              <p className="opacity-90">
                La orden volverá a la cola del área seleccionada. Las etapas intermedias se reiniciarán para garantizar la trazabilidad completa del producto.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ¿A qué área debe regresar para corrección? *
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {areasDestino.map((a) => {
                const isSelected = areaDestinoId === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAreaId(a.id)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-[background-color,border-color,color] duration-120 ease-[var(--ease-out)] flex items-center justify-between ${
                      isSelected
                        ? "bg-destructive/15 border-destructive text-destructive font-bold ring-1 ring-destructive/30"
                        : "bg-muted/30 border-border/70 hover:border-destructive/40 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: a.color_hex }}
                      />
                      <span>{a.nombre}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Fase {a.fase.replace("_", "-")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Motivo del Rechazo / Defecto Detectado *
            </label>
            <Input
              placeholder="Ej. Mancha de tinta en cara posterior del pliego, o fuera de registro"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="text-sm font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cantidad de pliegos/unidades afectadas (opcional)
            </label>
            <Input
              type="number"
              min="1"
              placeholder={`Total orden: ${orden.cantidad}`}
              value={cantidadAfectada !== undefined ? cantidadAfectada : ""}
              onChange={(e) =>
                setCantidadAfectada(e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !areaDestinoId || !motivo.trim()}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold rounded-xl px-5"
            >
              {isPending ? "Procesando..." : "Confirmar Rechazo y Reproceso"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

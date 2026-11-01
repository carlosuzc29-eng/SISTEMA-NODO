"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wind, Clock, X, AlertCircle } from "lucide-react";
import { addHours, format } from "date-fns";
import { es } from "date-fns/locale";

interface SecadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (horas: number, notas: string) => void;
  isPending?: boolean;
}

export function SecadoModal({
  isOpen,
  onClose,
  onConfirm,
  isPending = false,
}: SecadoModalProps) {
  const [horas, setHoras] = useState(4);
  const [notas, setNotas] = useState("");

  if (!isOpen) return null;

  const finEstimado = addHours(new Date(), horas);
  const presets = [1, 2, 4, 8, 12, 24];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (horas <= 0) return;
    onConfirm(horas, notas);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5 text-sky-500">
            <Wind className="h-5 w-5" />
            <h3 className="font-bold text-lg text-foreground">
              Iniciar Período de Secado
            </h3>
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
          <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-3 flex items-start gap-2.5 text-xs text-sky-600 dark:text-sky-300">
            <Clock className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Control de tiempo de secado</p>
              <p className="opacity-90">
                La orden permanecerá en espera. El botón para completar la estación estará bloqueado hasta que se cumpla el tiempo estimado.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tiempo estimado de secado
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0.5"
                max="72"
                step="0.5"
                value={horas}
                onChange={(e) => setHoras(parseFloat(e.target.value) || 1)}
                className="font-mono text-center text-lg font-bold w-28"
              />
              <span className="text-sm font-medium text-muted-foreground">horas</span>
            </div>

            {/* Presets rápidos */}
            <div className="flex items-center gap-1.5 pt-1">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setHoras(p)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                    horas === p
                      ? "bg-sky-500 text-white border-sky-500 font-bold"
                      : "bg-muted/40 border-border/60 hover:bg-muted text-foreground"
                  }`}
                >
                  {p}h
                </button>
              ))}
            </div>
          </div>

          {/* Preview hora de finalización */}
          <div className="bg-muted/40 rounded-xl p-3 border border-border/60 text-xs flex justify-between items-center">
            <span className="text-muted-foreground">Secado completo estimado:</span>
            <span className="font-mono font-bold text-foreground capitalize">
              {format(finEstimado, "EEEE d, HH:mm", { locale: es })}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notas u observaciones (opcional)
            </label>
            <Input
              placeholder="Ej. Tinta metálica, ventilación activa en rack #3"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="text-sm"
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
              disabled={isPending || horas <= 0}
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl px-5"
            >
              {isPending ? "Iniciando..." : "Comenzar Secado"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

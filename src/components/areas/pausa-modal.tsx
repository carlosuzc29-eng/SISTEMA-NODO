"use client";

import React, { useState } from "react";
import { MotivoPausaRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pause, AlertCircle, X } from "lucide-react";

interface PausaModalProps {
  isOpen: boolean;
  onClose: () => void;
  motivos: MotivoPausaRow[];
  onConfirm: (motivoId: string, nota: string) => void;
  isPending?: boolean;
}

export function PausaModal({
  isOpen,
  onClose,
  motivos,
  onConfirm,
  isPending = false,
}: PausaModalProps) {
  const [motivoId, setMotivoId] = useState(motivos[0]?.id || "");
  const [nota, setNota] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoId) return;
    onConfirm(motivoId, nota);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5 text-amber-500">
            <Pause className="h-5 w-5" />
            <h3 className="font-bold text-lg text-foreground">
              Pausar Trabajo en esta Estación
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
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Selecciona el Motivo de la Pausa *
            </label>
            <div className="space-y-2">
              {motivos.map((m) => {
                const isSelected = motivoId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMotivoId(m.id)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold transition-[background-color,border-color,color] duration-120 ease-[var(--ease-out)] ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30"
                        : "bg-muted/30 border-border/70 hover:border-amber-500/40 text-foreground"
                    }`}
                  >
                    {m.texto}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nota u Observación Adicional (Opcional)
            </label>
            <Input
              placeholder="Ej. Esperando bobina de 300g del proveedor"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
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
              disabled={isPending || !motivoId}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl px-5"
            >
              {isPending ? "Pausando..." : "Confirmar Pausa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

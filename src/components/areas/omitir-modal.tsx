"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FastForward, X } from "lucide-react";

interface OmitirModalProps {
  isOpen: boolean;
  onClose: () => void;
  nombreArea: string;
  onConfirm: (motivo: string) => void;
  isPending?: boolean;
}

export function OmitirModal({
  isOpen,
  onClose,
  nombreArea,
  onConfirm,
  isPending = false,
}: OmitirModalProps) {
  const [motivo, setMotivo] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) return;
    onConfirm(motivo.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5 text-slate-500">
            <FastForward className="h-5 w-5" />
            <h3 className="font-bold text-lg text-foreground">
              Omitir Estación: {nombreArea}
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
          <p className="text-xs text-muted-foreground leading-relaxed">
            Esta es un área opcional en el flujo. Al omitirla, la etapa quedará registrada como omitida con su justificación y el trabajo avanzará automáticamente al siguiente paso.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Motivo u observación de omisión *
            </label>
            <Input
              placeholder="Ej. El cliente entregó el papel previamente troquelado"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="text-sm font-medium"
              required
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
              disabled={isPending || !motivo.trim()}
              className="bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl px-5"
            >
              {isPending ? "Omitiendo..." : "Confirmar Omisión"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

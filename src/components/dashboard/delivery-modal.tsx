"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCheck, X, Truck, Loader2 } from "lucide-react";
import { marcarEntregadaAction, OrdenConRelaciones } from "@/features/ordenes/actions";
import { toast } from "sonner";

interface DeliveryModalProps {
  orden: OrdenConRelaciones | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeliveryModal({ orden, onClose, onSuccess }: DeliveryModalProps) {
  const [entregadaA, setEntregadaA] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!orden) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entregadaA.trim()) {
      toast.error("Por favor indica quién retira la orden");
      return;
    }

    startTransition(async () => {
      const res = await marcarEntregadaAction(orden.id, entregadaA.trim());
      if (res.ok) {
        toast.success(`¡Orden ${orden.codigo} marcada como entregada!`);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "No se pudo registrar la entrega");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5 text-emerald-600">
            <Truck className="h-5 w-5" />
            <h3 className="font-bold text-lg text-foreground">
              Confirmar Entrega de Trabajo
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

        <div className="rounded-xl bg-muted/30 p-3.5 border border-border/60 text-xs space-y-1">
          <p>
            <strong>Orden:</strong> {orden.codigo} — {orden.titulo}
          </p>
          <p>
            <strong>Cliente:</strong> {orden.cliente.empresa || orden.cliente.nombre}
          </p>
          <p>
            <strong>Cantidad:</strong> {orden.cantidad.toLocaleString("es-ES")} unidades
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nombre de la persona que retira *
            </label>
            <Input
              placeholder="Ej. Juan Pérez (Mensajero) / Directo Cliente"
              value={entregadaA}
              onChange={(e) => setEntregadaA(e.target.value)}
              autoFocus
              className="text-sm"
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
              disabled={isPending || !entregadaA.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-5"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCheck className="mr-1.5 h-4 w-4" />
                  Marcar como Entregada
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

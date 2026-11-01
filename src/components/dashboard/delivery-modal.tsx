"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCheck, X, Truck, Loader2, FileText, User } from "lucide-react";
import { despacharOrdenAction, OrdenConRelaciones } from "@/features/ordenes/actions";
import { toast } from "sonner";

interface DeliveryModalProps {
  orden: OrdenConRelaciones | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeliveryModal({ orden, onClose, onSuccess }: DeliveryModalProps) {
  const [despachadaA, setDespachadaA] = useState("");
  const [transportista, setTransportista] = useState("");
  const [guiaDespacho, setGuiaDespacho] = useState("");
  const [tipoRetiro, setTipoRetiro] = useState<"cliente" | "transportista">("cliente");
  const [isPending, startTransition] = useTransition();

  if (!orden) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!despachadaA.trim()) {
      toast.error("Por favor indica quién retira o recibe la orden");
      return;
    }

    startTransition(async () => {
      const res = await despacharOrdenAction(
        orden.id,
        despachadaA.trim(),
        tipoRetiro === "transportista" ? transportista.trim() || "Transporte Externo" : null,
        guiaDespacho.trim() || null
      );
      if (res.ok) {
        toast.success(`¡Orden ${orden.codigo} despachada con éxito!`);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "No se pudo registrar el despacho");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
            <Truck className="h-5 w-5" />
            <h3 className="font-bold text-lg text-foreground">
              Confirmar Despacho de Orden
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Tipo de Retiro */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Modalidad de Retiro
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoRetiro("cliente")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  tipoRetiro === "cliente"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 border-border/70 text-foreground hover:bg-muted"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Cliente / Mensajero</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoRetiro("transportista")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  tipoRetiro === "transportista"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 border-border/70 text-foreground hover:bg-muted"
                }`}
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Envío / Transportista</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {tipoRetiro === "cliente"
                ? "Nombre de la persona que retira *"
                : "Nombre del chofer o receptor *"}
            </label>
            <Input
              placeholder="Ej. Juan Pérez (C.I. 12.345.678)"
              value={despachadaA}
              onChange={(e) => setDespachadaA(e.target.value)}
              autoFocus
              className="text-sm"
              required
            />
          </div>

          {tipoRetiro === "transportista" && (
            <div className="space-y-1.5 animate-in fade-in-50">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Empresa o Datos de Transporte
              </label>
              <Input
                placeholder="Ej. MRW / Zoom / Flete Propio Camión #2"
                value={transportista}
                onChange={(e) => setTransportista(e.target.value)}
                className="text-sm"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              Guía de Despacho / Remisión (Opcional)
            </label>
            <Input
              placeholder="Ej. GD-2026-0891"
              value={guiaDespacho}
              onChange={(e) => setGuiaDespacho(e.target.value)}
              className="text-sm font-mono"
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
              disabled={isPending || !despachadaA.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-5"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Despachando...
                </>
              ) : (
                <>
                  <CheckCheck className="mr-1.5 h-4 w-4" />
                  Confirmar Despacho
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

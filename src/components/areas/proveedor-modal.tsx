"use client";

import React, { useState } from "react";
import { ProveedorRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, X, Calendar } from "lucide-react";
import { addDays, format } from "date-fns";

interface ProveedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  proveedores: ProveedorRow[];
  onConfirm: (proveedorId: string, fechaEstimadaRetorno: string, notas: string) => void;
  isPending?: boolean;
}

export function ProveedorModal({
  isOpen,
  onClose,
  proveedores,
  onConfirm,
  isPending = false,
}: ProveedorModalProps) {
  const [proveedorId, setProveedorId] = useState(proveedores[0]?.id || "");
  const [fechaEstimada, setFechaEstimada] = useState(
    format(addDays(new Date(), 2), "yyyy-MM-dd")
  );
  const [notas, setNotas] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorId) return;
    onConfirm(proveedorId, fechaEstimada, notas);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5 text-[var(--color-pantone-orange)]">
            <Truck className="h-5 w-5" />
            <h3 className="font-bold text-lg text-foreground">
              Enviar a Proveedor Externo
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
              Proveedor Externo *
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {proveedores.map((p) => {
                const isSelected = proveedorId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProveedorId(p.id)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-[background-color,border-color,color] duration-120 ease-[var(--ease-out)] flex items-center justify-between ${
                      isSelected
                        ? "bg-[var(--color-pantone-orange-subtle)] border-[var(--color-pantone-orange)] text-[var(--color-pantone-orange-foreground)] ring-1 ring-[var(--color-pantone-orange)]/30"
                        : "bg-muted/30 border-border/70 hover:border-[var(--color-pantone-orange)]/40 text-foreground"
                    }`}
                  >
                    <div>
                      <p>{p.nombre}</p>
                      {p.telefono && (
                        <p className="text-[11px] text-muted-foreground font-mono font-normal">
                          Tel: {p.telefono}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] uppercase font-mono tracking-wider opacity-70 bg-muted px-1.5 py-0.5 rounded">
                      {p.tipo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Fecha estimada de retorno
            </label>
            <Input
              type="date"
              value={fechaEstimada}
              onChange={(e) => setFechaEstimada(e.target.value)}
              className="font-mono text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Instrucciones o notas de envío
            </label>
            <Input
              placeholder="Ej. Lleva 200 pliegos para barniz UV sectorizado"
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
              disabled={isPending || !proveedorId}
              className="bg-[var(--color-pantone-orange)] hover:opacity-90 text-[var(--color-pantone-orange-foreground)] font-semibold rounded-xl px-5"
            >
              {isPending ? "Registrando..." : "Registrar Envío"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

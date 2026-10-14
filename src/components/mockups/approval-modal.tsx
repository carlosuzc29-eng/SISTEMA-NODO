"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { aprobarArteAction, solicitarCambiosAction } from "@/features/mockups/actions";
import { toast } from "sonner";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  type: "approve" | "reject";
  onSuccess: () => void;
}

export function ApprovalModal({
  isOpen,
  onClose,
  token,
  type,
  onSuccess,
}: ApprovalModalProps) {
  const [nombre, setNombre] = useState("");
  const [cargoDni, setCargoDni] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isApprove = type === "approve";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("Por favor ingresa tu nombre completo");
      return;
    }

    if (!isApprove && comentarios.trim().length < 5) {
      toast.error("Por favor detalla los cambios requeridos (mínimo 5 caracteres)");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isApprove) {
        const res = await aprobarArteAction({
          token,
          nombre: nombre.trim(),
          cargo_dni: cargoDni.trim() || null,
        });

        if (res.ok) {
          toast.success("¡Arte aprobado exitosamente! Notificamos al equipo de producción.");
          onSuccess();
          onClose();
        } else {
          toast.error(res.error || "No se pudo registrar la aprobación");
        }
      } else {
        const res = await solicitarCambiosAction({
          token,
          nombre: nombre.trim(),
          comentarios: comentarios.trim(),
        });

        if (res.ok) {
          toast.success("Comentarios enviados al diseñador responsable.");
          onSuccess();
          onClose();
        } else {
          toast.error(res.error || "No se pudo registrar la solicitud");
        }
      }
    } catch {
      toast.error("Ocurrió un error inesperado al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isApprove
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
              }`}
            >
              {isApprove ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isApprove ? "Aprobación Formal de Arte" : "Solicitud de Correcciones"}
              </h2>
              <p className="text-xs text-slate-500">
                {isApprove
                  ? "Al aprobar, autorizas el paso de tu pedido a la fase de impresión."
                  : "Indica qué ajustes necesita el equipo de diseño para corregir tu arte."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tu Nombre y Apellido *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Laura Méndez"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {isApprove ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Cargo o Documento (Opcional)
              </label>
              <input
                type="text"
                value={cargoDni}
                onChange={(e) => setCargoDni(e.target.value)}
                placeholder="Ej: Gerente de Compras / DNI-12345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Se registrará tu confirmación digital con fecha, hora e IP para constancia de conformidad.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Detalle de los cambios requeridos *
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Ej: Modificar el número de teléfono en el lateral y hacer el logo principal un 10% más grande..."
                rows={4}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-xl text-xs font-semibold gap-2 ${
                isApprove
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : isApprove ? (
                "Confirmar Aprobación"
              ) : (
                "Enviar Correcciones"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

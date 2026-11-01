"use client";

import React, { useState, useTransition } from "react";
import { OrdenConRelaciones, agregarComentarioAction } from "@/features/ordenes/actions";
import { OtSemaphore } from "@/components/ordenes/ot-semaphore";
import { OtStepper } from "@/components/ordenes/ot-stepper";
import { TimelineFeed } from "@/components/ordenes/timeline-feed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  X,
  Send,
  ExternalLink,
  Box,
  Layers,
  FileText,
  Calendar,
  MessageSquare,
  Clock,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

interface OtSheetDetailProps {
  orden: OrdenConRelaciones | null;
  onClose: () => void;
}

export function OtSheetDetail({ orden, onClose }: OtSheetDetailProps) {
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!orden) return null;

  const handleComentario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    startTransition(async () => {
      const res = await agregarComentarioAction(orden.id, nuevoComentario.trim());
      if (res.ok) {
        toast.success("Comentario agregado");
        setNuevoComentario("");
      } else {
        toast.error("Error al agregar comentario");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in-50 duration-200">
      <div className="w-full max-w-xl bg-card border-l border-border/80 h-full flex flex-col shadow-2xl animate-in slide-in-from-right-10 duration-200">
        {/* Cabecera del Sheet */}
        <div className="p-6 border-b border-border/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-xl text-foreground">
              {orden.codigo}
            </span>
            <OtSemaphore fechaEntrega={orden.fecha_entrega} />
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl h-9 text-xs font-semibold border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-300 bg-violet-50/50 dark:bg-violet-950/30 hover:bg-violet-100">
              <Link href={`/ordenes/${orden.codigo}/mockup`}>
                <Box className="h-3.5 w-3.5 mr-1 text-violet-600" />
                <span>Mockup 3D</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl h-9 text-xs">
              <Link href={`/ordenes/${orden.codigo}`}>
                <span>Ficha</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Sheet con Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Título y Cliente */}
          <div>
            <h3 className="font-bold text-xl text-foreground">
              {orden.titulo}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Cliente:{" "}
              <strong className="text-foreground">
                {orden.cliente.empresa || orden.cliente.nombre}
              </strong>{" "}
              {orden.cliente.telefono && `(${orden.cliente.telefono})`}
            </p>
          </div>

          {/* Stepper de Ruta */}
          {orden.etapas && orden.etapas.length > 0 && (
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Ruta de Producción
              </span>
              <OtStepper etapas={orden.etapas} />
            </div>
          )}

          {/* Ficha Técnica Rápida */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Especificaciones de Producción
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Tiraje:</span>
                <span className="font-bold text-foreground tabular-nums text-sm">
                  {orden.cantidad.toLocaleString("es-ES")} unidades
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Tipo de Trabajo:</span>
                <span className="font-bold text-foreground">{orden.tipo_trabajo.nombre}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Material / Sustrato:</span>
                <span className="font-medium text-foreground">{orden.material || "No indicado"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Medidas:</span>
                <span className="font-medium text-foreground">{orden.medidas || "No indicadas"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Tintas:</span>
                <span className="font-medium text-foreground">{orden.tintas || "No indicadas"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Acabados:</span>
                <span className="font-medium text-foreground">{orden.acabados || "Estándar"}</span>
              </div>
            </div>
          </div>

          {/* Línea de tiempo rápida */}
          {orden.eventos && orden.eventos.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Historial de Eventos
              </h4>
              <TimelineFeed eventos={orden.eventos.slice(0, 5)} />
            </div>
          )}

          {/* Comentarios */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Comentarios y Notas de Área
            </h4>

            {orden.comentarios && orden.comentarios.length > 0 ? (
              <div className="space-y-2">
                {orden.comentarios.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs">
                    <p className="text-foreground leading-relaxed">{c.texto}</p>
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      {new Date(c.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Sin notas ni comentarios todavía.
              </p>
            )}

            {/* Formulario de comentario rápido */}
            <form onSubmit={handleComentario} className="flex gap-2 pt-2">
              <Input
                placeholder="Escribe una observación para los operadores..."
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" size="sm" disabled={isPending || !nuevoComentario.trim()} className="rounded-xl px-3">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { EventoOrdenRow } from "@/types/database";
import { formatFechaHora, formatTiempoRelativo } from "@/lib/utils";
import {
  FileText,
  Play,
  Pause,
  RotateCw,
  Check,
  CheckCheck,
  MessageSquare,
} from "lucide-react";

interface TimelineFeedProps {
  eventos: EventoOrdenRow[];
}

export function TimelineFeed({ eventos }: TimelineFeedProps) {
  if (!eventos || eventos.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No hay eventos registrados para esta orden.
      </div>
    );
  }

  const getTipoInfo = (tipo: string, detalle: Record<string, unknown>) => {
    switch (tipo) {
      case "creada":
        return {
          icon: FileText,
          color: "bg-blue-500 text-white",
          titulo: "Orden Creada e Ingresada al Sistema",
          desc: `Título: ${detalle.titulo || ""} • Cantidad: ${detalle.cantidad || ""}`,
        };
      case "iniciada":
        return {
          icon: Play,
          color: "bg-primary text-white",
          titulo: `Etapa iniciada: ${detalle.area || "Área"}`,
          desc: "Trabajo en proceso en estación de producción",
        };
      case "pausada":
        return {
          icon: Pause,
          color: "bg-amber-500 text-white",
          titulo: `Pausada en ${detalle.area || "Área"}`,
          desc: `Motivo: ${detalle.motivo || "Sin especificar"} ${detalle.nota ? `(${detalle.nota})` : ""}`,
        };
      case "reanudada":
        return {
          icon: RotateCw,
          color: "bg-blue-600 text-white",
          titulo: `Reanudada en ${detalle.area || "Área"}`,
          desc: "El operador reanudó la actividad",
        };
      case "terminada":
        return {
          icon: Check,
          color: "bg-emerald-600 text-white",
          titulo: `Etapa completada: ${detalle.area || "Área"}`,
          desc: `Tiempo empleado: ${detalle.minutos_trabajados || 0} min`,
        };
      case "entregada":
        return {
          icon: CheckCheck,
          color: "bg-emerald-700 text-white",
          titulo: "Orden Entregada al Cliente",
          desc: `Retirado por: ${detalle.entregada_a || "Cliente"}`,
        };
      case "comentario":
        return {
          icon: MessageSquare,
          color: "bg-slate-500 text-white",
          titulo: "Nota / Comentario agregado",
          desc: String(detalle.texto || ""),
        };
      default:
        return {
          icon: FileText,
          color: "bg-muted-foreground text-white",
          titulo: `Evento: ${tipo}`,
          desc: "",
        };
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/80">
      {eventos.map((evento) => {
        const info = getTipoInfo(evento.tipo, (evento.detalle || {}) as Record<string, unknown>);
        const IconComp = info.icon;

        return (
          <div key={evento.id} className="relative flex items-start gap-4 group">
            {/* Nodo icono */}
            <div
              className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full shadow-sm ring-4 ring-background ${info.color}`}
            >
              <IconComp className="h-3 w-3" />
            </div>

            {/* Contenido del Evento */}
            <div className="flex-1 rounded-xl border border-border/60 bg-muted/20 p-3.5 transition-[background-color,border-color] duration-150 ease-[var(--ease-out)] group-hover:bg-muted/40">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs sm:text-sm text-foreground">
                  {info.titulo}
                </span>
                <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                  {formatTiempoRelativo(evento.created_at)}
                </span>
              </div>
              {info.desc && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {info.desc}
                </p>
              )}
              <div className="text-[11px] text-muted-foreground/70 mt-1.5 font-mono">
                {formatFechaHora(evento.created_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

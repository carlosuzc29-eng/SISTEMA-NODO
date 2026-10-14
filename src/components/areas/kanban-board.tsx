"use client";

import React, { useState, useTransition } from "react";
import { AreaRow, OrdenEtapaRow, MotivoPausaRow, PrioridadOT } from "@/types/database";
import { OrdenConRelaciones } from "@/features/ordenes/actions";
import { OtCard } from "@/components/ordenes/ot-card";
import { PausaModal } from "./pausa-modal";
import { OtSheetDetail } from "./ot-sheet-detail";
import {
  iniciarEtapaAction,
  pausarEtapaAction,
  reanudarEtapaAction,
  terminarEtapaAction,
} from "@/features/etapas/actions";
import { toast } from "sonner";
import { Clock, Play, Pause, CheckCircle, PackageOpen } from "lucide-react";

interface KanbanBoardProps {
  area: AreaRow;
  ordenesConEtapas: { orden: OrdenConRelaciones; etapa: OrdenEtapaRow }[];
  motivosPausa: MotivoPausaRow[];
}

export function KanbanBoard({
  area,
  ordenesConEtapas,
  motivosPausa,
}: KanbanBoardProps) {
  const [isPending, startTransition] = useTransition();
  const [modalPausaEtapaId, setModalPausaEtapaId] = useState<string | null>(null);
  const [sheetOrden, setSheetOrden] = useState<OrdenConRelaciones | null>(null);

  // Ordenar tarjetas por prioridad (urgente primero) y luego fecha de entrega
  const sortCards = (
    a: { orden: OrdenConRelaciones; etapa: OrdenEtapaRow },
    b: { orden: OrdenConRelaciones; etapa: OrdenEtapaRow }
  ) => {
    const priorityWeight: Record<PrioridadOT, number> = {
      urgente: 4,
      alta: 3,
      normal: 2,
      baja: 1,
    };
    const diffPriority = priorityWeight[b.orden.prioridad] - priorityWeight[a.orden.prioridad];
    if (diffPriority !== 0) return diffPriority;
    return new Date(a.orden.fecha_entrega).getTime() - new Date(b.orden.fecha_entrega).getTime();
  };

  const colCola = ordenesConEtapas.filter((item) => item.etapa.estado === "en_cola").sort(sortCards);
  const colProceso = ordenesConEtapas.filter((item) => item.etapa.estado === "en_proceso").sort(sortCards);
  const colPausadas = ordenesConEtapas.filter(
    (item) => item.etapa.estado === "pausada" || item.etapa.estado === "esperando_cliente"
  ).sort(sortCards);
  const colTerminadas = ordenesConEtapas.filter((item) => item.etapa.estado === "terminada").sort(sortCards);

  // Handlers para las acciones de etapa
  const handleIniciar = (etapaId: string) => {
    startTransition(async () => {
      const res = await iniciarEtapaAction(etapaId);
      if (res.ok) {
        toast.success("Trabajo iniciado en esta estación");
      } else {
        toast.error(res.error || "No se pudo iniciar el trabajo");
      }
    });
  };

  const handlePausar = (etapaId: string) => {
    setModalPausaEtapaId(etapaId);
  };

  const handleConfirmPausar = (motivoId: string, nota: string) => {
    if (!modalPausaEtapaId) return;
    const etapaId = modalPausaEtapaId;
    setModalPausaEtapaId(null);

    startTransition(async () => {
      const res = await pausarEtapaAction(etapaId, motivoId, nota);
      if (res.ok) {
        toast.warning("Trabajo pausado en esta estación");
      } else {
        toast.error(res.error || "No se pudo pausar");
      }
    });
  };

  const handleReanudar = (etapaId: string) => {
    startTransition(async () => {
      const res = await reanudarEtapaAction(etapaId);
      if (res.ok) {
        toast.info("Trabajo reanudado exitosamente");
      } else {
        toast.error(res.error || "No se pudo reanudar");
      }
    });
  };

  const handleTerminar = (etapaId: string) => {
    startTransition(async () => {
      const res = await terminarEtapaAction(etapaId);
      if (res.ok) {
        if (res.esFinal) {
          toast.success("¡Última etapa completada! La orden pasó a Lista para Entrega 🎉");
        } else {
          toast.success("Etapa completada. La orden avanzó a la siguiente estación 🚀");
        }
      } else {
        toast.error(res.error || "No se pudo terminar la etapa");
      }
    });
  };

  const columnas = [
    {
      id: "cola",
      titulo: "En Cola",
      icono: Clock,
      color: "text-muted-foreground",
      badgeColor: "bg-muted text-muted-foreground",
      items: colCola,
    },
    {
      id: "proceso",
      titulo: "En Proceso",
      icono: Play,
      color: "text-primary",
      badgeColor: "bg-primary/10 text-primary border border-primary/20",
      items: colProceso,
    },
    {
      id: "pausadas",
      titulo: area.requiere_aprobacion_cliente
        ? "Pausadas / Esperando Cliente"
        : "Pausadas",
      icono: Pause,
      color: "text-amber-500",
      badgeColor: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
      items: colPausadas,
    },
    {
      id: "terminadas",
      titulo: "Terminadas Hoy",
      icono: CheckCircle,
      color: "text-emerald-500",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
      items: colTerminadas,
    },
  ];

  return (
    <>
      {/* Tablero Kanban de 4 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start">
        {columnas.map((col) => {
          const Icon = col.icono;

          return (
            <div
              key={col.id}
              className="rounded-xl border border-border/80 bg-card/50 backdrop-blur-sm p-3 flex flex-col gap-2.5 min-h-[540px]"
            >
              {/* Encabezado fijo de Columna */}
              <div className="sticky top-0 z-10 flex items-center justify-between pb-2 pt-0.5 bg-card/90 backdrop-blur-md border-b border-border/60">
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 ${col.color}`} />
                  <span className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
                    {col.titulo}
                  </span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.2 rounded-md font-mono font-bold tabular-nums ${col.badgeColor}`}
                >
                  {col.items.length}
                </span>
              </div>

              {/* Lista de Tarjetas o Estado Vacío */}
              <div className="flex flex-col gap-2 flex-1">
                {col.items.length > 0 ? (
                  col.items.map(({ orden, etapa }) => (
                    <OtCard
                      key={etapa.id}
                      orden={orden}
                      etapaActual={etapa}
                      onIniciar={handleIniciar}
                      onPausar={handlePausar}
                      onReanudar={handleReanudar}
                      onTerminar={handleTerminar}
                      onSelect={(o) => setSheetOrden(o)}
                      isActionPending={isPending}
                    />
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-5 rounded-lg border border-dashed border-border/60 bg-muted/20">
                    <PackageOpen className="h-7 w-7 text-muted-foreground/40 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-medium text-foreground">
                      Sin órdenes {col.titulo.toLowerCase()}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[160px] leading-relaxed">
                      {col.id === "cola"
                        ? "Aparecerán automáticamente aquí al ser asignadas a esta área."
                        : "No hay trabajos en este estado actualmente."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Pausa */}
      <PausaModal
        isOpen={!!modalPausaEtapaId}
        onClose={() => setModalPausaEtapaId(null)}
        motivos={motivosPausa}
        onConfirm={handleConfirmPausar}
        isPending={isPending}
      />

      {/* Panel lateral deslizante con detalle */}
      <OtSheetDetail
        orden={sheetOrden}
        onClose={() => setSheetOrden(null)}
      />
    </>
  );
}

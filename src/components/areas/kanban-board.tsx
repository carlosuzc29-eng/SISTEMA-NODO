"use client";

import React, { useState, useTransition } from "react";
import { AreaRow, OrdenEtapaRow, MotivoPausaRow, PrioridadOT, ProveedorRow } from "@/types/database";
import { OrdenConRelaciones } from "@/features/ordenes/actions";
import { OtCard } from "@/components/ordenes/ot-card";
import { PausaModal } from "./pausa-modal";
import { SecadoModal } from "./secado-modal";
import { ProveedorModal } from "./proveedor-modal";
import { RechazoModal } from "./rechazo-modal";
import { OmitirModal } from "./omitir-modal";
import { OtSheetDetail } from "./ot-sheet-detail";
import {
  iniciarEtapaAction,
  pausarEtapaAction,
  reanudarEtapaAction,
  terminarEtapaAction,
  iniciarSecadoAction,
  enviarAProveedorAction,
  recibirDeProveedorAction,
  aprobarCalidadAction,
  rechazarCalidadAction,
  omitirEtapaAction,
} from "@/features/etapas/actions";
import { toast } from "sonner";
import { Clock, Play, Pause, CheckCircle, PackageOpen } from "lucide-react";
import { getEstadoEtapaMetadata } from "@/config/estados";
import { isToday } from "date-fns";

interface KanbanBoardProps {
  area: AreaRow;
  ordenesConEtapas: { orden: OrdenConRelaciones; etapa: OrdenEtapaRow }[];
  motivosPausa: MotivoPausaRow[];
  proveedores?: ProveedorRow[];
  todasLasAreas?: AreaRow[];
}

export function KanbanBoard({
  area,
  ordenesConEtapas,
  motivosPausa,
  proveedores = [],
  todasLasAreas = [],
}: KanbanBoardProps) {
  const [isPending, startTransition] = useTransition();

  // Estados para los modales de acción
  const [modalPausaEtapaId, setModalPausaEtapaId] = useState<string | null>(null);
  const [modalSecadoEtapaId, setModalSecadoEtapaId] = useState<string | null>(null);
  const [modalProveedorEtapaId, setModalProveedorEtapaId] = useState<string | null>(null);
  const [modalRechazo, setModalRechazo] = useState<{
    orden: OrdenConRelaciones;
    etapa: OrdenEtapaRow;
  } | null>(null);
  const [modalOmitirEtapaId, setModalOmitirEtapaId] = useState<string | null>(null);

  // Detalle deslizante
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
  const colEspera = ordenesConEtapas
    .filter((item) => getEstadoEtapaMetadata(item.etapa.estado).esEnEspera)
    .sort(sortCards);
  const colTerminadas = ordenesConEtapas
    .filter((item) => {
      if (item.etapa.estado !== "terminada") return false;
      if (!item.etapa.terminada_en) return true;
      return isToday(new Date(item.etapa.terminada_en));
    })
    .sort(sortCards);

  // Handlers para las acciones
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
          toast.success("¡Última etapa completada! La orden pasó a Lista para Despacho 🎉");
        } else {
          toast.success("Etapa completada. La orden avanzó a la siguiente estación 🚀");
        }
      } else {
        toast.error(res.error || "No se pudo terminar la etapa");
      }
    });
  };

  // SECADO
  const handleIniciarSecado = (etapaId: string) => {
    setModalSecadoEtapaId(etapaId);
  };

  const handleConfirmSecado = (horas: number, notas: string) => {
    if (!modalSecadoEtapaId) return;
    const etapaId = modalSecadoEtapaId;
    setModalSecadoEtapaId(null);

    startTransition(async () => {
      const res = await iniciarSecadoAction(etapaId, horas, notas);
      if (res.ok) {
        toast.info(`Secado iniciado (${horas}h estimadas). Orden en espera.`);
      } else {
        toast.error(res.error || "No se pudo iniciar el secado");
      }
    });
  };

  // PROVEEDOR
  const handleEnviarProveedor = (etapaId: string) => {
    setModalProveedorEtapaId(etapaId);
  };

  const handleConfirmProveedor = (
    proveedorId: string,
    fechaEstimada: string,
    notas: string
  ) => {
    if (!modalProveedorEtapaId) return;
    const etapaId = modalProveedorEtapaId;
    setModalProveedorEtapaId(null);

    startTransition(async () => {
      const res = await enviarAProveedorAction(etapaId, proveedorId, fechaEstimada, notas);
      if (res.ok) {
        toast.info("Orden enviada a taller externo. En espera de retorno.");
      } else {
        toast.error(res.error || "No se pudo registrar el envío");
      }
    });
  };

  const handleRecibirProveedor = (etapaId: string) => {
    startTransition(async () => {
      const res = await recibirDeProveedorAction(etapaId);
      if (res.ok) {
        toast.success("Trabajo recibido de proveedor externo y listo para procesar.");
      } else {
        toast.error(res.error || "No se pudo registrar la recepción");
      }
    });
  };

  // CONTROL DE CALIDAD
  const handleAprobarCalidad = (etapaId: string) => {
    startTransition(async () => {
      const res = await aprobarCalidadAction(etapaId);
      if (res.ok) {
        toast.success("¡Control de calidad APROBADO! La orden avanzó.");
      } else {
        toast.error(res.error || "No se pudo aprobar el control de calidad");
      }
    });
  };

  const handleRechazarCalidad = (etapaId: string) => {
    const found = ordenesConEtapas.find((o) => o.etapa.id === etapaId);
    if (found) {
      setModalRechazo(found);
    }
  };

  const handleConfirmRechazo = (
    areaDestinoId: string,
    motivo: string,
    cantidadAfectada?: number | null
  ) => {
    if (!modalRechazo) return;
    const etapaId = modalRechazo.etapa.id;
    setModalRechazo(null);

    startTransition(async () => {
      const res = await rechazarCalidadAction(
        etapaId,
        areaDestinoId,
        motivo,
        cantidadAfectada
      );
      if (res.ok) {
        toast.error("Rechazo registrado. La orden ha regresado al área de reproceso.");
      } else {
        toast.error(res.error || "No se pudo registrar el rechazo");
      }
    });
  };

  // OMITIR
  const handleOmitir = (etapaId: string) => {
    setModalOmitirEtapaId(etapaId);
  };

  const handleConfirmOmitir = (motivo: string) => {
    if (!modalOmitirEtapaId) return;
    const etapaId = modalOmitirEtapaId;
    setModalOmitirEtapaId(null);

    startTransition(async () => {
      const res = await omitirEtapaAction(etapaId, motivo);
      if (res.ok) {
        toast.info("Estación condicional omitida. La orden avanzó.");
      } else {
        toast.error(res.error || "No se pudo omitir la estación");
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
      id: "espera",
      titulo: "En Espera",
      icono: Pause,
      color: "text-amber-500",
      badgeColor: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
      items: colEspera,
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
                      areaConfig={area}
                      proveedores={proveedores}
                      onIniciar={handleIniciar}
                      onPausar={handlePausar}
                      onReanudar={handleReanudar}
                      onTerminar={handleTerminar}
                      onIniciarSecado={handleIniciarSecado}
                      onEnviarProveedor={handleEnviarProveedor}
                      onRecibirProveedor={handleRecibirProveedor}
                      onAprobarCalidad={handleAprobarCalidad}
                      onRechazarCalidad={handleRechazarCalidad}
                      onOmitir={handleOmitir}
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

      {/* Modal de Secado */}
      <SecadoModal
        isOpen={!!modalSecadoEtapaId}
        onClose={() => setModalSecadoEtapaId(null)}
        onConfirm={handleConfirmSecado}
        isPending={isPending}
      />

      {/* Modal de Proveedor */}
      <ProveedorModal
        isOpen={!!modalProveedorEtapaId}
        onClose={() => setModalProveedorEtapaId(null)}
        proveedores={proveedores}
        onConfirm={handleConfirmProveedor}
        isPending={isPending}
      />

      {/* Modal de Rechazo en QC */}
      {modalRechazo && (
        <RechazoModal
          isOpen={!!modalRechazo}
          onClose={() => setModalRechazo(null)}
          orden={modalRechazo.orden}
          etapaActual={modalRechazo.etapa}
          areasDisponibles={todasLasAreas}
          onConfirm={handleConfirmRechazo}
          isPending={isPending}
        />
      )}

      {/* Modal de Omisión */}
      <OmitirModal
        isOpen={!!modalOmitirEtapaId}
        onClose={() => setModalOmitirEtapaId(null)}
        nombreArea={area.nombre}
        onConfirm={handleConfirmOmitir}
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

"use server";

import { obtenerOrdenes, OrdenConRelaciones } from "@/features/ordenes/actions";
import { obtenerAreas } from "@/features/tipos-trabajo/actions";
import { mockStore } from "@/lib/mock-store";
import { AreaRow, EventoOrdenRow } from "@/types/database";

export type FlowAreaMetric = {
  area: AreaRow;
  enCola: number;
  enProceso: number;
  pausadas: number;
  totalActivas: number;
  esCuelloBotella: boolean;
};

export type DashboardData = {
  kpis: {
    activas: number;
    listasEntrega: number;
    atrasadas: number;
    esperandoAprobacion: number;
    entregadasEstaSemana: number;
  };
  flujoAreas: FlowAreaMetric[];
  listasParaEntrega: OrdenConRelaciones[];
  proximasOVencidas: OrdenConRelaciones[];
  actividadReciente: EventoOrdenRow[];
};

export async function obtenerDashboardData(): Promise<DashboardData> {
  const [todasOrdenes, areas] = await Promise.all([
    obtenerOrdenes(),
    obtenerAreas(),
  ]);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // 1. Filtrar métricas de órdenes
  const activas = todasOrdenes.filter((o) => o.estado === "en_produccion");
  const listasEntrega = todasOrdenes.filter((o) => o.estado === "lista_entrega");

  let atrasadas = 0;
  activas.forEach((o) => {
    const fEntrega = new Date(o.fecha_entrega);
    if (fEntrega < hoy) atrasadas++;
  });

  // OTs esperando cliente (etapa actual pausada con motivo de aprobación o estado esperando_cliente)
  const esperandoAprobacion = 0; // Se enriquece con etapas

  // 2. Calcular flujo por áreas y cuellos de botella
  let maxCarga = 0;
  const flujoPre = areas.map((area) => {
    let enCola = 0;
    let enProceso = 0;
    let pausadas = 0;

    // Consultar etapas activas del store
    const etapasArea = mockStore.etapas.filter((e) => e.area_id === area.id);
    etapasArea.forEach((e) => {
      if (e.estado === "en_cola") enCola++;
      else if (e.estado === "en_proceso") enProceso++;
      else if (e.estado === "pausada" || e.estado === "esperando_cliente") pausadas++;
    });

    const totalActivas = enCola + enProceso + pausadas;
    if (totalActivas > maxCarga) maxCarga = totalActivas;

    return {
      area,
      enCola,
      enProceso,
      pausadas,
      totalActivas,
      esCuelloBotella: false,
    };
  });

  const flujoAreas: FlowAreaMetric[] = flujoPre.map((f) => ({
    ...f,
    esCuelloBotella: maxCarga > 0 && f.totalActivas === maxCarga && maxCarga >= 2,
  }));

  // 3. Próximas a vencer o atrasadas
  const proximasOVencidas = [...activas].sort((a, b) => {
    return new Date(a.fecha_entrega).getTime() - new Date(b.fecha_entrega).getTime();
  });

  // 4. Actividad reciente
  const actividadReciente = [...mockStore.eventos].slice(0, 10);

  return {
    kpis: {
      activas: activas.length,
      listasEntrega: listasEntrega.length,
      atrasadas,
      esperandoAprobacion,
      entregadasEstaSemana: todasOrdenes.filter((o) => o.estado === "entregada").length,
    },
    flujoAreas,
    listasParaEntrega: listasEntrega,
    proximasOVencidas: proximasOVencidas.slice(0, 6),
    actividadReciente,
  };
}

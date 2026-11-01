"use server";

import { obtenerOrdenes, OrdenConRelaciones } from "@/features/ordenes/actions";
import { obtenerAreas } from "@/features/tipos-trabajo/actions";
import { mockStore } from "@/lib/mock-store";
import { AreaRow, EventoOrdenRow } from "@/types/database";
import { normalizarEstadoOt, getEstadoEtapaMetadata } from "@/config/estados";

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
    enPuerta: number;
    listasDespacho: number;
    listasEntrega: number; // alias retrocompatibilidad
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
  const enPuerta = todasOrdenes.filter((o) => normalizarEstadoOt(o.estado) === "en_puerta");
  const activas = todasOrdenes.filter((o) => normalizarEstadoOt(o.estado) === "en_produccion");
  const listasDespacho = todasOrdenes.filter((o) => normalizarEstadoOt(o.estado) === "lista_despacho");
  const despachadas = todasOrdenes.filter((o) => normalizarEstadoOt(o.estado) === "despachada");

  let atrasadas = 0;
  activas.forEach((o) => {
    const fEntrega = new Date(o.fecha_entrega);
    if (fEntrega < hoy) atrasadas++;
  });

  // OTs esperando cliente
  const esperandoAprobacion = mockStore.aprobaciones.filter((a) => a.estado === "pendiente").length;

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
      else if (getEstadoEtapaMetadata(e.estado).esEnEspera) pausadas++;
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
      enPuerta: enPuerta.length,
      listasDespacho: listasDespacho.length,
      listasEntrega: listasDespacho.length,
      atrasadas,
      esperandoAprobacion,
      entregadasEstaSemana: despachadas.length,
    },
    flujoAreas,
    listasParaEntrega: listasDespacho,
    proximasOVencidas: proximasOVencidas.slice(0, 6),
    actividadReciente,
  };
}

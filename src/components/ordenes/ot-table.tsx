"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OrdenConRelaciones } from "@/features/ordenes/actions";
import { OtSemaphore } from "./ot-semaphore";
import { OtCard } from "./ot-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AreaRow, PrioridadOT, EstadoOT } from "@/types/database";
import {
  Search,
  Filter,
  Download,
  LayoutGrid,
  List,
  ArrowRight,
  ExternalLink,
  Layers,
  ChevronRight,
} from "lucide-react";

interface OtTableProps {
  ordenes: OrdenConRelaciones[];
  areas: AreaRow[];
}

export function OtTable({ ordenes, areas }: OtTableProps) {
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [filtroArea, setFiltroArea] = useState<string>("todas");
  const [vista, setVista] = useState<"tabla" | "tarjetas">("tabla");

  // Filtrado
  const ordenesFiltradas = ordenes.filter((o) => {
    if (filtroEstado !== "todas" && o.estado !== filtroEstado) return false;
    if (filtroPrioridad !== "todas" && o.prioridad !== filtroPrioridad) return false;
    if (filtroArea !== "todas" && o.area_actual_id !== filtroArea) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        o.codigo.toLowerCase().includes(q) ||
        o.titulo.toLowerCase().includes(q) ||
        o.cliente.nombre.toLowerCase().includes(q) ||
        (o.cliente.empresa && o.cliente.empresa.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const exportarCsv = () => {
    const headers = ["Codigo", "Titulo", "Cliente", "Empresa", "Cantidad", "Prioridad", "Estado", "Fecha Entrega"];
    const rows = ordenesFiltradas.map((o) => [
      o.codigo,
      `"${o.titulo.replace(/"/g, '""')}"`,
      `"${o.cliente.nombre.replace(/"/g, '""')}"`,
      `"${(o.cliente.empresa || "").replace(/"/g, '""')}"`,
      o.cantidad,
      o.prioridad,
      o.estado,
      o.fecha_entrega,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ordenes_produccion_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const estadoBadge: Record<EstadoOT, { label: string; className: string }> = {
    recibida: { label: "Recibida", className: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
    en_produccion: { label: "En Producción", className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20" },
    lista_entrega: { label: "Lista para Entrega", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
    entregada: { label: "Entregada", className: "bg-gray-500/15 text-gray-700 dark:text-gray-400" },
    cancelada: { label: "Cancelada", className: "bg-red-500/15 text-red-700 dark:text-red-400" },
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, trabajo o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-sm h-10 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="h-10 px-3 text-xs font-medium rounded-xl border border-input bg-background/80 text-foreground"
          >
            <option value="todas">Todos los estados</option>
            <option value="en_produccion">En Producción</option>
            <option value="lista_entrega">Listas para Entrega</option>
            <option value="entregada">Entregadas</option>
          </select>

          {/* Selector Prioridad */}
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="h-10 px-3 text-xs font-medium rounded-xl border border-input bg-background/80 text-foreground"
          >
            <option value="todas">Todas las prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="normal">Normal</option>
            <option value="baja">Baja</option>
          </select>

          {/* Selector Área */}
          <select
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
            className="h-10 px-3 text-xs font-medium rounded-xl border border-input bg-background/80 text-foreground"
          >
            <option value="todas">Todas las áreas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>

          {/* Botón Exportar CSV */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportarCsv}
            className="h-10 rounded-xl text-xs font-medium gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </Button>

          {/* Switcher Vista */}
          <div className="flex items-center rounded-xl border border-border/80 bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setVista("tabla")}
              className={`p-1.5 rounded-lg transition-all ${
                vista === "tabla" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setVista("tarjetas")}
              className={`p-1.5 rounded-lg transition-all ${
                vista === "tarjetas" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RESULTADOS: VISTA TABLA */}
      {vista === "tabla" ? (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border/80 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Trabajo</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4 text-right">Tiraje</th>
                  <th className="py-3.5 px-4">Estación Actual</th>
                  <th className="py-3.5 px-4">Entrega</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ordenesFiltradas.length > 0 ? (
                  ordenesFiltradas.map((o) => {
                    const infoEstado = estadoBadge[o.estado] || estadoBadge.recibida;

                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-accent/40 transition-colors group cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                          <Link href={`/ordenes/${o.codigo}`} className="hover:text-primary">
                            {o.codigo}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <Link href={`/ordenes/${o.codigo}`} className="block">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                              {o.titulo}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {o.tipo_trabajo.nombre}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-foreground block">
                            {o.cliente.empresa || o.cliente.nombre}
                          </span>
                          {o.cliente.empresa && (
                            <span className="text-[11px] text-muted-foreground">
                              {o.cliente.nombre}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums font-bold text-foreground">
                          {o.cantidad.toLocaleString("es-ES")}
                        </td>
                        <td className="py-3.5 px-4">
                          {o.area_actual ? (
                            <Badge
                              variant="outline"
                              className="font-medium text-[11px]"
                              style={{
                                borderColor: o.area_actual.color_hex,
                                color: o.area_actual.color_hex,
                              }}
                            >
                              <Layers className="h-3 w-3 mr-1" />
                              {o.area_actual.nombre}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <OtSemaphore fechaEntrega={o.fecha_entrega} />
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-medium ${infoEstado.className}`}
                          >
                            {infoEstado.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                            <Link href={`/ordenes/${o.codigo}`} title="Ver detalle">
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                      No se encontraron órdenes que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* RESULTADOS: VISTA TARJETAS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ordenesFiltradas.length > 0 ? (
            ordenesFiltradas.map((o) => (
              <OtCard key={o.id} orden={o} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
              No se encontraron órdenes.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

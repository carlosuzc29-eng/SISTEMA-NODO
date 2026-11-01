"use client";

import React, { useState } from "react";
import { OrdenConRelaciones } from "@/features/ordenes/actions";
import { DeliveryModal } from "@/components/dashboard/delivery-modal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Truck, CheckCheck, PackageCheck, ChevronRight, FileText, User } from "lucide-react";
import { formatFechaHora } from "@/lib/utils";

interface DespachosClientViewProps {
  listasParaDespacho: OrdenConRelaciones[];
  despachadas: OrdenConRelaciones[];
}

export function DespachosClientView({
  listasParaDespacho,
  despachadas,
}: DespachosClientViewProps) {
  const [ordenADespachar, setOrdenADespachar] = useState<OrdenConRelaciones | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300 pb-12">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Truck className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Muelle de Despachos y Salidas
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Control de órdenes listas para salida, retiro de clientes, transportistas y guías de remisión.
          </p>
        </div>
      </div>

      {/* SECCIÓN 1: COLA LISTA PARA DESPACHO */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <PackageCheck className="h-4 w-4 text-emerald-500" />
              Órdenes Listas para Despacho
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Trabajos embalados y aprobados por Control de Calidad que aguardan por transporte o cliente
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-mono font-bold tabular-nums text-xs">
            {listasParaDespacho.length} listas
          </Badge>
        </CardHeader>
        <CardContent>
          {listasParaDespacho.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {listasParaDespacho.map((orden) => (
                <div
                  key={orden.id}
                  data-testid="despacho-card"
                  data-codigo={orden.codigo}
                  className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-xs hover:border-[var(--color-registry-green)]/40 transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)] flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {orden.codigo}
                      </span>
                      <Badge variant="outline" className="text-[11px] font-mono font-semibold uppercase">
                        {orden.prioridad}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                        {orden.titulo}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        Cliente:{" "}
                        <strong className="text-foreground font-medium">
                          {orden.cliente.empresa || orden.cliente.nombre}
                        </strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <span>
                        Tiraje: <strong className="font-mono tabular-nums text-foreground">{orden.cantidad.toLocaleString("es-ES")} uds</strong>
                      </span>
                      <span className="text-[11px] truncate max-w-[120px]">{orden.tipo_trabajo.nombre}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setOrdenADespachar(orden)}
                      className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                    >
                      <Truck className="h-3.5 w-3.5 mr-1.5" />
                      <span>Registrar Despacho</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border border-dashed border-border/70 bg-muted/20">
              <PackageCheck className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">
                No hay órdenes pendientes de despacho
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Las órdenes terminadas en la estación de Embalaje aparecerán aquí automáticamente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECCIÓN 2: HISTORIAL DE DESPACHOS RECIENTES */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <CheckCheck className="h-4 w-4 text-primary" />
              Historial de Despachos Realizados
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Registro de trabajos despachados con firma de recepción y transportista
            </CardDescription>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {despachadas.length} despachos registrados
          </span>
        </CardHeader>
        <CardContent>
          {despachadas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-mono uppercase text-[11px] tracking-wider">
                    <th className="py-2.5 px-3">Código OT</th>
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">Recibido / Retirado por</th>
                    <th className="py-2.5 px-3">Guía</th>
                    <th className="py-2.5 px-3">Fecha y Hora</th>
                    <th className="py-2.5 px-3 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {despachadas.map((orden) => (
                    <tr
                      key={orden.id}
                      className="hover:bg-muted/40 transition-colors group font-sans"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-foreground">
                        {orden.codigo}
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground max-w-[200px] truncate">
                        {orden.titulo}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground truncate max-w-[150px]">
                        {orden.cliente.empresa || orden.cliente.nombre}
                      </td>
                      <td className="py-3 px-3 text-foreground font-medium flex items-center gap-1.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{orden.despachada_a || orden.entregada_a || "Retiro directo"}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground text-[11px]">
                        {orden.guia_despacho ? (
                          <span className="bg-muted px-1.5 py-0.5 rounded font-bold text-foreground">
                            {orden.guia_despacho}
                          </span>
                        ) : (
                          <span className="opacity-40">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground tabular-nums text-[11px]">
                        {orden.despachada_en || orden.entregada_en
                          ? formatFechaHora(orden.despachada_en || orden.entregada_en!)
                          : "Reciente"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg">
                          <Link href={`/ordenes/${orden.codigo}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground italic">
              No hay despachos registrados todavía.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Despacho */}
      <DeliveryModal
        orden={ordenADespachar}
        onClose={() => setOrdenADespachar(null)}
      />
    </div>
  );
}

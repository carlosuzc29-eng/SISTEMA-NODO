"use client";

import React, { useState } from "react";
import { OrdenConRelaciones } from "@/features/ordenes/actions";
import { DeliveryModal } from "@/components/dashboard/delivery-modal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Truck, CheckCheck, PackageCheck, ExternalLink, Calendar, ChevronRight } from "lucide-react";
import { formatFechaHora } from "@/lib/utils";

interface EntregasClientViewProps {
  listasParaEntrega: OrdenConRelaciones[];
  entregadas: OrdenConRelaciones[];
}

export function EntregasClientView({
  listasParaEntrega,
  entregadas,
}: EntregasClientViewProps) {
  const [ordenAEntregar, setOrdenAEntregar] = useState<OrdenConRelaciones | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Truck className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Despacho y Entregas
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión de retiro de trabajos terminados y registro de firmas o mensajería.
          </p>
        </div>
      </div>

      {/* SECCIÓN 1: LISTAS PARA RETIRO */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <PackageCheck className="h-5 w-5 text-emerald-600" />
              Órdenes Listas para Entrega
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Trabajos terminados en planta que aguardan por el cliente
            </CardDescription>
          </div>
          <Badge className="bg-emerald-600 text-white font-bold tabular-nums">
            {listasParaEntrega.length} listas
          </Badge>
        </CardHeader>
        <CardContent>
          {listasParaEntrega.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listasParaEntrega.map((orden) => (
                <div
                  key={orden.id}
                  className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-sm hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-foreground">
                      {orden.codigo}
                    </span>
                    <Badge variant="outline" className="text-xs font-semibold uppercase">
                      {orden.prioridad}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {orden.titulo}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cliente:{" "}
                      <strong className="text-foreground">
                        {orden.cliente.empresa || orden.cliente.nombre}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
                    <span>
                      Tiraje: <strong>{orden.cantidad.toLocaleString("es-ES")} uds</strong>
                    </span>
                    <span>{orden.tipo_trabajo.nombre}</span>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setOrdenAEntregar(orden)}
                      className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                    >
                      <CheckCheck className="h-4 w-4 mr-1.5" />
                      <span>Marcar como Entregada</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-muted-foreground italic border border-dashed rounded-xl border-border/60">
              No hay órdenes en lista de entrega en este momento.
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECCIÓN 2: HISTORIAL DE ENTREGAS */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CheckCheck className="h-4 w-4 text-primary" />
            Historial de Trabajos Entregados
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Registro de órdenes despachadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entregadas.length > 0 ? (
            <div className="divide-y divide-border/60">
              {entregadas.map((orden) => (
                <div
                  key={orden.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {orden.codigo}
                      </span>
                      <span className="font-semibold text-xs text-foreground">
                        {orden.titulo}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cliente: {orden.cliente.empresa || orden.cliente.nombre} •{" "}
                      {orden.cantidad.toLocaleString("es-ES")} uds
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right text-xs">
                      <span className="font-medium text-emerald-600 dark:text-emerald-400 block">
                        Retirado por: {orden.entregada_a || "Cliente"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatFechaHora(orden.entregada_en)}
                      </span>
                    </div>

                    <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                      <Link href={`/ordenes/${orden.codigo}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground italic">
              Aún no hay órdenes entregadas registradas.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Entrega */}
      <DeliveryModal
        orden={ordenAEntregar}
        onClose={() => setOrdenAEntregar(null)}
        onSuccess={() => setOrdenAEntregar(null)}
      />
    </div>
  );
}

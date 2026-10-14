"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PackagingCanvas } from "./packaging-canvas";
import { ApprovalModal } from "./approval-modal";
import { brand } from "@/config/brand";
import {
  MockupEmpaqueRow,
  AprobacionClienteRow,
  OrdenRow,
  ClienteRow,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Package,
  Layers,
  Sparkles,
  Calendar,
  FileCheck,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ClientApprovalViewProps {
  aprobacion: AprobacionClienteRow;
  orden: OrdenRow;
  mockup: MockupEmpaqueRow;
  cliente: ClienteRow;
}

export function ClientApprovalView({
  aprobacion: initialAprobacion,
  orden,
  mockup,
  cliente,
}: ClientApprovalViewProps) {
  const [aprobacion, setAprobacion] = useState(initialAprobacion);
  const [modalType, setModalType] = useState<"approve" | "reject" | null>(null);

  const isPending = aprobacion.estado === "pendiente";
  const isApproved = aprobacion.estado === "aprobado";
  const isRejected = aprobacion.estado === "cambios_solicitados";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Cabecera de marca con logo oficial NODO 26 */}
      <header className="sticky top-0 z-40 bg-card/85 backdrop-blur-xl border-b border-border/80 px-4 py-3 card-highlight">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center p-1.5 shadow-xs">
              <Image
                src="/brand/logo.svg"
                alt="NODO 26 Logo"
                width={24}
                height={24}
                className="w-6 h-6"
                priority
              />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5 font-mono">
                {brand.nombre}
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                  Aprobación Digital
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {orden.codigo} • {orden.titulo}
              </div>
            </div>
          </div>

          {/* Badge de estado actual */}
          <div>
            {isPending && (
              <Badge variant="warning" dot className="font-mono text-xs">
                Pendiente de Aprobación
              </Badge>
            )}
            {isApproved && (
              <Badge variant="success" dot className="font-mono text-xs">
                Arte Aprobado
              </Badge>
            )}
            {isRejected && (
              <Badge variant="destructive" dot className="font-mono text-xs">
                Cambios Solicitados
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Visor 3D Interactivo */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm card-highlight">
            <PackagingCanvas
              modeloTipo={mockup.modelo_tipo}
              anchoCm={Number(mockup.ancho_cm)}
              altoCm={Number(mockup.alto_cm)}
              profundidadCm={Number(mockup.profundidad_cm)}
              artTextureUrl={mockup.textura_arte_url}
              uvVarnish={mockup.acabado_barniz_uv}
              hotStamping={mockup.acabado_hot_stamping}
              emboss={mockup.acabado_relieve}
              className="w-full h-[380px] sm:h-[460px]"
            />
          </div>

          <p className="text-center text-[11px] text-muted-foreground font-mono flex items-center justify-center gap-2">
            <span>👆 Gira en 360° con el cursor o toque</span>
            <span>•</span>
            <span>📦 &quot;Abrir empaque&quot; para revisar solapas</span>
          </p>
        </div>

        {/* Columna Derecha: Especificaciones y Aprobación */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Mensaje de bienvenida */}
            <div className="bg-card rounded-xl p-4 sm:p-5 border border-border/80 shadow-xs card-highlight">
              <h1 className="text-sm font-semibold text-foreground mb-1">
                Hola, {cliente.nombre}
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Revisa el modelo tridimensional de tu producto. Verifica que los textos, colores, solapas y proporciones coincidan con tus especificaciones antes de iniciar la producción en máquina.
              </p>
            </div>

            {/* Ficha técnica resumida */}
            <div className="bg-card rounded-xl p-4 sm:p-5 border border-border/80 shadow-xs card-highlight space-y-3">
              <h2 className="label-caps text-muted-foreground flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" /> Especificaciones de Producción
              </h2>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
                  <div className="text-muted-foreground text-[10px] flex items-center gap-1 mb-0.5 label-caps">
                    <Package className="w-3 h-3" /> Cantidad
                  </div>
                  <div className="font-mono font-bold tabular-nums text-foreground">
                    {orden.cantidad.toLocaleString("es-ES")} uds
                  </div>
                </div>

                <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
                  <div className="text-muted-foreground text-[10px] flex items-center gap-1 mb-0.5 label-caps">
                    <Layers className="w-3 h-3" /> Dimensiones
                  </div>
                  <div className="font-mono font-bold tabular-nums text-foreground text-[11px]">
                    {mockup.ancho_cm} × {mockup.alto_cm} × {mockup.profundidad_cm} cm
                  </div>
                </div>

                <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
                  <div className="text-muted-foreground text-[10px] flex items-center gap-1 mb-0.5 label-caps">
                    <Sparkles className="w-3 h-3" /> Sustrato
                  </div>
                  <div className="font-medium text-foreground truncate text-[11px]">
                    {orden.material || "Cartulina 300g"}
                  </div>
                </div>

                <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
                  <div className="text-muted-foreground text-[10px] flex items-center gap-1 mb-0.5 label-caps">
                    <Calendar className="w-3 h-3" /> Entrega
                  </div>
                  <div className="font-medium text-foreground text-[11px]">
                    {format(new Date(orden.fecha_entrega), "dd 'de' MMMM", { locale: es })}
                  </div>
                </div>
              </div>

              {/* Acabados adicionales */}
              {(mockup.acabado_barniz_uv || mockup.acabado_hot_stamping !== "ninguno") && (
                <div className="pt-2 border-t border-border/50 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-muted-foreground">Acabados:</span>
                  {mockup.acabado_barniz_uv && (
                    <Badge variant="warning" className="text-[9px] font-mono py-0">
                      Barniz UV Sectorizado
                    </Badge>
                  )}
                  {mockup.acabado_hot_stamping !== "ninguno" && (
                    <Badge variant="warning" className="text-[9px] font-mono py-0">
                      Hot Stamping {mockup.acabado_hot_stamping.toUpperCase()}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Comprobante de Aprobación o Rechazo si ya fue procesado */}
            {isApproved && (
              <div className="bg-[var(--success-subtle)] border border-[var(--success)]/40 rounded-xl p-4 text-xs text-[var(--success)] space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" /> ¡Arte Aprobado con Éxito!
                </div>
                <p className="text-foreground/90 text-xs">
                  Confirmado por <strong>{aprobacion.aprobado_por_nombre}</strong>
                  {aprobacion.aprobado_por_cargo_dni && ` (${aprobacion.aprobado_por_cargo_dni})`}.
                </p>
                {aprobacion.fecha_respuesta && (
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Fecha: {format(new Date(aprobacion.fecha_respuesta), "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                )}
              </div>
            )}

            {isRejected && (
              <div className="bg-destructive-subtle border border-destructive/40 rounded-xl p-4 text-xs text-destructive space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <AlertCircle className="w-4 h-4 text-destructive" /> Correcciones Solicitadas
                </div>
                <p className="text-foreground/90 text-xs italic">
                  &quot;{aprobacion.comentarios_cliente}&quot;
                </p>
                <p className="text-[10px] text-muted-foreground">
                  El equipo de pre-prensa está trabajando en los ajustes solicitados.
                </p>
              </div>
            )}
          </div>

          {/* Botones de Acción para el Cliente */}
          {isPending && (
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                onClick={() => setModalType("approve")}
                className="w-full h-12 bg-[var(--success)] hover:opacity-90 text-[var(--success-foreground)] rounded-xl font-semibold text-sm shadow-xs gap-2 active:scale-[0.98] transition-[transform,opacity] duration-150 ease-[var(--ease-out)]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprobar Arte para Producción
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setModalType("reject")}
                className="w-full h-10 border-border/80 text-muted-foreground hover:text-foreground rounded-xl font-medium text-xs gap-1.5 active:scale-[0.98] transition-[transform,background-color] duration-150 ease-[var(--ease-out)]"
              >
                <AlertCircle className="w-3.5 h-3.5 text-[var(--warning)]" />
                Solicitar Ajustes o Cambios
              </Button>
            </div>
          )}

          {/* Enlace de contacto directo por WhatsApp */}
          <div className="pt-2 text-center">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hola ${brand.nombre}, tengo una consulta sobre mi pedido ${orden.codigo} (${orden.titulo})`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-[var(--success)] hover:underline font-mono"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              ¿Dudas con el arte? Contactar al diseñador
            </a>
          </div>
        </div>
      </main>

      {/* Modal de Aprobación / Rechazo */}
      {modalType && (
        <ApprovalModal
          isOpen={true}
          type={modalType}
          token={aprobacion.token}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            setAprobacion((prev) => ({
              ...prev,
              estado: modalType === "approve" ? "aprobado" : "cambios_solicitados",
              fecha_respuesta: new Date().toISOString(),
            }));
          }}
        />
      )}
    </div>
  );
}

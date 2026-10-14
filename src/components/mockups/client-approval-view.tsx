"use client";

import React, { useState } from "react";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Cabecera de marca con logo */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              N26
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                {brand.nombre}
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Aprobación Digital
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {orden.codigo} — {orden.titulo}
              </div>
            </div>
          </div>

          {/* Badge de estado actual */}
          <div>
            {isPending && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pendiente de Aprobación
              </span>
            )}
            {isApproved && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Arte Aprobado
              </span>
            )}
            {isRejected && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Cambios Solicitados
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Visor 3D Interactivo */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.18)]">
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

          <p className="text-center text-[12px] text-slate-500 flex items-center justify-center gap-2">
            <span>👆 Gira con tu dedo para ver 360°</span>
            <span>•</span>
            <span>📦 Pulsa &quot;Abrir empaque&quot; para ver la tapa</span>
          </p>
        </div>

        {/* Columna Derecha: Especificaciones y Aprobación */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Mensaje de bienvenida */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h1 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Hola, {cliente.nombre}
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Revisa el modelo tridimensional de tu producto. Verifica que los textos, colores, solapas y proporciones coincidan con tus expectativas antes de iniciar la producción en máquina.
              </p>
            </div>

            {/* Ficha técnica resumida */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" /> Especificaciones de Producción
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-0.5">
                    <Package className="w-3 h-3" /> Cantidad
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {orden.cantidad.toLocaleString("es-ES")} uds.
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-0.5">
                    <Layers className="w-3 h-3" /> Medidas (A x H x P)
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white font-mono">
                    {mockup.ancho_cm} × {mockup.alto_cm} × {mockup.profundidad_cm} cm
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-0.5">
                    <Sparkles className="w-3 h-3" /> Material
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {orden.material || "Cartulina plegadiza 300g"}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-0.5">
                    <Calendar className="w-3 h-3" /> Entrega Estimada
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {format(new Date(orden.fecha_entrega), "dd 'de' MMMM", { locale: es })}
                  </div>
                </div>
              </div>

              {/* Acabados adicionales */}
              {(mockup.acabado_barniz_uv || mockup.acabado_hot_stamping !== "ninguno") && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Acabados simulados:</span>
                  {mockup.acabado_barniz_uv && (
                    <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                      Barniz UV Sectorizado
                    </span>
                  )}
                  {mockup.acabado_hot_stamping !== "ninguno" && (
                    <span className="text-[10px] font-semibold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                      Hot Stamping {mockup.acabado_hot_stamping.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Comprobante de Aprobación o Rechazo si ya fue procesado */}
            {isApproved && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ¡Arte Aprobado con Éxito!
                </div>
                <p className="text-emerald-800 dark:text-emerald-300">
                  Confirmado por <strong>{aprobacion.aprobado_por_nombre}</strong>
                  {aprobacion.aprobado_por_cargo_dni && ` (${aprobacion.aprobado_por_cargo_dni})`}.
                </p>
                {aprobacion.fecha_respuesta && (
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                    Fecha: {format(new Date(aprobacion.fecha_respuesta), "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                )}
              </div>
            )}

            {isRejected && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> Correcciones Solicitadas
                </div>
                <p className="text-rose-800 dark:text-rose-300 italic">
                  &quot;{aprobacion.comentarios_cliente}&quot;
                </p>
                <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80">
                  El equipo de diseño está trabajando en los ajustes solicitados. Te enviaremos una nueva versión a la brevedad.
                </p>
              </div>
            )}
          </div>

          {/* Botones de Acción para el Cliente */}
          {isPending && (
            <div className="space-y-2.5 pt-2">
              <Button
                type="button"
                onClick={() => setModalType("approve")}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 gap-2 active:scale-[0.99] transition-transform"
              >
                <CheckCircle2 className="w-5 h-5" />
                Aprobar Arte para Impresión
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setModalType("reject")}
                className="w-full h-11 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-medium text-xs gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Solicitar Ajustes o Cambios
              </Button>
            </div>
          )}

          {/* Enlace de contacto directo por WhatsApp */}
          <div className="pt-2 text-center">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hola Nodo 26, tengo una consulta sobre mi pedido ${orden.codigo} (${orden.titulo})`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              ¿Dudas? Chatea directamente con nosotros por WhatsApp
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

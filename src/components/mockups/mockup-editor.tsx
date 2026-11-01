"use client";

import React, { useState } from "react";
import { PackagingCanvas } from "./packaging-canvas";
import {
  MockupEmpaqueRow,
  TipoModeloEmpaque,
  TipoHotStamping,
  OrdenRow,
  ClienteRow,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  guardarMockupAction,
  generarTokenAprobacionAction,
} from "@/features/mockups/actions";
import { generarEnlaceWhatsApp } from "@/features/mockups/utils-whatsapp";
import { toast } from "sonner";
import {
  Box,
  Sparkles,
  Link as LinkIcon,
  MessageCircle,
  Copy,
  ExternalLink,
  Upload,
  Save,
  Check,
} from "lucide-react";

interface MockupEditorProps {
  orden: OrdenRow;
  cliente: ClienteRow;
  initialMockup?: MockupEmpaqueRow | null;
  existingToken?: string | null;
}

export function MockupEditor({
  orden,
  cliente,
  initialMockup,
  existingToken,
}: MockupEditorProps) {
  const [modeloTipo, setModeloTipo] = useState<TipoModeloEmpaque>(
    initialMockup?.modelo_tipo || "caja_tuck_end"
  );
  const [anchoCm, setAnchoCm] = useState<number>(Number(initialMockup?.ancho_cm || 15));
  const [altoCm, setAltoCm] = useState<number>(Number(initialMockup?.alto_cm || 20));
  const [profundidadCm, setProfundidadCm] = useState<number>(
    Number(initialMockup?.profundidad_cm || 8)
  );
  const [uvVarnish, setUvVarnish] = useState<boolean>(
    initialMockup?.acabado_barniz_uv || false
  );
  const [hotStamping, setHotStamping] = useState<TipoHotStamping>(
    initialMockup?.acabado_hot_stamping || "ninguno"
  );
  const [emboss, setEmboss] = useState<boolean>(initialMockup?.acabado_relieve || false);
  const [artTextureUrl, setArtTextureUrl] = useState<string | null>(
    initialMockup?.textura_arte_url || null
  );

  const [activeToken, setActiveToken] = useState<string | null>(existingToken || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Manejador de subida de arte gráfico
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen válida (PNG, JPG o WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setArtTextureUrl(dataUrl);
      toast.success("Arte cargado en el visualizador 3D");
    };
    reader.readAsDataURL(file);
  };

  // Guardar configuración del mockup
  const handleGuardarMockup = async () => {
    setIsSaving(true);
    try {
      const res = await guardarMockupAction({
        orden_id: orden.id,
        modelo_tipo: modeloTipo,
        ancho_cm: Number(anchoCm),
        alto_cm: Number(altoCm),
        profundidad_cm: Number(profundidadCm),
        grosor_mm: 0.5,
        acabado_barniz_uv: uvVarnish,
        acabado_hot_stamping: hotStamping,
        acabado_relieve: emboss,
        textura_arte_url: artTextureUrl,
      });

      if (res.ok) {
        toast.success("Configuración 3D guardada exitosamente");
      } else {
        toast.error(res.error || "Error al guardar el mockup");
      }
    } catch {
      toast.error("Error inesperado al guardar el mockup");
    } finally {
      setIsSaving(false);
    }
  };

  // Generar token y link de aprobación
  const handleGenerarToken = async () => {
    setIsGeneratingToken(true);
    try {
      // 1. Guardar primero el mockup
      const saveRes = await guardarMockupAction({
        orden_id: orden.id,
        modelo_tipo: modeloTipo,
        ancho_cm: Number(anchoCm),
        alto_cm: Number(altoCm),
        profundidad_cm: Number(profundidadCm),
        grosor_mm: 0.5,
        acabado_barniz_uv: uvVarnish,
        acabado_hot_stamping: hotStamping,
        acabado_relieve: emboss,
        textura_arte_url: artTextureUrl,
      });

      if (!saveRes.ok || !saveRes.mockup) {
        toast.error("Error al preparar el mockup");
        return;
      }

      // 2. Generar token
      const res = await generarTokenAprobacionAction(orden.id, saveRes.mockup.id);
      if (res.ok && res.token) {
        setActiveToken(res.token);
        toast.success("¡Enlace de aprobación generado!");
      } else {
        toast.error(res.error || "No se pudo generar el token");
      }
    } catch {
      toast.error("Error al generar el enlace de aprobación");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const urlAprobacion = activeToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/aprobar/${activeToken}`
    : "";

  const copiarEnlace = () => {
    if (!urlAprobacion) return;
    navigator.clipboard.writeText(urlAprobacion);
    setIsCopied(true);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const whatsappLink = activeToken
    ? generarEnlaceWhatsApp({
        telefono: cliente.telefono,
        clienteNombre: cliente.nombre,
        codigoOrden: orden.codigo,
        tituloOrden: orden.titulo,
        tokenAprobacion: activeToken,
        baseUrl: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
      })
    : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Columna Izquierda: Visor 3D en tiempo real */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        <div className="rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.18)]">
          <PackagingCanvas
            modeloTipo={modeloTipo}
            anchoCm={Number(anchoCm)}
            altoCm={Number(altoCm)}
            profundidadCm={Number(profundidadCm)}
            artTextureUrl={artTextureUrl}
            uvVarnish={uvVarnish}
            hotStamping={hotStamping}
            emboss={emboss}
            className="w-full h-[400px] sm:h-[480px]"
          />
        </div>

        {/* Subida rápida de arte */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Textura del Arte del Cliente
              </div>
              <div className="text-[11px] text-slate-500">
                {artTextureUrl ? "Arte cargado sobre el modelo 3D" : "Sube un archivo PNG o JPG del diseño"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {artTextureUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setArtTextureUrl(null)}
                className="text-xs text-rose-500 hover:text-rose-600"
              >
                Quitar
              </Button>
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {artTextureUrl ? "Cambiar Arte" : "Subir Imagen"}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Parámetros del Empaque y Compartir */}
      <div className="lg:col-span-5 space-y-5">
        {/* Selector de Modelo y Medidas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5" /> Tipo de Empaque
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "caja_tuck_end", label: "Caja Estándar" },
              { id: "caja_pizza", label: "Caja Pizza" },
              { id: "bolsa_kraft", label: "Bolsa Kraft" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setModeloTipo(t.id as TipoModeloEmpaque)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-[background-color,border-color,color] duration-120 ease-[var(--ease-out)] text-center ${
                  modeloTipo === t.id
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Medidas paramétricas */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Ancho (cm)
              </label>
              <input
                type="number"
                step="0.5"
                min="3"
                max="80"
                value={anchoCm}
                onChange={(e) => setAnchoCm(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Alto (cm)
              </label>
              <input
                type="number"
                step="0.5"
                min="3"
                max="80"
                value={altoCm}
                onChange={(e) => setAltoCm(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Prof. (cm)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="50"
                value={profundidadCm}
                onChange={(e) => setProfundidadCm(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-center"
              />
            </div>
          </div>
        </div>

        {/* Acabados especiales simulados */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Acabados Especiales Simulados
          </h3>

          {/* Toggle Barniz UV */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Barniz UV Sectorizado
              </div>
              <div className="text-[11px] text-slate-500">
                Añade reflejo y brillo especular de estudio fotográfico
              </div>
            </div>
            <input
              type="checkbox"
              checked={uvVarnish}
              onChange={(e) => setUvVarnish(e.target.checked)}
              className="w-5 h-5 rounded-md text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
            />
          </div>

          {/* Toggle Relieve */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Relieve (Emboss)
              </div>
              <div className="text-[11px] text-slate-500">
                Levanta el marco del diseño; combinado con foil, lo realza
              </div>
            </div>
            <input
              type="checkbox"
              checked={emboss}
              onChange={(e) => setEmboss(e.target.checked)}
              className="w-5 h-5 rounded-md text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
            />
          </div>

          {/* Selector Hot Stamping */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Efecto Hot Stamping Metalizado
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "ninguno", label: "Ninguno", swatch: null },
                { id: "oro", label: "Oro", swatch: "linear-gradient(135deg,#fde68a,#d4a017 55%,#fff3c4)" },
                { id: "plata", label: "Plata", swatch: "linear-gradient(135deg,#f8fafc,#a8b0bb 55%,#ffffff)" },
                { id: "cobre", label: "Cobre", swatch: "linear-gradient(135deg,#fbc7a4,#b8653a 55%,#ffd9c0)" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setHotStamping(s.id as TipoHotStamping)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold border transition-colors text-center ${
                    hotStamping === s.id
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {s.swatch && (
                    <span
                      className="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10"
                      style={{ background: s.swatch }}
                    />
                  )}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGuardarMockup}
            disabled={isSaving}
            className="w-full text-xs font-semibold rounded-xl gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Guardando..." : "Guardar Ajustes 3D"}
          </Button>
        </div>

        {/* Módulo de Aprobación y WhatsApp */}
        <div className="bg-muted/30 rounded-2xl p-5 border border-border/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-primary" /> Aprobación del Cliente
            </h3>
            {activeToken && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-registry-green)]/15 text-[var(--color-registry-green)] border border-[var(--color-registry-green)]/30">
                Enlace Activo
              </span>
            )}
          </div>

          {!activeToken ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Genera un enlace público no adivinable para que el cliente revise su empaque 3D y confirme formalmente desde su teléfono.
              </p>
              <Button
                type="button"
                onClick={handleGenerarToken}
                disabled={isGeneratingToken}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold h-10 shadow-md shadow-violet-600/20 gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingToken ? "Generando Enlace..." : "Generar Enlace de Aprobación"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Caja de link para copiar */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={urlAprobacion}
                  className="flex-1 px-2 text-xs font-mono text-slate-600 dark:text-slate-300 bg-transparent focus:outline-none truncate"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                  onClick={copiarEnlace}
                  title="Copiar enlace"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
                <a
                  href={urlAprobacion}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  title="Abrir vista de cliente"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Botón directo de WhatsApp */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-[background-color,transform] duration-120 ease-[var(--ease-out)]"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                Enviar por WhatsApp al Cliente
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import { AreaRow, TipoTrabajoRow, MotivoPausaRow } from "@/types/database";
import { RouteBuilder } from "@/components/ordenes/route-builder";
import { crearTipoTrabajo } from "@/features/tipos-trabajo/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, Layers, Box, Pause, Users, Plus, Check, X, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface ConfiguracionClientViewProps {
  areas: AreaRow[];
  tiposTrabajo: TipoTrabajoRow[];
  motivosPausa: MotivoPausaRow[];
}

export function ConfiguracionClientView({
  areas,
  tiposTrabajo,
  motivosPausa,
}: ConfiguracionClientViewProps) {
  const [tabActiva, setTabActiva] = useState<"areas" | "tipos" | "motivos" | "usuarios">("areas");

  // Estado para crear tipo de trabajo con constructor de ruta
  const [modalTipoAbierto, setModalTipoAbierto] = useState(false);
  const [nombreTipo, setNombreTipo] = useState("");
  const [descTipo, setDescTipo] = useState("");
  const [rutaTipo, setRutaTipo] = useState<string[]>(areas.map((a) => a.id));
  const [isPending, startTransition] = useTransition();

  const handleCrearTipo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreTipo.trim()) return;

    startTransition(async () => {
      const res = await crearTipoTrabajo({
        nombre: nombreTipo.trim(),
        descripcion: descTipo.trim() || null,
        ruta: rutaTipo,
      });

      if (res.ok) {
        toast.success("Tipo de trabajo creado exitosamente");
        setModalTipoAbierto(false);
        setNombreTipo("");
        setDescTipo("");
      } else {
        toast.error(res.error || "No se pudo crear el tipo de trabajo");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Encabezado */}
      <div className="pb-2 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Settings className="h-4 w-4" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Configuración del Sistema
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Administración de estaciones de trabajo, rutas estándar de producción, catálogos y personal.
        </p>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {[
          { id: "areas", label: "Áreas de Producción", icon: Layers, count: areas.length },
          { id: "tipos", label: "Tipos de Trabajo y Rutas", icon: Box, count: tiposTrabajo.length },
          { id: "motivos", label: "Motivos de Pausa", icon: Pause, count: motivosPausa.length },
          { id: "usuarios", label: "Usuarios y Accesos", icon: Users, count: 7 },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = tabActiva === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTabActiva(t.id as "areas" | "tipos" | "motivos" | "usuarios")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-black/20 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ÁREAS */}
      {tabActiva === "areas" && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Áreas de Producción Configuradas</CardTitle>
            <CardDescription className="text-xs">
              Estaciones físicas de la imprenta. El orden numérico define la secuencia natural.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {areas.map((area, idx) => (
                <div
                  key={area.id}
                  className="p-4 rounded-xl border border-border/80 bg-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                      style={{ backgroundColor: area.color_hex }}
                    >
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {area.nombre}
                      </h4>
                      <span className="text-xs text-muted-foreground font-mono">
                        /area/{area.slug}
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    {area.requiere_aprobacion_cliente && (
                      <Badge variant="outline" className="text-[10px] block border-purple-500/40 text-purple-600">
                        Requiere Aprobación
                      </Badge>
                    )}
                    <Badge variant="success" className="text-[10px]">
                      Activa
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: TIPOS DE TRABAJO */}
      {tabActiva === "tipos" && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Catálogo de Tipos de Trabajo</CardTitle>
              <CardDescription className="text-xs">
                Plantillas de productos con sus rutas predeterminadas de áreas.
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setModalTipoAbierto(true)}
              className="rounded-xl font-semibold gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Tipo</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {tiposTrabajo.map((tipo) => (
                <div
                  key={tipo.id}
                  className="p-4 rounded-xl border border-border/80 bg-card space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-base text-foreground">
                        {tipo.nombre}
                      </h4>
                      {tipo.descripcion && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tipo.descripcion}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {tipo.ruta.length} estaciones
                    </Badge>
                  </div>

                  {/* Visualización de la Ruta */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {tipo.ruta.map((areaId, idx) => {
                      const area = areas.find((a) => a.id === areaId);
                      if (!area) return null;

                      return (
                        <React.Fragment key={`${tipo.id}-${areaId}-${idx}`}>
                          <Badge
                            className="text-[11px] text-white font-medium py-0.5"
                            style={{ backgroundColor: area.color_hex }}
                          >
                            {idx + 1}. {area.nombre}
                          </Badge>
                          {idx < tipo.ruta.length - 1 && (
                            <span className="text-xs text-muted-foreground">→</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: MOTIVOS DE PAUSA */}
      {tabActiva === "motivos" && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Motivos de Pausa Predefinidos</CardTitle>
            <CardDescription className="text-xs">
              Opciones que ven los operadores en el modal de pausa en tablets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {motivosPausa.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <span className="font-medium text-sm text-foreground">
                    {m.texto}
                  </span>
                  <Badge variant="outline" className="text-xs font-semibold text-emerald-600 border-emerald-500/30">
                    Activo
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: USUARIOS */}
      {tabActiva === "usuarios" && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Usuarios y Roles de Planta</CardTitle>
            <CardDescription className="text-xs">
              Accesos mediante usuario y PIN de 6 dígitos para PC y tablets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {[
                { usuario: "admin", nombre: "Administrador General", rol: "admin", area: "Todas" },
                { usuario: "recepcion", nombre: "Atención y Recepción", rol: "recepcion", area: "Todas" },
                { usuario: "supervisor", nombre: "Supervisor de Planta", rol: "supervisor", area: "Todas" },
                { usuario: "op_diseno", nombre: "Operador de Diseño", rol: "operador", area: "Diseño" },
                { usuario: "op_impresion", nombre: "Operador de Impresión", rol: "operador", area: "Impresión" },
                { usuario: "op_troquelado", nombre: "Operador de Troquelado", rol: "operador", area: "Troquelado" },
                { usuario: "op_corte", nombre: "Operador de Corte", rol: "operador", area: "Corte" },
              ].map((u) => (
                <div key={u.usuario} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {u.nombre}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        @{u.usuario}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground block">
                      Área asignada: <strong>{u.area}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="uppercase font-bold text-[10px]">
                      {u.rol}
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                      PIN: 123456
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para Crear Tipo de Trabajo */}
      {modalTipoAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="font-bold text-lg text-foreground">
                Nuevo Tipo de Trabajo
              </h3>
              <button
                type="button"
                onClick={() => setModalTipoAbierto(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearTipo} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Nombre del Tipo de Trabajo *
                </label>
                <Input
                  placeholder="Ej. Bolsa Kraft con Manija"
                  value={nombreTipo}
                  onChange={(e) => setNombreTipo(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Descripción
                </label>
                <Input
                  placeholder="Ej. Bolsa para boutiques y comercio con cordón de algodón"
                  value={descTipo}
                  onChange={(e) => setDescTipo(e.target.value)}
                />
              </div>

              {/* Constructor de Ruta */}
              <RouteBuilder
                todasLasAreas={areas}
                rutaSeleccionada={rutaTipo}
                onChange={setRutaTipo}
              />

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModalTipoAbierto(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending || !nombreTipo.trim() || rutaTipo.length === 0}>
                  Guardar Tipo de Trabajo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

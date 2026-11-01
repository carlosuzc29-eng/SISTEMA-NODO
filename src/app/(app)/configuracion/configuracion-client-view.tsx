"use client";

import React, { useState, useTransition } from "react";
import {
  AreaRow,
  TipoTrabajoRow,
  MotivoPausaRow,
  AcabadoRow,
  ProveedorRow,
  ProfileRow,
} from "@/types/database";
import { RouteBuilder } from "@/components/ordenes/route-builder";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Layers,
  Box,
  Pause,
  Users,
  Plus,
  X,
  Sparkles,
  Truck,
  Phone,
  Clock,
  Sliders,
  Building2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { crearTipoTrabajo } from "@/features/tipos-trabajo/actions";
import {
  actualizarAreaFlagsAction,
  asignarAreasUsuarioAction,
  crearAcabadoAction,
  actualizarAcabadoAction,
  crearProveedorAction,
  actualizarProveedorAction,
} from "@/features/ordenes/actions";

export type UsuarioConAreas = ProfileRow & {
  area?: AreaRow | null;
  areas_asignadas: AreaRow[];
};

interface ConfiguracionClientViewProps {
  areas: AreaRow[];
  tiposTrabajo: TipoTrabajoRow[];
  motivosPausa: MotivoPausaRow[];
  acabados: AcabadoRow[];
  proveedores: ProveedorRow[];
  usuariosConAreas: UsuarioConAreas[];
}

export function ConfiguracionClientView({
  areas: areasIniciales,
  tiposTrabajo,
  motivosPausa,
  acabados: acabadosIniciales,
  proveedores: proveedoresIniciales,
  usuariosConAreas: usuariosIniciales,
}: ConfiguracionClientViewProps) {
  const [tabActiva, setTabActiva] = useState<
    "areas" | "usuarios" | "acabados" | "proveedores" | "tipos" | "motivos"
  >("areas");

  // Estados locales optimistas
  const [areas, setAreas] = useState<AreaRow[]>(areasIniciales);
  const [acabados, setAcabados] = useState<AcabadoRow[]>(acabadosIniciales);
  const [proveedores, setProveedores] = useState<ProveedorRow[]>(proveedoresIniciales);
  const [usuarios, setUsuarios] = useState<UsuarioConAreas[]>(usuariosIniciales);

  // Modales
  const [modalTipoAbierto, setModalTipoAbierto] = useState(false);
  const [modalAcabadoAbierto, setModalAcabadoAbierto] = useState(false);
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);

  // Formulario Tipo de Trabajo
  const [nombreTipo, setNombreTipo] = useState("");
  const [descTipo, setDescTipo] = useState("");
  const [rutaTipo, setRutaTipo] = useState<string[]>(areas.map((a) => a.id));

  // Formulario Acabado
  const [nombreAcabado, setNombreAcabado] = useState("");

  // Formulario Proveedor
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [telefonoProveedor, setTelefonoProveedor] = useState("");
  const [tipoProveedor, setTipoProveedor] = useState<ProveedorRow["tipo"]>("otros");

  const [isPending, startTransition] = useTransition();

  // Handlers para Áreas
  const handleToggleAreaFlag = async (
    areaId: string,
    flag: "es_control_calidad" | "es_despacho" | "es_condicional" | "requiere_aprobacion_cliente",
    valorActual: boolean
  ) => {
    const nuevoValor = !valorActual;
    setAreas((prev) =>
      prev.map((a) => (a.id === areaId ? { ...a, [flag]: nuevoValor } : a))
    );

    const res = await actualizarAreaFlagsAction(areaId, { [flag]: nuevoValor });
    if (res.ok) {
      toast.success("Área actualizada correctamente");
    } else {
      toast.error(res.error || "Error al actualizar flag");
      // revert
      setAreas((prev) =>
        prev.map((a) => (a.id === areaId ? { ...a, [flag]: valorActual } : a))
      );
    }
  };

  const handleCambiarTipoEspera = async (areaId: string, nuevoTipo: AreaRow["tipo_espera"]) => {
    const areaAnterior = areas.find((a) => a.id === areaId);
    setAreas((prev) =>
      prev.map((a) => (a.id === areaId ? { ...a, tipo_espera: nuevoTipo } : a))
    );

    const res = await actualizarAreaFlagsAction(areaId, { tipo_espera: nuevoTipo });
    if (res.ok) {
      toast.success("Tipo de espera actualizado");
    } else {
      toast.error(res.error || "Error al actualizar tipo de espera");
      if (areaAnterior) {
        setAreas((prev) =>
          prev.map((a) => (a.id === areaId ? { ...a, tipo_espera: areaAnterior.tipo_espera } : a))
        );
      }
    }
  };

  // Handlers para Usuarios y Áreas
  const handleToggleUsuarioArea = async (usuarioId: string, areaId: string) => {
    const usuario = usuarios.find((u) => u.id === usuarioId);
    if (!usuario) return;

    const tieneArea = usuario.areas_asignadas.some((a) => a.id === areaId);
    const nuevasAreas = tieneArea
      ? usuario.areas_asignadas.filter((a) => a.id !== areaId)
      : [...usuario.areas_asignadas, areas.find((a) => a.id === areaId)!].filter(Boolean);

    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioId ? { ...u, areas_asignadas: nuevasAreas } : u))
    );

    const res = await asignarAreasUsuarioAction(
      usuarioId,
      nuevasAreas.map((a) => a.id)
    );

    if (res.ok) {
      toast.success(`Accesos actualizados para ${usuario.nombre_completo}`);
    } else {
      toast.error(res.error || "Error al guardar asignación de áreas");
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuarioId ? { ...u, areas_asignadas: usuario.areas_asignadas } : u))
      );
    }
  };

  // Handlers para Acabados
  const handleCrearAcabado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreAcabado.trim()) return;

    startTransition(async () => {
      const res = await crearAcabadoAction({ nombre: nombreAcabado.trim() });
      if (res.ok) {
        toast.success("Acabado creado exitosamente");
        const now = new Date().toISOString();
        setAcabados((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            nombre: nombreAcabado.trim(),
            activo: true,
            created_at: now,
            updated_at: now,
          },
        ]);
        setNombreAcabado("");
        setModalAcabadoAbierto(false);
      } else {
        toast.error(res.error || "No se pudo crear el acabado");
      }
    });
  };

  const handleToggleAcabado = async (id: string, activoActual: boolean) => {
    const nuevo = !activoActual;
    setAcabados((prev) => prev.map((a) => (a.id === id ? { ...a, activo: nuevo } : a)));
    const res = await actualizarAcabadoAction(id, { activo: nuevo });
    if (res.ok) {
      toast.success(nuevo ? "Acabado activado" : "Acabado desactivado");
    } else {
      toast.error(res.error || "Error al actualizar estado");
      setAcabados((prev) => prev.map((a) => (a.id === id ? { ...a, activo: activoActual } : a)));
    }
  };

  // Handlers para Proveedores
  const handleCrearProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreProveedor.trim()) return;

    startTransition(async () => {
      const res = await crearProveedorAction({
        nombre: nombreProveedor.trim(),
        telefono: telefonoProveedor.trim() || null,
        tipo: tipoProveedor,
      });

      if (res.ok) {
        toast.success("Proveedor agregado exitosamente");
        const now = new Date().toISOString();
        setProveedores((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            nombre: nombreProveedor.trim(),
            telefono: telefonoProveedor.trim() || null,
            tipo: tipoProveedor,
            activo: true,
            created_at: now,
            updated_at: now,
          },
        ]);
        setNombreProveedor("");
        setTelefonoProveedor("");
        setModalProveedorAbierto(false);
      } else {
        toast.error(res.error || "No se pudo crear el proveedor");
      }
    });
  };

  const handleToggleProveedor = async (id: string, activoActual: boolean) => {
    const nuevo = !activoActual;
    setProveedores((prev) => prev.map((p) => (p.id === id ? { ...p, activo: nuevo } : p)));
    const res = await actualizarProveedorAction(id, { activo: nuevo });
    if (res.ok) {
      toast.success(nuevo ? "Proveedor activado" : "Proveedor desactivado");
    } else {
      toast.error(res.error || "Error al actualizar proveedor");
      setProveedores((prev) => prev.map((p) => (p.id === id ? { ...p, activo: activoActual } : p)));
    }
  };

  // Handlers para Tipo de Trabajo
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
          Administración de estaciones de trabajo, operarios multi-área, catálogos externos y rutas de producción.
        </p>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {[
          { id: "areas", label: "Áreas de Producción", icon: Layers, count: areas.length },
          { id: "usuarios", label: "Usuarios y Accesos", icon: Users, count: usuarios.length },
          { id: "acabados", label: "Catálogo de Acabados", icon: Sparkles, count: acabados.length },
          { id: "proveedores", label: "Proveedores Externos", icon: Truck, count: proveedores.length },
          { id: "tipos", label: "Tipos de Trabajo y Rutas", icon: Box, count: tiposTrabajo.length },
          { id: "motivos", label: "Motivos de Pausa", icon: Pause, count: motivosPausa.length },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = tabActiva === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTabActiva(t.id as typeof tabActiva)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-[background-color,color,box-shadow] duration-150 ease-[var(--ease-out)] ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-black/20 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ÁREAS DE PRODUCCIÓN */}
      {tabActiva === "areas" && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg">11 Estaciones de Producción</CardTitle>
                <CardDescription className="text-xs">
                  Configuración dinámica de comportamientos por área (tiempos de secado, esperas, control de calidad y despachos).
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs w-fit">
                {areas.length} Áreas Activas
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {areas.map((area) => {
                const faseLabel =
                  area.fase === "pre_prensa"
                    ? "Pre-prensa"
                    : area.fase === "prensa"
                    ? "Prensa"
                    : "Post-prensa";

                const faseBadgeClass =
                  area.fase === "pre_prensa"
                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                    : area.fase === "prensa"
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";

                return (
                  <div
                    key={area.id}
                    className="p-4 rounded-xl border border-border/80 bg-card space-y-3.5 hover:border-primary/40 transition-colors"
                  >
                    {/* Header del Área */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm text-sm shrink-0"
                          style={{ backgroundColor: area.color_hex }}
                        >
                          {String(area.orden).padStart(2, "0")}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-foreground">
                              {area.nombre}
                            </h4>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${faseBadgeClass}`}>
                              {faseLabel}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            /area/{area.slug}
                          </span>
                        </div>
                      </div>

                      <Badge variant="success" className="text-[11px] shrink-0">
                        Orden #{area.orden}
                      </Badge>
                    </div>

                    {/* Selector de Tipo de Espera */}
                    <div className="pt-2 border-t border-border/60">
                      <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                        <Clock className="h-3 w-3" />
                        Tipo de Espera Asociada:
                      </label>
                      <select
                        aria-label={`Tipo de espera para ${area.nombre}`}
                        value={area.tipo_espera || "ninguna"}
                        onChange={(e) =>
                          handleCambiarTipoEspera(area.id, e.target.value as AreaRow["tipo_espera"])
                        }
                        className="w-full text-xs rounded-lg border border-input bg-background px-3 py-1.5 font-medium focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="ninguna">Sin espera automática (Ninguna)</option>
                        <option value="secado">Secado (Temporizador de 4 horas)</option>
                        <option value="proveedor_externo">Proveedor Externo (Salida / Retorno)</option>
                        <option value="cliente">Aprobación de Cliente</option>
                      </select>
                    </div>

                    {/* Flags / Switches */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border/60 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="font-medium text-foreground text-[11px]">Control Calidad</span>
                        <Switch
                          aria-label={`Control de calidad para ${area.nombre}`}
                          checked={area.es_control_calidad || false}
                          onCheckedChange={() =>
                            handleToggleAreaFlag(area.id, "es_control_calidad", area.es_control_calidad || false)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="font-medium text-foreground text-[11px]">Estación Despacho</span>
                        <Switch
                          aria-label={`Estación despacho para ${area.nombre}`}
                          checked={area.es_despacho || false}
                          onCheckedChange={() =>
                            handleToggleAreaFlag(area.id, "es_despacho", area.es_despacho || false)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="font-medium text-foreground text-[11px]">Paso Condicional</span>
                        <Switch
                          aria-label={`Paso condicional para ${area.nombre}`}
                          checked={area.es_condicional || false}
                          onCheckedChange={() =>
                            handleToggleAreaFlag(area.id, "es_condicional", area.es_condicional || false)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="font-medium text-foreground text-[11px]">V°B° Cliente</span>
                        <Switch
                          aria-label={`Aprobación de cliente para ${area.nombre}`}
                          checked={area.requiere_aprobacion_cliente || false}
                          onCheckedChange={() =>
                            handleToggleAreaFlag(
                              area.id,
                              "requiere_aprobacion_cliente",
                              area.requiere_aprobacion_cliente || false
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: USUARIOS Y ACCESOS MULTI-ÁREA */}
      {tabActiva === "usuarios" && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Asignación de Estaciones a Operadores</CardTitle>
            <CardDescription className="text-xs">
              Los operarios pueden atender múltiples áreas de producción. Marca las estaciones a las que cada usuario tiene acceso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="divide-y divide-border/60">
              {usuarios.map((u) => {
                const assignedIds = u.areas_asignadas.map((a) => a.id);

                return (
                  <div key={u.id} className="py-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">
                            {u.nombre_completo}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            @{u.usuario}
                          </span>
                          <Badge variant="outline" className="uppercase font-bold text-[11px]">
                            {u.rol}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground block">
                          {assignedIds.length === 0
                            ? "Sin áreas asignadas (No podrá iniciar tareas)"
                            : assignedIds.length === areas.length
                            ? "Acceso a todas las estaciones de planta"
                            : `${assignedIds.length} estación(es) autorizada(s)`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={u.activo ? "success" : "secondary"} className="text-xs">
                          {u.activo ? "Usuario Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>

                    {/* Matriz de Checkboxes por Área */}
                    <div className="p-3 bg-muted/20 rounded-xl border border-border/50">
                      <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                        Estaciones Permitidas:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {areas.map((area) => {
                          const estaAsignada = assignedIds.includes(area.id);

                          return (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => handleToggleUsuarioArea(u.id, area.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-colors ${
                                estaAsignada
                                  ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                                  : "bg-background border-border/60 text-muted-foreground hover:border-border"
                              }`}
                            >
                              <div
                                className={`h-3 w-3 rounded-xs border flex items-center justify-center shrink-0 ${
                                  estaAsignada
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-muted-foreground/40 bg-background"
                                }`}
                              >
                                {estaAsignada && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{area.nombre}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: CATÁLOGO DE ACABADOS */}
      {tabActiva === "acabados" && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Catálogo de Acabados Disponibles</CardTitle>
              <CardDescription className="text-xs">
                Acabados especiales seleccionables en el Wizard de creación de órdenes.
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setModalAcabadoAbierto(true)}
              className="rounded-xl font-semibold gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Acabado</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {acabados.map((acabado) => (
                <div key={acabado.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-foreground block">
                        {acabado.nombre}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Registrado {new Date(acabado.created_at).toLocaleDateString("es-VE")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      {acabado.activo ? "Activo" : "Inactivo"}
                    </span>
                    <Switch
                      aria-label={`Estado activo para acabado ${acabado.nombre}`}
                      checked={acabado.activo}
                      onCheckedChange={() => handleToggleAcabado(acabado.id, acabado.activo)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: PROVEEDORES EXTERNOS */}
      {tabActiva === "proveedores" && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Proveedores de Talleres Externos</CardTitle>
              <CardDescription className="text-xs">
                Talleres de barniz, plastificado, troquelado o encuadernación para el control de salidas y retornos.
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setModalProveedorAbierto(true)}
              className="rounded-xl font-semibold gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Proveedor</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {proveedores.map((p) => {
                const tipoBadge =
                  p.tipo === "planchas"
                    ? "Planchas CTP"
                    : p.tipo === "papel"
                    ? "Papel e Insumos"
                    : "Servicios Varios";

                return (
                  <div key={p.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">
                            {p.nombre}
                          </span>
                          <Badge variant="secondary" className="text-[11px] uppercase font-bold">
                            {tipoBadge}
                          </Badge>
                        </div>
                        {p.telefono && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" />
                            {p.telefono}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-medium">
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                      <Switch
                        aria-label={`Estado activo para proveedor ${p.nombre}`}
                        checked={p.activo}
                        onCheckedChange={() => handleToggleProveedor(p.id, p.activo)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: TIPOS DE TRABAJO */}
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

      {/* TAB 6: MOTIVOS DE PAUSA */}
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

      {/* Modal para Crear Acabado */}
      {modalAcabadoAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Nuevo Acabado
              </h3>
              <button
                type="button"
                onClick={() => setModalAcabadoAbierto(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearAcabado} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Nombre del Acabado Especial *
                </label>
                <Input
                  placeholder="Ej. Hot Stamping Plateado"
                  value={nombreAcabado}
                  onChange={(e) => setNombreAcabado(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModalAcabadoAbierto(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending || !nombreAcabado.trim()}>
                  Guardar Acabado
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Crear Proveedor */}
      {modalProveedorAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Nuevo Proveedor Externo
              </h3>
              <button
                type="button"
                onClick={() => setModalProveedorAbierto(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearProveedor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Nombre del Taller / Proveedor *
                </label>
                <Input
                  placeholder="Ej. Plastificados San Martín C.A."
                  value={nombreProveedor}
                  onChange={(e) => setNombreProveedor(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Teléfono / Contacto
                </label>
                <Input
                  placeholder="Ej. +58 412 555-1234"
                  value={telefonoProveedor}
                  onChange={(e) => setTelefonoProveedor(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Especialidad Principal *
                </label>
                <select
                  value={tipoProveedor}
                  onChange={(e) => setTipoProveedor(e.target.value as ProveedorRow["tipo"])}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 font-medium focus:ring-2 focus:ring-primary/20"
                >
                  <option value="planchas">Planchas CTP</option>
                  <option value="papel">Papel e Insumos</option>
                  <option value="otros">Otros Talleres / Procesos Externos</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModalProveedorAbierto(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending || !nombreProveedor.trim()}>
                  Guardar Proveedor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

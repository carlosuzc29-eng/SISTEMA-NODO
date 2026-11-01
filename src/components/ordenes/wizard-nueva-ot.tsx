"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RouteBuilder } from "./route-builder";
import { ClienteRow, TipoTrabajoRow, AreaRow, PrioridadOT, AcabadoRow } from "@/types/database";
import { crearOrdenAction } from "@/features/ordenes/actions";
import { crearCliente } from "@/features/clientes/actions";
import { toast } from "sonner";
import {
  User,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  Layers,
  Box,
  AlertTriangle,
  Loader2,
  FileCheck2,
  Sparkles,
  DoorOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardNuevaOtProps {
  clientes: ClienteRow[];
  tiposTrabajo: TipoTrabajoRow[];
  areas: AreaRow[];
  acabadosDisponibles?: AcabadoRow[];
}

export function WizardNuevaOt({
  clientes,
  tiposTrabajo,
  areas,
  acabadosDisponibles = [],
}: WizardNuevaOtProps) {
  const router = useRouter();
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();

  // Planchas area helper
  const areaPlanchas = areas.find(
    (a) => a.slug === "planchas" || a.nombre.toLowerCase().includes("planchas")
  );

  // Estado del Formulario
  const [clienteId, setClienteId] = useState(clientes[0]?.id || "");
  const [tipoTrabajoId, setTipoTrabajoId] = useState(tiposTrabajo[0]?.id || "");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("1000");
  const [material, setMaterial] = useState("Cartulina Sulfatada 14 pts");
  const [medidas, setMedidas] = useState("60 x 60 x 140 mm");
  const [tintas, setTintas] = useState("4/0 (CMYK)");
  const [acabadosText, setAcabadosText] = useState("");
  const [acabadosSeleccionados, setAcabadosSeleccionados] = useState<string[]>([]);
  const [usaPlanchasExistentes, setUsaPlanchasExistentes] = useState(false);
  const [prioridad, setPrioridad] = useState<PrioridadOT>("normal");
  const [fechaEntrega, setFechaEntrega] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split("T")[0];
  });

  // Ruta seleccionada
  const [ruta, setRuta] = useState<string[]>(() => {
    const defaultTipo = tiposTrabajo[0];
    return defaultTipo?.ruta?.length ? defaultTipo.ruta : areas.map((a) => a.id);
  });

  // Modal rápido de creación de cliente
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [nuevoNombreCliente, setNuevoNombreCliente] = useState("");
  const [nuevaEmpresaCliente, setNuevaEmpresaCliente] = useState("");
  const [nuevoTelefonoCliente, setNuevoTelefonoCliente] = useState("");

  const handleTipoTrabajoChange = (id: string) => {
    setTipoTrabajoId(id);
    const tipo = tiposTrabajo.find((t) => t.id === id);
    if (tipo && tipo.ruta && tipo.ruta.length > 0) {
      if (usaPlanchasExistentes && areaPlanchas) {
        setRuta(tipo.ruta.filter((aId) => aId !== areaPlanchas.id));
      } else {
        setRuta(tipo.ruta);
      }
    }
  };

  const handleTogglePlanchas = (checked: boolean) => {
    setUsaPlanchasExistentes(checked);
    if (!areaPlanchas) return;

    if (checked) {
      // Omitir automáticamente área de Planchas de la ruta
      setRuta((prev) => prev.filter((id) => id !== areaPlanchas.id));
      toast.info("Planchas CTP omitidas de la ruta de producción.");
    } else {
      // Reinsertar planchas respetando su posición por orden
      if (!ruta.includes(areaPlanchas.id)) {
        const nuevaRuta = [...ruta, areaPlanchas.id].sort((aId, bId) => {
          const a = areas.find((ar) => ar.id === aId);
          const b = areas.find((ar) => ar.id === bId);
          return (a?.orden || 99) - (b?.orden || 99);
        });
        setRuta(nuevaRuta);
        toast.info("Estación de Planchas reincorporada a la ruta.");
      }
    }
  };

  const handleToggleAcabado = (acabadoId: string) => {
    setAcabadosSeleccionados((prev) =>
      prev.includes(acabadoId)
        ? prev.filter((id) => id !== acabadoId)
        : [...prev, acabadoId]
    );
  };

  const handleCrearRapidoCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombreCliente.trim()) {
      toast.error("El nombre del cliente es obligatorio");
      return;
    }

    startTransition(async () => {
      const res = await crearCliente({
        nombre: nuevoNombreCliente.trim(),
        empresa: nuevaEmpresaCliente.trim() || null,
        telefono: nuevoTelefonoCliente.trim() || null,
      });

      if (res.ok && res.cliente) {
        toast.success("Cliente creado exitosamente");
        setClienteId(res.cliente.id);
        setShowModalCliente(false);
        setNuevoNombreCliente("");
        setNuevaEmpresaCliente("");
        setNuevoTelefonoCliente("");
      } else {
        toast.error(res.error || "Error al crear cliente");
      }
    });
  };

  const handleCrearOrden = () => {
    if (!clienteId) {
      toast.error("Selecciona un cliente");
      setPaso(1);
      return;
    }
    if (!titulo.trim() || !cantidad || !material.trim()) {
      toast.error("Completa las especificaciones de la orden");
      setPaso(2);
      return;
    }
    if (!fechaEntrega) {
      toast.error("Por favor indica la fecha de entrega");
      setPaso(3);
      return;
    }

    // Combinar nombres de acabados seleccionados con el texto manual
    const nombresAcabados = acabadosSeleccionados
      .map((id) => acabadosDisponibles.find((a) => a.id === id)?.nombre)
      .filter(Boolean);
    const acabadosFinales = [
      ...nombresAcabados,
      acabadosText.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    startTransition(async () => {
      const res = await crearOrdenAction({
        cliente_id: clienteId,
        tipo_trabajo_id: tipoTrabajoId,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        cantidad: parseInt(cantidad, 10),
        material: material.trim(),
        medidas: medidas.trim(),
        tintas: tintas.trim(),
        acabados: acabadosFinales || null,
        usa_planchas_existentes: usaPlanchasExistentes,
        acabado_ids: acabadosSeleccionados,
        notas_acabado: acabadosText.trim() || null,
        prioridad,
        fecha_entrega: fechaEntrega,
        ruta,
      });

      if (res.ok && res.codigo) {
        toast.success(`¡Orden ${res.codigo} creada en estado En Puerta! 🎉`);
        router.push(`/ordenes/${res.codigo}`);
      } else {
        toast.error(res.error || "Error al crear la orden de trabajo");
      }
    });
  };

  const clienteSeleccionado = clientes.find((c) => c.id === clienteId);
  const tipoSeleccionado = tiposTrabajo.find((t) => t.id === tipoTrabajoId);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Barra de progreso continuo */}
      <div className="relative h-1.5 w-full bg-border/60 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 w-full bg-primary origin-left transition-transform duration-250 ease-[var(--ease-out)]"
          style={{ transform: `scaleX(${paso === 1 ? 0.33 : paso === 2 ? 0.66 : 1})` }}
        />
      </div>

      {/* Indicadores de Pasos */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { num: 1, label: "Cliente", desc: "Datos del solicitante" },
          { num: 2, label: "Especificaciones", desc: "Material, tiraje y acabados" },
          { num: 3, label: "Ruta y Plazos", desc: "11 estaciones y entrega" },
        ].map((s) => {
          const isActive = paso === s.num;
          const isDone = paso > s.num;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setPaso(s.num as 1 | 2 | 3)}
              className={cn(
                "p-3 rounded-2xl border text-left transition-[background-color,border-color,box-shadow,color] duration-150 ease-[var(--ease-out)]",
                isActive
                  ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                  : isDone
                  ? "bg-card border-border hover:border-primary/40"
                  : "bg-muted/20 border-border/60 opacity-60"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isDone ? <Check className="h-3 w-3" /> : s.num}
                </span>
                <span className="font-bold text-xs text-foreground">{s.label}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 truncate">{s.desc}</p>
            </button>
          );
        })}
      </div>

      <Card className="rounded-2xl border border-border/80 shadow-xs">
        {/* PASO 1: CLIENTE */}
        {paso === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Paso 1: Seleccionar o Crear Cliente
              </CardTitle>
              <CardDescription>
                Indica la empresa o persona que solicita la orden de producción.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Clientes Registrados ({clientes.length})
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModalCliente(true)}
                  className="h-8 text-xs rounded-xl gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Nuevo Cliente Rápido</span>
                </Button>
              </div>

              {/* Lista de Clientes en Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {clientes.map((c) => {
                  const isSelected = clienteId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setClienteId(c.id)}
                      className={cn(
                        "p-3.5 rounded-xl border text-left transition-[background-color,border-color,box-shadow] duration-150 ease-[var(--ease-out)]",
                        isSelected
                          ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                          : "bg-card border-border/70 hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground truncate">
                          {c.empresa || c.nombre}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                      {c.empresa && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          Contacto: {c.nombre}
                        </p>
                      )}
                      {c.telefono && (
                        <p className="text-[11px] font-mono text-muted-foreground/80 mt-1">
                          {c.telefono}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Modal Rápido de Nuevo Cliente */}
              {showModalCliente && (
                <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
                  <span className="text-xs font-bold text-foreground block">
                    Registrar Nuevo Cliente Rápido
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      placeholder="Nombre de la persona *"
                      value={nuevoNombreCliente}
                      onChange={(e) => setNuevoNombreCliente(e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      placeholder="Empresa o Razón Social"
                      value={nuevaEmpresaCliente}
                      onChange={(e) => setNuevaEmpresaCliente(e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      placeholder="Teléfono / WhatsApp"
                      value={nuevoTelefonoCliente}
                      onChange={(e) => setNuevoTelefonoCliente(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowModalCliente(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCrearRapidoCliente}
                      disabled={isPending || !nuevoNombreCliente.trim()}
                    >
                      Guardar Cliente
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border/60 pt-4">
              <div />
              <Button
                type="button"
                disabled={!clienteId}
                onClick={() => setPaso(2)}
                className="rounded-xl px-6"
              >
                <span>Continuar a Especificaciones</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </CardFooter>
          </>
        )}

        {/* PASO 2: ESPECIFICACIONES TÉCNICAS */}
        {paso === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                Paso 2: Especificaciones del Trabajo
              </CardTitle>
              <CardDescription>
                Define el tipo de producto, medidas, materiales, tintas y acabados especiales.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de Trabajo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo de Trabajo Base
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {tiposTrabajo.map((tipo) => {
                    const isSelected = tipoTrabajoId === tipo.id;
                    return (
                      <button
                        key={tipo.id}
                        type="button"
                        onClick={() => handleTipoTrabajoChange(tipo.id)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-[background-color,border-color,box-shadow,color] duration-150 ease-[var(--ease-out)]",
                          isSelected
                            ? "bg-primary/10 border-primary font-semibold text-primary ring-1 ring-primary/30"
                            : "bg-card border-border/70 hover:border-primary/40 text-foreground"
                        )}
                      >
                        <span className="text-xs block font-bold truncate">
                          {tipo.nombre}
                        </span>
                        <span className="text-[11px] text-muted-foreground block mt-0.5">
                          {tipo.ruta.length} estaciones sugeridas
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título de la Orden */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Título o Descripción del Producto *
                </label>
                <Input
                  placeholder="Ej. Cajas de Jarabe 120ml con Barniz UV y Hot Stamping"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              {/* Cantidad y Medidas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tiraje / Cantidad de Unidades *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1000"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Medidas (mm o cm) *
                  </label>
                  <Input
                    placeholder="Ej. 60 x 60 x 140 mm"
                    value={medidas}
                    onChange={(e) => setMedidas(e.target.value)}
                  />
                </div>
              </div>

              {/* Material y Tintas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sustrato / Material *
                  </label>
                  <Input
                    placeholder="Ej. Cartulina Sulfatada 14 pts / Glasé 150g"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tintas de Impresión *
                  </label>
                  <Input
                    placeholder="Ej. 4/0 (Full Color frente) o 4/4 CMYK"
                    value={tintas}
                    onChange={(e) => setTintas(e.target.value)}
                  />
                </div>
              </div>

              {/* Selector Múltiple de Acabados Requeridos */}
              <div className="space-y-2 pt-1 border-t border-border/50">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Acabados Requeridos (Selecciona todos los que apliquen)
                </label>

                {acabadosDisponibles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {acabadosDisponibles.map((acabado) => {
                      const isSelected = acabadosSeleccionados.includes(acabado.id);
                      return (
                        <button
                          key={acabado.id}
                          type="button"
                          onClick={() => handleToggleAcabado(acabado.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl border text-xs font-medium transition-[background-color,border-color,color] duration-120 ease-[var(--ease-out)] flex items-center gap-1.5",
                            isSelected
                              ? "bg-[var(--ink-yellow-subtle)] border-[var(--ink-yellow)] text-[var(--ink-yellow-foreground)] font-bold ring-1 ring-[var(--ink-yellow)]/30"
                              : "bg-muted/30 border-border/70 hover:border-[var(--ink-yellow)]/40 text-foreground"
                          )}
                        >
                          <div
                            className={cn(
                              "h-3.5 w-3.5 rounded flex items-center justify-center text-[11px]",
                              isSelected
                                ? "bg-[var(--ink-yellow)] text-[var(--ink-yellow-foreground)]"
                                : "border border-muted-foreground/40"
                            )}
                          >
                            {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </div>
                          <span>{acabado.nombre}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="pt-1.5">
                  <Input
                    placeholder="Detalles adicionales de acabados (ej. Hot stamping dorado en logo frontal)"
                    value={acabadosText}
                    onChange={(e) => setAcabadosText(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border/60 pt-4">
              <Button variant="outline" onClick={() => setPaso(1)}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                <span>Atrás</span>
              </Button>
              <Button
                type="button"
                disabled={!titulo.trim() || !cantidad || !material.trim()}
                onClick={() => setPaso(3)}
                className="rounded-xl px-6"
              >
                <span>Continuar a Ruta y Plazos</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </CardFooter>
          </>
        )}

        {/* PASO 3: RUTA Y ENTREGA */}
        {paso === 3 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Paso 3: Ruta de Producción y Programación
              </CardTitle>
              <CardDescription>
                Ajusta las 11 estaciones agrupadas en las 3 fases (Pre-prensa, Prensa, Post-prensa).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Constructor de Ruta Visual Adaptado */}
              <RouteBuilder
                todasLasAreas={areas}
                rutaSeleccionada={ruta}
                onChange={setRuta}
                usaPlanchasExistentes={usaPlanchasExistentes}
                onTogglePlanchas={handleTogglePlanchas}
              />

              {/* Prioridad y Fecha de Entrega */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Fecha de Entrega Prometida *
                  </label>
                  <Input
                    type="date"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    Nivel de Prioridad
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["baja", "normal", "alta", "urgente"] as PrioridadOT[]).map((p) => {
                      const isSelected = prioridad === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPrioridad(p)}
                          className={cn(
                            "py-2 text-xs rounded-xl font-bold uppercase transition-[background-color,color,box-shadow,transform] duration-120 ease-[var(--ease-out)] active:scale-[0.98]",
                            isSelected
                              ? p === "urgente"
                                ? "bg-destructive text-destructive-foreground shadow-xs"
                                : p === "alta"
                                ? "bg-[var(--ink-yellow)] text-[var(--ink-yellow-foreground)] shadow-xs"
                                : "bg-primary text-primary-foreground shadow-xs"
                              : "bg-muted/40 text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Resumen Final de Creación */}
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <FileCheck2 className="h-4 w-4 text-[var(--color-registry-green)]" />
                    Resumen de la Orden
                  </span>
                  <Badge variant="outline" className="bg-[var(--ink-yellow-subtle)] text-[var(--ink-yellow-foreground)] border-[var(--ink-yellow)]/30 text-[11px] gap-1 font-semibold">
                    <DoorOpen className="h-3 w-3" />
                    Estado inicial: En Puerta
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p>
                    <strong>Cliente:</strong> {clienteSeleccionado?.empresa || clienteSeleccionado?.nombre}
                  </p>
                  <p>
                    <strong>Producto:</strong> {titulo} ({parseInt(cantidad, 10).toLocaleString()} uds)
                  </p>
                  <p>
                    <strong>Sustrato:</strong> {material} • {tintas}
                  </p>
                  <p>
                    <strong>Ruta:</strong> {ruta.length} estaciones programadas
                  </p>
                  <p>
                    <strong>Planchas CTP:</strong> {usaPlanchasExistentes ? "Existentes (Omitidas)" : "Por Grabar"}
                  </p>
                  <p>
                    <strong>Entrega:</strong> {fechaEntrega}
                  </p>
                </div>

                <div className="text-[11px] text-muted-foreground bg-card/60 p-2.5 rounded-xl border border-border/60">
                  ℹ️ Al guardar, la orden se creará en estado <strong>En Puerta</strong>. No avanzará a producción en planta hasta que sea liberada por Recepción o Administración.
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border/60 pt-4">
              <Button variant="outline" onClick={() => setPaso(2)}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                <span>Atrás</span>
              </Button>
              <Button
                type="button"
                disabled={isPending || ruta.length === 0 || !fechaEntrega}
                onClick={handleCrearOrden}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-7 font-bold shadow-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Guardando Orden...</span>
                  </>
                ) : (
                  <>
                    <DoorOpen className="h-4 w-4 mr-1.5" />
                    <span>Crear Orden en Puerta</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

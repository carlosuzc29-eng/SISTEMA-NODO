"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RouteBuilder } from "./route-builder";
import { ClienteRow, TipoTrabajoRow, AreaRow, PrioridadOT } from "@/types/database";
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
} from "lucide-react";

interface WizardNuevaOtProps {
  clientes: ClienteRow[];
  tiposTrabajo: TipoTrabajoRow[];
  areas: AreaRow[];
}

export function WizardNuevaOt({ clientes, tiposTrabajo, areas }: WizardNuevaOtProps) {
  const router = useRouter();
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();

  // Estado del Formulario
  const [clienteId, setClienteId] = useState(clientes[0]?.id || "");
  const [tipoTrabajoId, setTipoTrabajoId] = useState(tiposTrabajo[0]?.id || "");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("1000");
  const [material, setMaterial] = useState("Cartulina Sulfatada 14 pts");
  const [medidas, setMedidas] = useState("60 x 60 x 140 mm");
  const [tintas, setTintas] = useState("4/0 (CMYK)");
  const [acabados, setAcabados] = useState("Barniz UV brillante");
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
      setRuta(tipo.ruta);
    }
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

  const handleFinalizar = () => {
    if (!clienteId) {
      toast.error("Por favor selecciona un cliente");
      setPaso(1);
      return;
    }
    if (!titulo.trim()) {
      toast.error("Por favor ingresa un título para la orden");
      setPaso(2);
      return;
    }
    if (!cantidad || Number(cantidad) <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      setPaso(2);
      return;
    }
    if (!fechaEntrega) {
      toast.error("Por favor indica la fecha de entrega");
      setPaso(3);
      return;
    }

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
        acabados: acabados.trim() || null,
        prioridad,
        fecha_entrega: fechaEntrega,
        ruta,
      });

      if (res.ok && res.codigo) {
        toast.success(`¡Orden ${res.codigo} creada con éxito!`);
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
      <div className="relative h-1 w-full bg-border/60 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 w-full bg-primary origin-left transition-transform duration-250 ease-[var(--ease-out)]"
          style={{ transform: `scaleX(${paso === 1 ? 0.33 : paso === 2 ? 0.66 : 1})` }}
        />
      </div>

      {/* Indicador de Pasos del Asistente */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { num: 1, label: "Cliente", desc: "Selección o registro" },
          { num: 2, label: "Especificaciones", desc: "Ficha técnica" },
          { num: 3, label: "Ruta y Entrega", desc: "Estaciones y plazos" },
        ].map((p) => {
          const isActive = paso === p.num;
          const isDone = paso > p.num;

          return (
            <div
              key={p.num}
              onClick={() => isDone && setPaso(p.num as 1 | 2 | 3)}
              className={`p-3 rounded-xl border transition-[border-color,background-color] duration-150 ease-[var(--ease-out)] cursor-pointer ${
                isActive
                  ? "bg-card border-primary/60 shadow-xs ring-1 ring-primary/20"
                  : isDone
                  ? "bg-card/60 border-[var(--success)]/40 hover:border-[var(--success)]/70"
                  : "bg-muted/20 border-border/60 opacity-60 pointer-events-none"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
                    isDone
                      ? "bg-[var(--success)] text-[var(--success-foreground)]"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-3 w-3 stroke-[2.5]" /> : p.num}
                </span>
                <span className="font-medium text-xs text-foreground font-mono">
                  {p.label}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1 truncate">
                {p.desc}
              </span>
            </div>
          );
        })}
      </div>

      <Card className="border-border/80 shadow-xs backdrop-blur-sm bg-card/95">
        {/* PASO 1: CLIENTE */}
        {paso === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Paso 1: Seleccionar Cliente
              </CardTitle>
              <CardDescription>
                Elige el cliente para esta orden de producción o registra uno nuevo rápidamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Clientes Registrados ({clientes.length})
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModalCliente(true)}
                  className="rounded-xl h-8 text-xs font-medium"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Nuevo Cliente
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
                {clientes.map((c) => {
                  const isSelected = clienteId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setClienteId(c.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                          : "bg-card border-border/70 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">
                          {c.empresa || c.nombre}
                        </span>
                        {isSelected && (
                          <span className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      {c.empresa && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Contacto: {c.nombre}
                        </p>
                      )}
                      {c.telefono && (
                        <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                          {c.telefono}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border/60 pt-4">
              <Button variant="ghost" disabled>
                Atrás
              </Button>
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
                Define el tipo de producto, medidas, materiales y tiraje de impresión.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de Trabajo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo de Trabajo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {tiposTrabajo.map((tipo) => {
                    const isSelected = tipoTrabajoId === tipo.id;
                    return (
                      <button
                        key={tipo.id}
                        type="button"
                        onClick={() => handleTipoTrabajoChange(tipo.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-primary/10 border-primary font-semibold text-primary"
                            : "bg-muted/30 border-border/70 hover:border-primary/40 text-foreground"
                        }`}
                      >
                        <span className="text-xs block font-bold truncate">
                          {tipo.nombre}
                        </span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {tipo.ruta.length} estaciones
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título de la Orden */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Título descriptivo del producto *
                </label>
                <Input
                  placeholder="Ej. Cajas de Jarabe 120ml con Hot Stamping"
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
                    placeholder="Ej. 4/0 (Full Color frente)"
                    value={tintas}
                    onChange={(e) => setTintas(e.target.value)}
                  />
                </div>
              </div>

              {/* Acabados y Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Acabados Especiales
                </label>
                <Input
                  placeholder="Ej. Barniz UV brillante, troquelado con solapas, estampado dorado"
                  value={acabados}
                  onChange={(e) => setAcabados(e.target.value)}
                />
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
                <span>Continuar a Ruta y Entrega</span>
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
                Paso 3: Ruta de Producción y Plazos
              </CardTitle>
              <CardDescription>
                Personaliza la secuencia de áreas por las que viajará la orden y fija la fecha prometida.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Constructor de Ruta */}
              <RouteBuilder
                todasLasAreas={areas}
                rutaSeleccionada={ruta}
                onChange={setRuta}
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
                          className={`py-2 text-xs rounded-xl font-bold uppercase transition-all ${
                            isSelected
                              ? p === "urgente"
                                ? "bg-destructive text-destructive-foreground shadow-sm"
                                : p === "alta"
                                ? "bg-amber-500 text-white shadow-sm"
                                : "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted/40 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Resumen Final de Creación */}
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-emerald-500" />
                  Resumen de la Orden
                </span>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>Cliente:</strong> {clienteSeleccionado?.empresa || clienteSeleccionado?.nombre}
                  </p>
                  <p>
                    <strong>Producto:</strong> {titulo} ({parseInt(cantidad, 10).toLocaleString()} uds)
                  </p>
                  <p>
                    <strong>Tipo:</strong> {tipoSeleccionado?.nombre}
                  </p>
                  <p>
                    <strong>Secuencia:</strong> {ruta.length} estaciones programadas
                  </p>
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
                disabled={isPending || ruta.length === 0}
                onClick={handleFinalizar}
                className="rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando Orden...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Crear Orden de Trabajo
                  </>
                )}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>

      {/* MODAL RÁPIDO PARA CREAR CLIENTE */}
      {showModalCliente && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border/80 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="font-bold text-lg text-foreground">
              Registrar Nuevo Cliente
            </h3>
            <form onSubmit={handleCrearRapidoCliente} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Nombre del Contacto *
                </label>
                <Input
                  placeholder="Ej. Roberto Gómez"
                  value={nuevoNombreCliente}
                  onChange={(e) => setNuevoNombreCliente(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Empresa o Marca
                </label>
                <Input
                  placeholder="Ej. Cosméticos BellaPiel C.A."
                  value={nuevaEmpresaCliente}
                  onChange={(e) => setNuevaEmpresaCliente(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Teléfono de Contacto
                </label>
                <Input
                  placeholder="Ej. +58 412 1234567"
                  value={nuevoTelefonoCliente}
                  onChange={(e) => setNuevoTelefonoCliente(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModalCliente(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  Guardar Cliente
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

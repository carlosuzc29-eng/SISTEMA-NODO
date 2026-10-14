"use client";

import React, { useState, useTransition } from "react";
import { ClienteRow } from "@/types/database";
import { OrdenConRelaciones } from "@/features/ordenes/actions";
import { crearCliente } from "@/features/clientes/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, Plus, Phone, Mail, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ClientesClientViewProps {
  clientes: ClienteRow[];
  ordenes: OrdenConRelaciones[];
}

export function ClientesClientView({ clientes, ordenes }: ClientesClientViewProps) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    startTransition(async () => {
      const res = await crearCliente({
        nombre: nombre.trim(),
        empresa: empresa.trim() || null,
        telefono: telefono.trim() || null,
        email: email.trim() || null,
        notas: notas.trim() || null,
      });

      if (res.ok) {
        toast.success("Cliente registrado exitosamente");
        setModalAbierto(false);
        setNombre("");
        setEmpresa("");
        setTelefono("");
        setEmail("");
        setNotas("");
      } else {
        toast.error(res.error || "No se pudo registrar el cliente");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Directorio de Clientes
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión de empresas, marcas, contactos e historial de trabajos producidos.
          </p>
        </div>

        <Button
          onClick={() => setModalAbierto(true)}
          className="rounded-xl shadow-sm h-10 font-semibold px-4"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Nuevo Cliente</span>
        </Button>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {clientes.map((c) => {
          const ordenesCliente = ordenes.filter((o) => o.cliente_id === c.id);

          return (
            <Card
              key={c.id}
              variant="interactive"
              className="flex flex-col justify-between shadow-xs"
            >
              <CardHeader className="pb-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">
                      {c.empresa || c.nombre}
                    </CardTitle>
                    {c.empresa && (
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Contacto: {c.nombre}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline" className="font-mono text-[11px] tabular-nums">
                    {ordenesCliente.length} {ordenesCliente.length === 1 ? "OT" : "OTs"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-2.5 pt-0 text-xs">
                {c.telefono && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono">{c.telefono}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2 text-muted-foreground truncate">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span>{c.email}</span>
                  </div>
                )}
                {c.notas && (
                  <p className="text-muted-foreground/80 bg-muted/40 p-2 rounded-lg border border-border/50 leading-relaxed text-[11px]">
                    {c.notas}
                  </p>
                )}

                {/* Últimas Órdenes */}
                <div className="pt-2 border-t border-border/50">
                  <span className="label-caps text-muted-foreground block mb-1.5">
                    Historial de Trabajos
                  </span>
                  {ordenesCliente.length > 0 ? (
                    <div className="space-y-1">
                      {ordenesCliente.slice(0, 3).map((o) => (
                        <Link
                          key={o.id}
                          href={`/ordenes/${o.codigo}`}
                          className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/60 text-xs transition-[background-color] duration-150 ease-[var(--ease-out)]"
                        >
                          <span className="font-mono font-bold text-primary">
                            {o.codigo}
                          </span>
                          <span className="truncate max-w-[160px] text-muted-foreground">
                            {o.titulo}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Sin órdenes registradas todavía.
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal para Crear Cliente */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border/80 p-5 max-w-md w-full shadow-lg space-y-4 card-highlight">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="font-bold text-lg text-foreground">
                Registrar Nuevo Cliente
              </h3>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Nombre del Contacto *
                </label>
                <Input
                  placeholder="Ej. Roberto Gómez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Empresa o Marca
                </label>
                <Input
                  placeholder="Ej. Farmacéutica Nova Salud"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Teléfono
                  </label>
                  <Input
                    placeholder="Ej. +58 412 1234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Correo Electrónico
                  </label>
                  <Input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Notas u Observaciones
                </label>
                <Input
                  placeholder="Ej. Cliente corporativo con crédito a 15 días"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModalAbierto(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending || !nombre.trim()}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cliente"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

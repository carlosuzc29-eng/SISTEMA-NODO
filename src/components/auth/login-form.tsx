"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PinKeypad } from "./pin-keypad";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Lock, User, Loader2, ShieldAlert } from "lucide-react";
import { loginConPin } from "@/features/auth/actions";
import { toast } from "sonner";
import { brand } from "@/config/brand";

const testUsers = [
  { usuario: "admin", label: "Admin" },
  { usuario: "recepcion", label: "Recepción" },
  { usuario: "supervisor", label: "Supervisor" },
  { usuario: "op_diseno", label: "Diseño" },
  { usuario: "op_impresion", label: "Impresión" },
  { usuario: "op_troquelado", label: "Troquelado" },
  { usuario: "op_corte", label: "Corte" },
];

export function LoginForm() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [minutosRestantes, setMinutosRestantes] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!usuario.trim()) {
      setErrorMessage("Por favor ingresa tu nombre de usuario.");
      return;
    }
    if (pin.length !== 6) {
      setErrorMessage("El PIN debe contener exactamente 6 dígitos.");
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const result = await loginConPin({
        usuario: usuario.trim().toLowerCase(),
        pin,
      });

      if (!result.ok) {
        if (result.bloqueado) {
          setBloqueado(true);
          setMinutosRestantes(result.minutosRestantes || 15);
        }
        setErrorMessage(result.error || "Error al iniciar sesión.");
        setPin("");
        return;
      }

      toast.success("¡Bienvenido al sistema!");
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
        router.refresh();
      }
    });
  };

  const handleSelectTestUser = (u: string) => {
    setUsuario(u);
    setPin("123456");
    setErrorMessage(null);
  };

  return (
    <Card className="w-full max-w-md border-border/80 shadow-2xl backdrop-blur-md bg-card/95">
      <CardHeader className="text-center pb-4 pt-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
          <Lock className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          {brand.nombre}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Ingresa tu usuario y PIN de 6 dígitos para acceder al sistema
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pb-8">
        {bloqueado ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-center space-y-2">
            <div className="flex justify-center text-destructive">
              <ShieldAlert className="h-8 w-8 animate-bounce" />
            </div>
            <h4 className="font-semibold text-destructive text-base">
              Acceso Bloqueado Temporalmente
            </h4>
            <p className="text-sm text-destructive/90 leading-relaxed">
              Has superado el límite de 5 intentos fallidos. Por seguridad, la cuenta
              estará bloqueada durante los próximos{" "}
              <strong className="underline">{minutosRestantes} minutos</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mensaje de error general */}
            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive animate-in fade-in-50 duration-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Campo de Usuario */}
            <div className="space-y-1.5">
              <label
                htmlFor="usuario-input"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="usuario-input"
                  type="text"
                  placeholder="Ej. admin, recepcion, op_diseno"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  disabled={isPending}
                  autoComplete="username"
                  autoCapitalize="none"
                  className="pl-10 text-base"
                />
              </div>
            </div>

            {/* Teclado numérico y puntos PIN */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  PIN de Seguridad
                </span>
                <span className="text-xs text-muted-foreground">
                  {pin.length} / 6 dígitos
                </span>
              </div>

              <PinKeypad
                value={pin}
                onChange={setPin}
                onSubmit={handleSubmit}
                disabled={isPending}
              />
            </div>

            {/* Botón de Acceso */}
            <Button
              type="submit"
              disabled={isPending || pin.length !== 6 || !usuario.trim()}
              className="w-full h-13 text-base font-medium rounded-xl shadow-md transition-all mt-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verificando credenciales...
                </>
              ) : (
                "Entrar al Sistema"
              )}
            </Button>
          </form>
        )}

        {/* Acceso Rápido de Prueba (Semilla Fase 1) */}
        <div className="pt-2 border-t border-border/50">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2 text-center">
            Atajos de Prueba (Seed PIN: 123456)
          </span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {testUsers.map((item) => (
              <button
                key={item.usuario}
                type="button"
                onClick={() => handleSelectTestUser(item.usuario)}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-border/80 hover:bg-accent/80 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all active:scale-95"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            ¿Olvidaste tu PIN? Contacta al administrador para restablecerlo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

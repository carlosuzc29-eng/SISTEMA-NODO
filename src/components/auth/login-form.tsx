"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PinKeypad } from "./pin-keypad";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, User, Loader2, ShieldAlert } from "lucide-react";
import { loginConPin } from "@/features/auth/actions";
import { toast } from "sonner";
import { brand } from "@/config/brand";

import Image from "next/image";

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
    <Card className="w-full max-w-md border-border/80 shadow-lg backdrop-blur-xl bg-card/85 card-highlight">
      <CardHeader className="text-center pb-3 pt-7">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-xs">
          <Image
            src="/brand/logo.svg"
            alt="NODO 26 Logo"
            width={28}
            height={28}
            className="w-7 h-7"
            priority
          />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
          {brand.nombre}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Control de Producción • Ingresa usuario y PIN de 6 dígitos
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pb-7">
        {bloqueado ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive-subtle p-4 text-center space-y-2">
            <div className="flex justify-center text-destructive">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h4 className="font-semibold text-destructive text-sm">
              Acceso Bloqueado Temporalmente
            </h4>
            <p className="text-xs text-destructive-foreground/90 leading-relaxed">
              Has superado el límite de 5 intentos fallidos. Por seguridad, la cuenta
              estará bloqueada durante los próximos{" "}
              <strong className="underline">{minutosRestantes} minutos</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mensaje de error general */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive-subtle p-3 text-xs text-destructive-foreground">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Campo de Usuario */}
            <div className="space-y-1.5">
              <label
                htmlFor="usuario-input"
                className="label-caps block text-muted-foreground"
              >
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                <Input
                  id="usuario-input"
                  type="text"
                  placeholder="admin, recepcion, op_diseno..."
                  value={usuario}
                  onChange={(e) => {
                    setUsuario(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={isPending}
                  autoComplete="username"
                  autoCapitalize="none"
                  className="pl-9 font-mono text-sm"
                />
              </div>
            </div>

            {/* Teclado numérico y puntos PIN */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center px-0.5">
                <span className="label-caps text-muted-foreground">
                  PIN de Seguridad
                </span>
                <span className="text-[11px] font-mono tabular-nums text-muted-foreground/70">
                  {pin.length} / 6
                </span>
              </div>

              <PinKeypad
                value={pin}
                onChange={(val) => {
                  setPin(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                onSubmit={handleSubmit}
                disabled={isPending}
                hasError={!!errorMessage}
              />
            </div>

            {/* Botón de Acceso */}
            <Button
              type="submit"
              disabled={isPending || pin.length !== 6 || !usuario.trim()}
              className="w-full h-10 text-sm font-medium rounded-lg shadow-xs mt-3"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando credenciales...
                </>
              ) : (
                "Entrar al Sistema"
              )}
            </Button>
          </form>
        )}

        {/* Acceso Rápido de Prueba */}
        <div className="pt-3 border-t border-border/50">
          <span className="label-caps block mb-2 text-center text-muted-foreground/70">
            Atajos de Prueba (PIN: 123456)
          </span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {testUsers.map((item) => (
              <button
                key={item.usuario}
                type="button"
                onClick={() => handleSelectTestUser(item.usuario)}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-border/70 hover:bg-muted/70 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-[transform,background-color,border-color] duration-150 ease-[var(--ease-out)] active:scale-[0.96]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-muted-foreground/70">
            ¿Olvidaste tu PIN? Contacta al supervisor para restablecerlo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

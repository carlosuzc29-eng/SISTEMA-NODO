"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Delete, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  maxLength?: number;
  disabled?: boolean;
  hasError?: boolean;
}

export function PinKeypad({
  value,
  onChange,
  onSubmit,
  maxLength = 6,
  disabled = false,
  hasError = false,
}: PinKeypadProps) {
  const handleDigit = (digit: string) => {
    if (disabled || value.length >= maxLength) return;
    const nextVal = value + digit;
    onChange(nextVal);
    if (nextVal.length === maxLength && onSubmit) {
      // Auto submit o esperar acción manual
    }
  };

  const handleBackspace = () => {
    if (disabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled || value.length === 0) return;
    onChange("");
  };

  // Soporte para teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      // Si el foco está en un input o textarea, dejar que el input maneje el evento
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        if (value.length < maxLength) {
          onChange(value + e.key);
        }
      } else if (e.key === "Backspace") {
        onChange(value.slice(0, -1));
      } else if (e.key === "Escape") {
        onChange("");
      } else if (e.key === "Enter" && value.length === maxLength && onSubmit) {
        onSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [value, maxLength, disabled, onChange, onSubmit]);

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-4">
      {/* Indicadores de PIN (6 puntos) con animación shake en caso de error */}
      <div
        className={cn(
          "flex justify-center items-center gap-3 py-2",
          hasError && "animate-pin-shake"
        )}
      >
        {Array.from({ length: maxLength }).map((_, idx) => {
          const isFilled = idx < value.length;
          const isCurrent = idx === value.length && !hasError;
          return (
            <div
              key={idx}
              className={cn(
                "h-3.5 w-3.5 rounded-full border transition-[transform,background-color,border-color] duration-150 ease-[var(--ease-out)]",
                hasError
                  ? "border-destructive bg-destructive/40"
                  : isFilled
                  ? "bg-[var(--ink-magenta)] border-[var(--ink-magenta)] scale-110 shadow-sm shadow-[var(--ink-magenta)]/30"
                  : isCurrent
                  ? "border-[var(--ink-magenta)]/80 bg-[var(--ink-magenta)]/15 ring-2 ring-[var(--ink-magenta)]/25"
                  : "border-border/80 bg-muted/40"
              )}
            />
          );
        })}
      </div>

      {/* Teclado numérico táctil (mínimo 56px de alto para operarios) */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {digits.map((num) => (
          <Button
            key={num}
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => handleDigit(num)}
            className="h-14 sm:h-15 min-h-[56px] text-2xl font-mono font-semibold rounded-2xl border-border hover:border-foreground/30 hover:bg-muted/50 active:scale-[0.97] transition-[transform,background-color,border-color] duration-100 ease-[var(--ease-out)] shadow-xs select-none"
          >
            {num}
          </Button>
        ))}

        {/* Botón limpiar */}
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || value.length === 0}
          onClick={handleClear}
          title="Borrar todo"
          className="h-14 sm:h-15 min-h-[56px] text-xs font-mono font-medium uppercase tracking-wider rounded-2xl text-muted-foreground hover:text-foreground active:scale-[0.97] transition-[transform,background-color] duration-100 ease-[var(--ease-out)]"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Dígito 0 */}
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => handleDigit("0")}
          className="h-14 sm:h-15 min-h-[56px] text-2xl font-mono font-semibold rounded-2xl border-border hover:border-foreground/30 hover:bg-muted/50 active:scale-[0.97] transition-[transform,background-color,border-color] duration-100 ease-[var(--ease-out)] shadow-xs select-none"
        >
          0
        </Button>

        {/* Botón retroceso */}
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || value.length === 0}
          onClick={handleBackspace}
          title="Borrar dígito"
          className="h-14 sm:h-15 min-h-[56px] rounded-2xl text-muted-foreground hover:text-foreground active:scale-[0.97] transition-[transform,background-color] duration-100 ease-[var(--ease-out)]"
        >
          <Delete className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

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
}

export function PinKeypad({
  value,
  onChange,
  onSubmit,
  maxLength = 6,
  disabled = false,
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
      if (/^[0-9]$/.test(e.key)) {
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
      {/* Indicadores de PIN (6 puntos) */}
      <div className="flex justify-center items-center gap-3 py-2">
        {Array.from({ length: maxLength }).map((_, idx) => {
          const isFilled = idx < value.length;
          const isCurrent = idx === value.length;
          return (
            <div
              key={idx}
              className={cn(
                "h-4 w-4 rounded-full border-2 transition-all duration-200",
                isFilled
                  ? "bg-primary border-primary scale-110 shadow-sm shadow-primary/40"
                  : isCurrent
                  ? "border-primary/70 bg-primary/10 animate-pulse"
                  : "border-muted-foreground/30 bg-muted/40"
              )}
            />
          );
        })}
      </div>

      {/* Teclado numérico táctil */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {digits.map((num) => (
          <Button
            key={num}
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => handleDigit(num)}
            className="h-14 sm:h-16 text-2xl font-semibold rounded-2xl border-border/80 hover:border-primary/50 hover:bg-primary/5 active:scale-95 transition-all shadow-sm"
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
          className="h-14 sm:h-16 text-sm font-medium rounded-2xl text-muted-foreground hover:text-foreground active:scale-95 transition-all"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Dígito 0 */}
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => handleDigit("0")}
          className="h-14 sm:h-16 text-2xl font-semibold rounded-2xl border-border/80 hover:border-primary/50 hover:bg-primary/5 active:scale-95 transition-all shadow-sm"
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
          className="h-14 sm:h-16 rounded-2xl text-muted-foreground hover:text-foreground active:scale-95 transition-all"
        >
          <Delete className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

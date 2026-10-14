import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import { differenceInCalendarDays, parseISO, isToday } from "date-fns";

interface OtSemaphoreProps {
  fechaEntrega: string;
  className?: string;
}

export function OtSemaphore({ fechaEntrega, className }: OtSemaphoreProps) {
  const hoy = new Date();
  const fecha = typeof fechaEntrega === "string" ? parseISO(fechaEntrega) : fechaEntrega;
  const diasDiferencia = differenceInCalendarDays(fecha, hoy);

  let variant: "success" | "warning" | "destructive" = "success";
  let texto = "";
  let icon = Clock;

  if (diasDiferencia < 0) {
    variant = "destructive";
    const diasAtraso = Math.abs(diasDiferencia);
    texto = `Atrasada ${diasAtraso} ${diasAtraso === 1 ? "día" : "días"}`;
    icon = AlertCircle;
  } else if (isToday(fecha)) {
    variant = "destructive";
    texto = "Vence hoy";
    icon = AlertCircle;
  } else if (diasDiferencia === 1) {
    variant = "warning";
    texto = "Vence mañana";
  } else if (diasDiferencia === 2) {
    variant = "warning";
    texto = "Vence en 2 días";
  } else {
    variant = "success";
    texto = `Entrega en ${diasDiferencia} días`;
  }

  const IconComp = icon;

  return (
    <Badge
      variant={variant}
      className={`text-[11px] font-medium tracking-normal gap-1.5 py-0.5 px-2.5 ${className || ""}`}
    >
      <IconComp className="h-3 w-3 shrink-0" />
      <span>{texto}</span>
    </Badge>
  );
}

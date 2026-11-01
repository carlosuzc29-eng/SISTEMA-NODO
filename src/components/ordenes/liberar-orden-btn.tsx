"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { liberarOrdenAction } from "@/features/ordenes/actions";
import { toast } from "sonner";
import { PlayCircle, Loader2 } from "lucide-react";

export function LiberarOrdenBtn({ ordenId }: { ordenId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleLiberar = () => {
    startTransition(async () => {
      const res = await liberarOrdenAction(ordenId);
      if (res.ok) {
        toast.success("¡Orden liberada a planta! Ha entrado en la cola de producción 🚀");
      } else {
        toast.error(res.error || "Error al liberar orden");
      }
    });
  };

  return (
    <Button
      size="sm"
      disabled={isPending}
      onClick={handleLiberar}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs gap-1.5"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <PlayCircle className="h-3.5 w-3.5" />
      )}
      <span>Liberar a Planta</span>
    </Button>
  );
}

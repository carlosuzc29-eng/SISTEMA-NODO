import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Layers } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center halftone-pattern">
      <div className="relative max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-lg crop-marks">
        {/* Tira CMYK de control */}
        <div className="cmyk-strip rounded-t-xl mb-6" />

        {/* 404 con sobreimpresión / registro corrido de imprenta */}
        <div className="relative flex justify-center items-center my-4 select-none">
          <span className="font-display text-7xl font-black text-[var(--ink-cyan)] opacity-70 absolute -translate-x-1 -translate-y-0.5 mix-blend-multiply dark:mix-blend-screen">
            404
          </span>
          <span className="font-display text-7xl font-black text-[var(--ink-magenta)] opacity-80 absolute translate-x-1 translate-y-0.5 mix-blend-multiply dark:mix-blend-screen">
            404
          </span>
          <span className="font-display text-7xl font-black text-foreground relative">
            404
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border text-[11px] font-mono font-medium text-muted-foreground mb-4">
          <Layers className="h-3 w-3 text-primary" />
          <span>Error de Pliego · Registro No Encontrado</span>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-foreground font-display">
          Pliego fuera de registro
        </h2>
        <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
          La ruta a la que intentas acceder no existe en la línea de producción o fue archivada.
        </p>

        <div className="mt-6 flex justify-center">
          <Button asChild variant="default" className="shadow-sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Producción
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

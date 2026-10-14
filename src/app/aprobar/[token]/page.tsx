import React from "react";
import { obtenerDatosAprobacionAction } from "@/features/mockups/actions";
import { ClientApprovalView } from "@/components/mockups/client-approval-view";
import { brand } from "@/config/brand";
import { AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function AprobarTokenPage({ params }: PageProps) {
  const { token } = await params;
  const res = await obtenerDatosAprobacionAction(token);

  if (!res.ok || !res.data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-card rounded-2xl p-8 border border-border/80 shadow-xs space-y-4 card-highlight">
          <div className="w-11 h-11 rounded-xl bg-[var(--warning-subtle)] text-[var(--warning)] flex items-center justify-center mx-auto border border-[var(--warning)]/30">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h1 className="text-base font-bold text-foreground font-mono">
            Enlace de Aprobación No Encontrado
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            El enlace que intentas abrir ha caducado, fue renovado o no existe en los registros de {brand.nombre}.
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hola ${brand.nombre}, necesito ayuda con un enlace de aprobación de arte.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[var(--success)] text-[var(--success-foreground)] text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity"
            >
              Contactar a Atención al Cliente
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { aprobacion, orden, mockup, cliente } = res.data;

  return (
    <ClientApprovalView
      aprobacion={aprobacion}
      orden={orden}
      mockup={mockup}
      cliente={cliente}
    />
  );
}

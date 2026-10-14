import React from "react";
import { notFound } from "next/navigation";
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Enlace de Aprobación No Encontrado
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            El enlace que intentas abrir ha caducado, fue renovado o no existe en los registros de {brand.nombre}.
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hola ${brand.nombre}, necesito ayuda con un enlace de aprobación de arte.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
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

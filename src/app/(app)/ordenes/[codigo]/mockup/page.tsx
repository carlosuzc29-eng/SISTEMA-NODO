import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { obtenerOrdenPorCodigo } from "@/features/ordenes/actions";
import { obtenerMockupPorOrdenAction } from "@/features/mockups/actions";
import { mockStore } from "@/lib/mock-store";
import { MockupEditor } from "@/components/mockups/mockup-editor";
import { ArrowLeft, Box } from "lucide-react";

interface PageProps {
  params: Promise<{
    codigo: string;
  }>;
}

export default async function OrdenMockupPage({ params }: PageProps) {
  const { codigo } = await params;
  const orden = await obtenerOrdenPorCodigo(codigo);

  if (!orden) {
    notFound();
  }

  const mockup = await obtenerMockupPorOrdenAction(orden.id);
  const existingAprobacion = mockStore.aprobaciones.find(
    (a) => a.orden_id === orden.id && a.estado === "pendiente"
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Barra superior con navegación */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/ordenes/${orden.codigo}`}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-violet-600 bg-violet-50 dark:bg-violet-950/50 px-2 py-0.5 rounded-md">
                {orden.codigo}
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-violet-600" />
                Mockup 3D y Aprobación
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Cliente: {orden.cliente.nombre} {orden.cliente.empresa && `(${orden.cliente.empresa})`} — {orden.titulo}
            </p>
          </div>
        </div>
      </div>

      {/* Editor 3D */}
      <MockupEditor
        orden={orden}
        cliente={orden.cliente}
        initialMockup={mockup}
        existingToken={existingAprobacion?.token}
      />
    </div>
  );
}

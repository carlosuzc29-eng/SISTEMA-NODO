"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileSpreadsheet,
  Plus,
  Truck,
  Users,
  Palette,
  Printer,
  Scissors,
  Layers,
  CheckCheck,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { label: "Nueva Orden de Trabajo", href: "/ordenes/nueva", icon: Plus, group: "Acciones" },
    { label: "Ver Todas las Órdenes", href: "/ordenes", icon: FileSpreadsheet, group: "Producción" },
    { label: "Muelle de Despachos", href: "/despachos", icon: Truck, group: "Producción" },
    { label: "Directorio de Clientes", href: "/clientes", icon: Users, group: "Gestión" },
    { label: "Diseño gráfico / Arte final", href: "/area/diseno-arte-final", icon: Palette, group: "Pre-prensa" },
    { label: "Planchas / CTP", href: "/area/planchas", icon: Layers, group: "Pre-prensa" },
    { label: "Preparación de materiales", href: "/area/preparacion-materiales", icon: Layers, group: "Pre-prensa" },
    { label: "Impresión / Secado", href: "/area/impresion-secado", icon: Printer, group: "Prensa" },
    { label: "Acabado exterior", href: "/area/acabado", icon: Layers, group: "Prensa" },
    { label: "Troquelado", href: "/area/troquelado", icon: Scissors, group: "Post-prensa" },
    { label: "Corte y refile", href: "/area/corte-refile", icon: Layers, group: "Post-prensa" },
    { label: "Encuadernación / Armado manual", href: "/area/encuadernacion-manual", icon: Layers, group: "Post-prensa" },
    { label: "Control de calidad", href: "/area/control-calidad", icon: CheckCheck, group: "Post-prensa" },
    { label: "Embalaje", href: "/area/embalaje", icon: Layers, group: "Post-prensa" },
    { label: "Despacho", href: "/area/despacho", icon: Truck, group: "Post-prensa" },
  ];

  const filtered = quickLinks.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.group.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      {/* Contenedor SIN animación de apertura para teclado inmediato */}
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border/80 shadow-lg card-highlight overflow-hidden">
        {/* Input de Búsqueda */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe una orden, área o acción..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Lista de Resultados */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No se encontraron coincidencias para &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-foreground/90 hover:bg-muted/70 hover:text-foreground transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground/60 label-caps">
                    {item.group}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Pie del modal con tips de teclado */}
        <div className="px-4 py-2 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-mono text-[10px]">Nodo 26 Command</span>
          <div className="flex items-center gap-2">
            <span>Navegar</span>
            <kbd className="px-1.5 py-0.5 rounded border bg-card text-[9px] font-mono">ESC</kbd>
            <span>para cerrar</span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { CommandPalette } from "./command-palette";
import { ProfileRow, AreaRow } from "@/types/database";

interface TopbarProps {
  profile: ProfileRow & { area?: AreaRow | null };
}

export function Topbar({ profile }: TopbarProps) {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const canCreateOT = profile.rol === "admin" || profile.rol === "recepcion";

  // Atajo de teclado global Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Construcción de breadcrumbs dinámicos
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [{ label: "Inicio", href: "/dashboard" }];

    const breadcrumbs: { label: string; href: string }[] = [];
    let currentPath = "";

    const segmentLabelMap: Record<string, string> = {
      dashboard: "Dashboard",
      ordenes: "Órdenes",
      nueva: "Nueva Orden",
      mockup: "Mockup 3D",
      entregas: "Entregas",
      clientes: "Clientes",
      configuracion: "Configuración",
      reportes: "Reportes",
      area: "Estación",
      diseno: "Diseño",
      impresion: "Impresión",
      troquelado: "Troquelado",
      corte: "Corte",
    };

    segments.forEach((seg) => {
      currentPath += `/${seg}`;
      const label = segmentLabelMap[seg.toLowerCase()] || seg.toUpperCase();
      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <header className="h-14 border-b border-border/50 bg-background/70 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Breadcrumbs de Navegación */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors font-medium truncate"
          >
            Planta
          </Link>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href}>
                <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                {isLast ? (
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors truncate max-w-[120px]"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Acciones de la derecha: Buscador + CTA + Tema + Usuario */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón de Buscador Rápido (⌘K) */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 border border-border/60 rounded-lg hover:border-foreground/20 hover:text-foreground transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px]">Buscar...</span>
            <kbd className="inline-flex h-4 items-center gap-0.5 rounded border border-border/70 bg-card px-1 font-mono text-[9px] text-muted-foreground">
              <span>⌘</span>K
            </kbd>
          </button>

          {canCreateOT && (
            <Button
              asChild
              size="sm"
              className="h-8 px-3 rounded-lg text-xs font-semibold shadow-xs"
            >
              <Link href="/ordenes/nueva">
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Nueva OT</span>
              </Link>
            </Button>
          )}

          <div className="h-4 w-px bg-border/60 mx-0.5" />
          <ThemeToggle />
          <UserNav profile={profile} />
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  );
}

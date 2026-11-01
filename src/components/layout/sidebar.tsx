"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Truck,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { brand } from "@/config/brand";
import { ProfileRow } from "@/types/database";

interface SidebarProps {
  profile: ProfileRow;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = profile.rol === "admin";
  const isSupervisor = profile.rol === "supervisor";

  const seccionProduccion = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      label: "Órdenes de Trabajo",
      href: "/ordenes",
      icon: FileSpreadsheet,
      visible: true,
    },
    {
      label: "Despachos",
      href: "/despachos",
      icon: Truck,
      visible: true,
    },
  ];

  const seccionGestion = [
    {
      label: "Clientes",
      href: "/clientes",
      icon: Users,
      visible: true,
    },
    {
      label: "Reportes y Tiempos",
      href: "/reportes",
      icon: BarChart3,
      visible: isAdmin || isSupervisor,
    },
    {
      label: "Configuración",
      href: "/configuracion",
      icon: Settings,
      visible: isAdmin,
    },
  ];

  const renderNavGroup = (
    title: string,
    items: typeof seccionProduccion
  ) => {
    const visibleItems = items.filter((item) => item.visible);
    if (visibleItems.length === 0) return null;

    return (
      <div className="space-y-1">
        <div className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/75 label-caps">
          {title}
        </div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-[background-color,color] duration-150 ease-[var(--ease-out)]",
                isActive
                  ? "bg-[var(--ink-magenta-subtle)] text-[var(--ink-magenta-foreground)] font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-[var(--ink-magenta)]"
                  : "text-muted-foreground hover:bg-accent/70 hover:text-foreground font-medium"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-[var(--ink-magenta)]" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="w-60 border-r border-border/80 bg-card/80 backdrop-blur-xl saturate-150 flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex z-20 overflow-hidden">
      {/* Tira CMYK de Control de Color de Prensa en el borde superior */}
      <div className="cmyk-strip" />

      {/* Encabezado con Isotipo de Imprenta */}
      <div className="px-4 py-3.5 border-b border-border/60">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card border border-border shadow-xs text-primary transition-transform duration-150 ease-[var(--ease-out)] group-hover:scale-105">
            <Image
              src="/brand/logo.svg"
              alt="Nodo 26 Logo"
              width={26}
              height={26}
              className="dark:invert-0 drop-shadow-xs"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-tight text-foreground leading-none flex items-center gap-1.5 font-display">
              {brand.nombreCorto}
              <span className="text-[11px] font-mono font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                Prensa
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground/85 truncate mt-1">
              Imprenta & Empaques
            </span>
          </div>
        </Link>
      </div>

      {/* Menú de Navegación Segmentado */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {renderNavGroup("Producción", seccionProduccion)}
        {renderNavGroup("Gestión", seccionGestion)}
      </nav>

      {/* Pie del Sidebar con Estado del Sistema */}
      <div className="p-3 border-t border-border/60 bg-muted/20">
        <div className="rounded-xl bg-card p-2.5 border border-border/70 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            {/* Indicador Planta en línea con Verde de Registro */}
            <div className="relative flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-[var(--color-registry-green)]/20" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-registry-green)]" />
            </div>
            <span className="text-[11px] text-foreground font-semibold">Planta en línea</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            +58 N26
          </span>
        </div>
      </div>
    </aside>
  );
}

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
      label: "Entregas y Despacho",
      href: "/entregas",
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
        <div className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 label-caps">
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
                "group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-[background-color,color] duration-150 ease-[var(--ease-out)]",
                isActive
                  ? "bg-muted/80 text-foreground font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2.5px] before:rounded-r before:bg-primary"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="w-60 border-r border-border/70 bg-card/75 backdrop-blur-xl saturate-150 flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex z-20">
      {/* Encabezado con Isotipo de Imprenta */}
      <div className="px-5 py-4 border-b border-border/60">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border/80 shadow-xs text-primary transition-transform duration-150 ease-[var(--ease-out)] group-hover:scale-105">
            <Image
              src="/brand/logo.svg"
              alt="Nodo 26 Logo"
              width={22}
              height={22}
              className="dark:invert-0"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-foreground leading-none flex items-center gap-1">
              {brand.nombreCorto}
              <span className="text-[9px] font-mono font-medium px-1 py-0.5 rounded bg-muted text-muted-foreground">
                v1.2
              </span>
            </span>
            <span className="text-[10px] text-muted-foreground/75 truncate mt-0.5">
              Control de Imprenta
            </span>
          </div>
        </Link>
      </div>

      {/* Menú de Navegación Segmentado */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {renderNavGroup("Producción", seccionProduccion)}
        {renderNavGroup("Gestión", seccionGestion)}
      </nav>

      {/* Pie del Sidebar con Estado del Sistema */}
      <div className="p-3 border-t border-border/60">
        <div className="rounded-xl bg-muted/40 p-2.5 border border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            {/* Indicador de estado con halo suave (sin animate-pulse permanente) */}
            <div className="relative flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-500/20" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </div>
            <span className="text-[11px] text-muted-foreground">Planta en línea</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/60">
            Nodo 26
          </span>
        </div>
      </div>
    </aside>
  );
}

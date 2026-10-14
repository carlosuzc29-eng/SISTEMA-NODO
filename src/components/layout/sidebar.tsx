"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Truck,
  Users,
  BarChart3,
  Settings,
  Layers,
  Printer,
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

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      label: "Órdenes (OT)",
      href: "/ordenes",
      icon: FileSpreadsheet,
      visible: true,
    },
    {
      label: "Entregas",
      href: "/entregas",
      icon: Truck,
      visible: true,
    },
    {
      label: "Clientes",
      href: "/clientes",
      icon: Users,
      visible: true,
    },
    {
      label: "Reportes",
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

  return (
    <aside className="w-64 border-r border-border/80 bg-card/60 backdrop-blur-md flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex">
      {/* Encabezado con Identidad de Marca */}
      <div className="p-6 border-b border-border/60">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30 group-hover:scale-105 transition-all">
            <Printer className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-foreground leading-tight">
              {brand.nombreCorto}
            </span>
            <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
              Control de Producción
            </span>
          </div>
        </Link>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Navegación Principal
        </div>
        {navigationItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* Pie del Sidebar */}
      <div className="p-4 border-t border-border/60">
        <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistema Operativo</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Versión 1.0.0 • Fase 1
          </p>
        </div>
      </div>
    </aside>
  );
}

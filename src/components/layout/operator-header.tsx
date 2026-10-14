"use client";

import React from "react";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { brand } from "@/config/brand";
import { ProfileRow, AreaRow } from "@/types/database";
import { Layers } from "lucide-react";

interface OperatorHeaderProps {
  profile: ProfileRow & { area?: AreaRow | null };
}

export function OperatorHeader({ profile }: OperatorHeaderProps) {
  const area = profile.area;
  const areaColor = area?.color_hex || brand.colorPrimario;

  return (
    <header className="h-20 border-b border-border/80 bg-card/90 backdrop-blur-md sticky top-0 z-30 px-6 sm:px-8 flex items-center justify-between shadow-sm">
      {/* Información del Área Asignada */}
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md transition-transform"
          style={{ backgroundColor: areaColor }}
        >
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
              Tablero de Producción
            </span>
            <span className="text-xs text-muted-foreground">• {brand.nombreCorto}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight flex items-center gap-2">
            Área de {area?.nombre || "Producción"}
          </h1>
        </div>
      </div>

      {/* Controles y Sesión */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="h-6 w-px bg-border/80" />
        <UserNav profile={profile} />
      </div>
    </header>
  );
}

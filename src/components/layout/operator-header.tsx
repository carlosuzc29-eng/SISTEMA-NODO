"use client";

import React from "react";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { brand } from "@/config/brand";
import { ProfileRow, AreaRow } from "@/types/database";

interface OperatorHeaderProps {
  profile: ProfileRow & { area?: AreaRow | null };
}

export function OperatorHeader({ profile }: OperatorHeaderProps) {
  const area = profile.area;
  const areaColor = area?.color_hex || brand.colorPrimario;

  return (
    <header className="h-16 border-b border-border/60 bg-card/85 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-xs card-highlight">
      {/* Información del Área Asignada */}
      <div className="flex items-center gap-3.5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs"
          style={{ backgroundColor: areaColor }}
        >
          <Image
            src="/brand/logo.svg"
            alt="Nodo 26 Logo"
            width={20}
            height={20}
            className="brightness-0 invert"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider label-caps">
              Estación de Trabajo
            </span>
            <span>•</span>
            <span>{brand.nombreCorto}</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-foreground leading-tight">
            Área de {area?.nombre || "Producción"}
          </h1>
        </div>
      </div>

      {/* Controles y Sesión */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="h-4 w-px bg-border/60" />
        <UserNav profile={profile} />
      </div>
    </header>
  );
}

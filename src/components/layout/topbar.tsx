"use client";

import React from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { ProfileRow, AreaRow } from "@/types/database";

interface TopbarProps {
  profile: ProfileRow & { area?: AreaRow | null };
}

export function Topbar({ profile }: TopbarProps) {
  const canCreateOT = profile.rol === "admin" || profile.rol === "recepcion";

  return (
    <header className="h-16 border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Barra de Búsqueda Global (Ctrl + K) */}
      <div className="flex-1 max-w-md">
        <button
          type="button"
          onClick={() => {}}
          className="w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-muted-foreground bg-muted/40 border border-input rounded-xl hover:border-primary/50 transition-all text-left"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>Buscar OT por código, cliente o título...</span>
          </div>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Acciones de la derecha */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {canCreateOT && (
          <Button
            asChild
            size="sm"
            className="rounded-xl shadow-sm h-9 px-3.5 font-medium"
          >
            <Link href="/ordenes/nueva">
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Nueva OT</span>
            </Link>
          </Button>
        )}

        <ThemeToggle />
        <div className="h-5 w-px bg-border/80 mx-0.5" />
        <UserNav profile={profile} />
      </div>
    </header>
  );
}

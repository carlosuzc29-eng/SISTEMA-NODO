"use client";

import React, { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Shield, Layers } from "lucide-react";
import { cerrarSesion } from "@/features/auth/actions";
import { ProfileRow, AreaRow } from "@/types/database";

interface UserNavProps {
  profile: ProfileRow & { area?: AreaRow | null };
}

export function UserNav({ profile }: UserNavProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await cerrarSesion();
    });
  };

  const rolLabel: Record<string, string> = {
    admin: "Administrador",
    recepcion: "Recepción",
    supervisor: "Supervisor",
    operador: "Operador",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 flex items-center gap-2.5 px-2.5 rounded-xl hover:bg-accent/70 border border-transparent hover:border-border/60 transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
            {profile.nombre_completo.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col items-start text-left text-xs hidden sm:flex">
            <span className="font-medium text-foreground truncate max-w-[120px]">
              {profile.nombre_completo}
            </span>
            <span className="text-muted-foreground text-[10px]">
              {rolLabel[profile.rol] || profile.rol}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground">
              {profile.nombre_completo}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              @{profile.usuario}
            </p>
            <div className="pt-1.5 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                <Shield className="h-2.5 w-2.5 mr-1" />
                {rolLabel[profile.rol] || profile.rol}
              </Badge>
              {profile.area && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium"
                  style={{ borderColor: profile.area.color_hex }}
                >
                  <Layers className="h-2.5 w-2.5 mr-1" />
                  {profile.area.nombre}
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isPending}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive font-medium cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>{isPending ? "Cerrando sesión..." : "Cerrar sesión"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

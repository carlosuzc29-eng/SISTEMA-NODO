"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Cambiar tema claro / oscuro"
      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground relative overflow-hidden"
    >
      <Sun className="h-[1.15rem] w-[1.15rem] scale-100 opacity-100 blur-0 dark:scale-90 dark:opacity-0 dark:blur-[2px] transition-[transform,opacity,filter] duration-150 ease-[var(--ease-out)]" />
      <Moon className="absolute h-[1.15rem] w-[1.15rem] scale-90 opacity-0 blur-[2px] dark:scale-100 dark:opacity-100 dark:blur-0 transition-[transform,opacity,filter] duration-150 ease-[var(--ease-out)]" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}

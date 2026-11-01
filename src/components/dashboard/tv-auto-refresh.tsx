"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";

export function TvAutoRefresh({ intervalSeconds = 30 }: { intervalSeconds?: number }) {
  const router = useRouter();
  const [segundos, setSegundos] = useState(intervalSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSegundos((prev) => {
        if (prev <= 1) {
          router.refresh();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, intervalSeconds]);

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-card/80 px-3 py-1.5 rounded-xl border border-border/80 shadow-xs">
      <RotateCw className="h-3.5 w-3.5 animate-spin text-primary" style={{ animationDuration: "4s" }} />
      <span>Actualización en vivo: {segundos}s</span>
    </div>
  );
}

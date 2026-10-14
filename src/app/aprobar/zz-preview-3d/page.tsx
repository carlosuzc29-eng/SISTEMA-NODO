"use client";
// TEMPORAL: ruta de verificación visual de mockups 3D. Borrar.
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PackagingCanvas } from "@/components/mockups/packaging-canvas";
import type { TipoModeloEmpaque, TipoHotStamping } from "@/types/database";

function makeArt(): string {
  const c = document.createElement("canvas");
  c.width = 900; c.height = 1200;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 0, 1200);
  g.addColorStop(0, "#1e3a5f"); g.addColorStop(1, "#0f1f33");
  x.fillStyle = g; x.fillRect(0, 0, 900, 1200);
  x.fillStyle = "#f59e0b"; x.beginPath(); x.arc(450, 480, 200, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#fff"; x.font = "bold 120px sans-serif"; x.textAlign = "center";
  x.fillText("CAFÉ", 450, 860); x.font = "48px sans-serif"; x.fillText("tostado artesanal", 450, 940);
  return c.toDataURL("image/png");
}

export default function Preview() {
  const q = useSearchParams();
  const [art, setArt] = useState<string | null>(null);
  useEffect(() => { if (q.get("art")) setArt(makeArt()); }, [q]);
  return (
    <div className={q.get("dark") ? "dark bg-zinc-950 p-6" : "bg-zinc-50 p-6"}>
      <PackagingCanvas
        modeloTipo={(q.get("m") as TipoModeloEmpaque) || "caja_tuck_end"}
        anchoCm={Number(q.get("w") || 15)} altoCm={Number(q.get("h") || 20)} profundidadCm={Number(q.get("d") || 8)}
        artTextureUrl={art}
        uvVarnish={!!q.get("uv")} hotStamping={(q.get("foil") as TipoHotStamping) || "ninguno"} emboss={!!q.get("emb")}
        isOpenInitial={!!q.get("open")}
        className="w-full h-[640px]"
      />
    </div>
  );
}

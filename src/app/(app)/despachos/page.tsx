import { obtenerOrdenes } from "@/features/ordenes/actions";
import { DespachosClientView } from "./despachos-client-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Despachos y Salidas — Control de Producción",
};

export default async function DespachosPage() {
  const [listasParaDespacho, despachadas] = await Promise.all([
    obtenerOrdenes({ estado: "lista_despacho" }),
    obtenerOrdenes({ estado: "despachada" }),
  ]);

  return (
    <DespachosClientView
      listasParaDespacho={listasParaDespacho}
      despachadas={despachadas}
    />
  );
}

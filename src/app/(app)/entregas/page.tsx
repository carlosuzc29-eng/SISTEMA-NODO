import { obtenerOrdenes } from "@/features/ordenes/actions";
import { EntregasClientView } from "./entregas-client-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Entregas y Despacho — Control de Producción",
};

export default async function EntregasPage() {
  const [listasParaEntrega, entregadas] = await Promise.all([
    obtenerOrdenes({ estado: "lista_entrega" }),
    obtenerOrdenes({ estado: "entregada" }),
  ]);

  return (
    <EntregasClientView
      listasParaEntrega={listasParaEntrega}
      entregadas={entregadas}
    />
  );
}

import { obtenerClientes } from "@/features/clientes/actions";
import { obtenerOrdenes } from "@/features/ordenes/actions";
import { ClientesClientView } from "./clientes-client-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Directorio de Clientes — Control de Producción",
};

export default async function ClientesPage() {
  const [clientes, ordenes] = await Promise.all([
    obtenerClientes(),
    obtenerOrdenes(),
  ]);

  return <ClientesClientView clientes={clientes} ordenes={ordenes} />;
}

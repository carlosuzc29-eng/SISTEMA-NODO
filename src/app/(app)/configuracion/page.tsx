import { obtenerAreas, obtenerTiposTrabajo, obtenerMotivosPausa } from "@/features/tipos-trabajo/actions";
import { ConfiguracionClientView } from "./configuracion-client-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Configuración del Sistema — Control de Producción",
};

export default async function ConfiguracionPage() {
  const [areas, tiposTrabajo, motivosPausa] = await Promise.all([
    obtenerAreas(),
    obtenerTiposTrabajo(),
    obtenerMotivosPausa(),
  ]);

  return (
    <ConfiguracionClientView
      areas={areas}
      tiposTrabajo={tiposTrabajo}
      motivosPausa={motivosPausa}
    />
  );
}

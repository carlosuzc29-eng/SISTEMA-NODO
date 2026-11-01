import { obtenerAreas, obtenerTiposTrabajo, obtenerMotivosPausa } from "@/features/tipos-trabajo/actions";
import {
  obtenerAcabados,
  obtenerProveedores,
  obtenerUsuariosConAreas,
} from "@/features/ordenes/actions";
import { ConfiguracionClientView } from "./configuracion-client-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Configuración del Sistema — Control de Producción",
};

export default async function ConfiguracionPage() {
  const [areas, tiposTrabajo, motivosPausa, acabados, proveedores, usuariosConAreas] =
    await Promise.all([
      obtenerAreas(),
      obtenerTiposTrabajo(),
      obtenerMotivosPausa(),
      obtenerAcabados(),
      obtenerProveedores(),
      obtenerUsuariosConAreas(),
    ]);

  return (
    <ConfiguracionClientView
      areas={areas}
      tiposTrabajo={tiposTrabajo}
      motivosPausa={motivosPausa}
      acabados={acabados}
      proveedores={proveedores}
      usuariosConAreas={usuariosConAreas}
    />
  );
}


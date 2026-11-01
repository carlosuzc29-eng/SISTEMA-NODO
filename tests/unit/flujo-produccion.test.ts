import { test, expect } from "@playwright/test";
import { mockStore } from "@/lib/mock-store";

test.describe("Flujo de Producción - Reglas de Negocio y Estados (11 Áreas)", () => {
  test("1. liberar_orden(): no permite liberar una orden que no esté 'en_puerta'", async () => {
    const { id: ordenId } = mockStore.crearOrden({
      cliente_id: mockStore.clientes[0].id,
      tipo_trabajo_id: mockStore.tiposTrabajo[0].id,
      titulo: `Prueba Liberación ${Date.now()}`,
      descripcion: "Prueba de liberación",
      cantidad: 1000,
      prioridad: "normal",
      fecha_entrega: new Date().toISOString(),
      ruta: [
        mockStore.areas[0].id,
        mockStore.areas[2].id,
        mockStore.areas[9].id,
      ],
    });

    const orden = mockStore.ordenes.find((o) => o.id === ordenId)!;
    // 1. Debe arrancar en 'en_puerta'
    expect(orden.estado).toBe("en_puerta");

    // 2. Liberar orden
    const res = mockStore.liberarOrden(ordenId, mockStore.perfiles[0].id);
    expect(res.ok).toBe(true);

    const ordenActualizada = mockStore.ordenes.find((o) => o.id === ordenId)!;
    expect(ordenActualizada.estado).toBe("en_produccion");

    // 3. Intentar liberar nuevamente debe arrojar error
    let arrojoError = false;
    try {
      mockStore.liberarOrden(ordenId, mockStore.perfiles[0].id);
    } catch (err: any) {
      arrojoError = true;
      expect(err.message).toBe("La orden ya está en proceso o no está en puerta");
    }
    expect(arrojoError).toBeTruthy();
  });

  test("2. avanzar_etapa(): salta automáticamente etapas omitidas", async () => {
    const { id: ordenId } = mockStore.crearOrden({
      cliente_id: mockStore.clientes[0].id,
      tipo_trabajo_id: mockStore.tiposTrabajo[0].id,
      titulo: `Prueba Salto Omitida ${Date.now()}`,
      descripcion: "Prueba omitir etapa",
      cantidad: 500,
      prioridad: "normal",
      fecha_entrega: new Date().toISOString(),
      ruta: [
        mockStore.areas[0].id, // 1. Pre-prensa
        mockStore.areas[5].id, // 2. Troquelado (condicional/opcional)
        mockStore.areas[6].id, // 3. Corte
      ],
    });

    mockStore.liberarOrden(ordenId, mockStore.perfiles[0].id);

    const etapas = mockStore.etapas
      .filter((e) => e.orden_id === ordenId)
      .sort((a, b) => a.secuencia - b.secuencia);
    const etapa1 = etapas[0];
    const etapaTroquelado = etapas[1];
    const etapaCorte = etapas[2];

    // Omitir la etapa de troquelado con motivo
    mockStore.omitirEtapa(etapaTroquelado.id, "No aplica troquelado especial", mockStore.perfiles[0].id);
    expect(etapaTroquelado.estado).toBe("omitida");
    expect(etapaTroquelado.omitida_motivo).toBe("No aplica troquelado especial");

    // Completar etapa 1
    mockStore.iniciarEtapa(etapa1.id, mockStore.perfiles[0].id);
    mockStore.terminarEtapa(etapa1.id, mockStore.perfiles[0].id);

    // Debe saltarse la etapa 2 (troquelado) y haber activado directamente la etapa 3 (corte)
    const etapaCorteActualizada = mockStore.etapas.find((e) => e.id === etapaCorte.id)!;
    expect(etapaCorteActualizada.estado).toBe("en_cola");

    const ordenActual = mockStore.ordenes.find((o) => o.id === ordenId)!;
    expect(ordenActual.area_actual_id).toBe(etapaCorte.area_id);
  });

  test("3. salida/retorno proveedor: registra guías y estados de espera externa", async () => {
    const { id: ordenId } = mockStore.crearOrden({
      cliente_id: mockStore.clientes[0].id,
      tipo_trabajo_id: mockStore.tiposTrabajo[0].id,
      titulo: `Prueba Proveedor ${Date.now()}`,
      descripcion: "Barniz con proveedor externo",
      cantidad: 1500,
      acabado_ids: [mockStore.acabados[0].id],
      prioridad: "normal",
      fecha_entrega: new Date().toISOString(),
      ruta: [
        mockStore.areas[4].id, // Acabados especiales
      ],
    });

    mockStore.liberarOrden(ordenId, mockStore.perfiles[0].id);
    const etapa = mockStore.etapas.find((e) => e.orden_id === ordenId)!;

    mockStore.iniciarEtapa(etapa.id, mockStore.perfiles[0].id);
    expect(etapa.estado).toBe("en_proceso");

    // Registrar salida a proveedor
    const proveedor = mockStore.proveedores[0];
    const salidaRes = mockStore.salidaProveedor(
      etapa.id,
      proveedor.id,
      "GUIA-OUT-999",
      mockStore.perfiles[0].id
    );
    expect(salidaRes.ok).toBe(true);

    const etapaEnEspera = mockStore.etapas.find((e) => e.id === etapa.id)!;
    expect(etapaEnEspera.estado).toBe("esperando_proveedor");
    expect(etapaEnEspera.proveedor_id).toBe(proveedor.id);
    expect(etapaEnEspera.guia_salida).toBe("GUIA-OUT-999");

    // Registrar retorno de proveedor
    const retornoRes = mockStore.retornoProveedor(
      etapa.id,
      "GUIA-IN-888",
      mockStore.perfiles[0].id
    );
    expect(retornoRes.ok).toBe(true);

    const etapaRetornada = mockStore.etapas.find((e) => e.id === etapa.id)!;
    expect(etapaRetornada.estado).toBe("en_proceso");
    expect(etapaRetornada.guia_retorno).toBe("GUIA-IN-888");
  });

  test("4. completar_secado(): valida que no avanza si el secado sigue activo (a menos que se fuerce)", async () => {
    const { id: ordenId } = mockStore.crearOrden({
      cliente_id: mockStore.clientes[0].id,
      tipo_trabajo_id: mockStore.tiposTrabajo[0].id,
      titulo: `Prueba Secado ${Date.now()}`,
      descripcion: "Impresión con secado",
      cantidad: 2000,
      prioridad: "normal",
      fecha_entrega: new Date().toISOString(),
      ruta: [
        mockStore.areas[2].id, // Impresión Offset
        mockStore.areas[6].id, // Corte
      ],
    });

    mockStore.liberarOrden(ordenId, mockStore.perfiles[0].id);
    const etapaImpresion = mockStore.etapas.find(
      (e) => e.orden_id === ordenId && e.secuencia === 1
    )!;

    mockStore.iniciarEtapa(etapaImpresion.id, mockStore.perfiles[0].id);

    // Iniciar secado por 4 horas
    mockStore.iniciarSecado(etapaImpresion.id, 4, mockStore.perfiles[0].id);
    expect(etapaImpresion.estado).toBe("secando");
    expect(etapaImpresion.secado_hasta).toBeTruthy();

    // Intentar terminar o completar secado sin forzar cuando el tiempo no ha concluido debe fallar
    let falloSinForzar = false;
    try {
      mockStore.completarSecado(etapaImpresion.id, false, mockStore.perfiles[0].id);
    } catch (err: any) {
      falloSinForzar = true;
      expect(err.message).toContain("El tiempo de secado programado aún no concluye");
    }
    expect(falloSinForzar).toBeTruthy();

    // Forzar avance como supervisor/admin
    const resForzar = mockStore.completarSecado(etapaImpresion.id, true, mockStore.perfiles[0].id);
    expect(resForzar.ok).toBe(true);
    expect(etapaImpresion.estado).toBe("terminada");
  });

  test("5. rechazar_control_calidad(): crea nuevo intento, no sobreescribe el anterior, y el historial lo registra", async () => {
    const { id: ordenId } = mockStore.crearOrden({
      cliente_id: mockStore.clientes[0].id,
      tipo_trabajo_id: mockStore.tiposTrabajo[0].id,
      titulo: `Prueba Rechazo QC ${Date.now()}`,
      descripcion: "Prueba rechazo y reproceso",
      cantidad: 3000,
      prioridad: "normal",
      fecha_entrega: new Date().toISOString(),
      ruta: [
        mockStore.areas[2].id, // Impresión Offset
        mockStore.areas[6].id, // Corte
        mockStore.areas[8].id, // Control de Calidad
      ],
    });

    mockStore.liberarOrden(ordenId, mockStore.perfiles[0].id);
    const etapas = mockStore.etapas
      .filter((e) => e.orden_id === ordenId)
      .sort((a, b) => a.secuencia - b.secuencia);
    const etapaImpresion = etapas[0];
    const etapaCorte = etapas[1];
    const etapaQC = etapas[2];

    // Avanzar impresión y corte
    mockStore.iniciarEtapa(etapaImpresion.id, mockStore.perfiles[0].id);
    mockStore.terminarEtapa(etapaImpresion.id, mockStore.perfiles[0].id);

    mockStore.iniciarEtapa(etapaCorte.id, mockStore.perfiles[0].id);
    mockStore.terminarEtapa(etapaCorte.id, mockStore.perfiles[0].id);

    // Llegó a Control de Calidad en intento 1
    expect(etapaQC.intento).toBe(1);
    mockStore.iniciarEtapa(etapaQC.id, mockStore.perfiles[0].id);

    // Rechazar con motivo 'Falla de registro' enviando a Impresión
    const rechazoRes = mockStore.rechazarCalidad(
      etapaQC.id,
      etapaImpresion.area_id,
      "Falla de registro",
      50,
      mockStore.perfiles[0].id
    );

    expect(rechazoRes.ok).toBe(true);

    // 1. Debe incrementar intento en QC
    expect(etapaQC.intento).toBe(2);

    // 2. No sobreescribe el anterior: queda registro en rechazosCalidad
    const rechazoRegistrado = mockStore.rechazosCalidad.find((r) => r.orden_id === ordenId)!;
    expect(rechazoRegistrado).toBeTruthy();
    expect(rechazoRegistrado.motivo).toBe("Falla de registro");
    expect(rechazoRegistrado.cantidad_afectada).toBe(50);
    expect(rechazoRegistrado.area_destino_id).toBe(etapaImpresion.area_id);

    // 3. La orden regresa a Impresión
    const ordenRegresada = mockStore.ordenes.find((o) => o.id === ordenId)!;
    expect(ordenRegresada.area_actual_id).toBe(etapaImpresion.area_id);

    // 4. Etapa destino vuelve a estar 'en_cola'
    expect(etapaImpresion.estado).toBe("en_cola");

    // 5. Historial registra el evento 'rechazo_calidad'
    const eventoRechazo = mockStore.eventos.find(
      (ev) => ev.orden_id === ordenId && ev.tipo === "rechazo_calidad"
    )!;
    expect(eventoRechazo).toBeTruthy();
    const detalle = eventoRechazo.detalle as Record<string, any>;
    expect(detalle.motivo).toBe("Falla de registro");
    expect(detalle.intento).toBe(2);
  });

  test("6. Operador con múltiples áreas: opera en áreas asignadas y se restringe en no asignadas", async () => {
    const areaDiseno = mockStore.areas[0];
    const areaImpresion = mockStore.areas[2];
    const areaCorte = mockStore.areas[6];

    // Simular un operador con acceso únicamente a Diseño e Impresión
    const operadorId = "op-multi-test-id";
    mockStore.asignarAreasUsuario(operadorId, [areaDiseno.id, areaImpresion.id]);

    const areasAsignadas = mockStore.usuarioAreas
      .filter((ua) => ua.usuario_id === operadorId)
      .map((ua) => ua.area_id);

    // Puede operar en Diseño
    expect(areasAsignadas.includes(areaDiseno.id)).toBeTruthy();

    // Puede operar en Impresión
    expect(areasAsignadas.includes(areaImpresion.id)).toBeTruthy();

    // No tiene permiso en Corte
    expect(areasAsignadas.includes(areaCorte.id)).toBeFalsy();
  });
});

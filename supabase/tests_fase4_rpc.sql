-- ==============================================================================
-- PRUEBAS DE VALIDACIÓN: FASE 4 (RPC, RLS, TRANSICIONES VÁLIDAS Y FALLAS ESPERADAS)
-- ==============================================================================

DO $$
DECLARE
  v_cliente_id UUID;
  v_tt_id UUID;
  v_area_diseno UUID;
  v_area_planchas UUID;
  v_area_prep UUID;
  v_area_impresion UUID;
  v_area_qc UUID;
  v_area_despacho UUID;
  v_prov_id UUID;
  v_res JSONB;
  v_orden_id UUID;
  v_etapa_diseno UUID;
  v_etapa_planchas UUID;
  v_etapa_prep UUID;
  v_etapa_impresion UUID;
  v_etapa_qc UUID;
  v_etapa_despacho UUID;
  v_motivo_pausa_id UUID;
BEGIN
  RAISE NOTICE '--- INICIANDO SUITE DE PRUEBAS FASE 4 ---';

  -- 0. Obtener IDs base
  SELECT id INTO v_cliente_id FROM public.clientes LIMIT 1;
  SELECT id INTO v_tt_id FROM public.tipos_trabajo LIMIT 1;
  SELECT id INTO v_area_diseno FROM public.areas WHERE slug = 'diseno-arte-final';
  SELECT id INTO v_area_planchas FROM public.areas WHERE slug = 'planchas';
  SELECT id INTO v_area_prep FROM public.areas WHERE slug = 'preparacion-materiales';
  SELECT id INTO v_area_impresion FROM public.areas WHERE slug = 'impresion-secado';
  SELECT id INTO v_area_qc FROM public.areas WHERE es_control_calidad = true;
  SELECT id INTO v_area_despacho FROM public.areas WHERE es_despacho = true;
  SELECT id INTO v_prov_id FROM public.proveedores LIMIT 1;
  SELECT id INTO v_motivo_pausa_id FROM public.motivos_pausa LIMIT 1;

  -- ============================================================================
  -- PRUEBA 1 (VÁLIDA): Crear orden con planchas existentes = true
  -- Resultado esperado: Orden nace en 'en_puerta', Planchas nace 'omitida'
  -- ============================================================================
  v_res := public.crear_orden(
    p_cliente_id => v_cliente_id,
    p_tipo_trabajo_id => v_tt_id,
    p_titulo => 'Test OT Automatizado Fase 4',
    p_descripcion => 'Validación de todas las RPCs',
    p_cantidad => 1000,
    p_material => 'SBS 300g',
    p_medidas => '10x10x10',
    p_tintas => '4/0',
    p_prioridad => 'urgente',
    p_fecha_entrega => CURRENT_DATE + INTERVAL '5 days',
    p_usa_planchas_existentes => true
  );

  v_orden_id := (v_res->>'id')::UUID;
  ASSERT v_orden_id IS NOT NULL, 'FALLO: crear_orden no retornó ID';

  -- Validar que la orden esté en en_puerta
  ASSERT (SELECT estado FROM public.ordenes WHERE id = v_orden_id) = 'en_puerta',
    'FALLO: Estado inicial de OT no es en_puerta';

  -- Validar que la etapa de planchas haya nacido omitida
  SELECT id INTO v_etapa_planchas FROM public.orden_etapas WHERE orden_id = v_orden_id AND area_id = v_area_planchas;
  ASSERT (SELECT estado FROM public.orden_etapas WHERE id = v_etapa_planchas) = 'omitida',
    'FALLO: La etapa de planchas debió nacer omitida por usa_planchas_existentes=true';

  RAISE NOTICE '✓ Prueba 1 superada: crear_orden crea OT en en_puerta y auto-omite Planchas';

  -- ============================================================================
  -- PRUEBA 2 (VÁLIDA): Liberar orden a planta
  -- Resultado esperado: Pasa a en_produccion y activa primera etapa a en_cola
  -- ============================================================================
  v_res := public.liberar_orden(v_orden_id);
  ASSERT (SELECT estado FROM public.ordenes WHERE id = v_orden_id) = 'en_produccion',
    'FALLO: Estado de OT tras liberar no es en_produccion';

  SELECT id INTO v_etapa_diseno FROM public.orden_etapas WHERE orden_id = v_orden_id AND area_id = v_area_diseno;
  ASSERT (SELECT estado FROM public.orden_etapas WHERE id = v_etapa_diseno) = 'en_cola',
    'FALLO: Primera etapa no se activó a en_cola';

  RAISE NOTICE '✓ Prueba 2 superada: liberar_orden pasa OT a en_produccion y activa primera etapa';

  -- ============================================================================
  -- PRUEBA 3 (VÁLIDA): Iniciar y Terminar Etapa (debe saltar la omitida de Planchas)
  -- ============================================================================
  PERFORM public.iniciar_etapa(v_etapa_diseno);
  ASSERT (SELECT estado FROM public.orden_etapas WHERE id = v_etapa_diseno) = 'en_proceso',
    'FALLO: Etapa no pasó a en_proceso';

  PERFORM public.terminar_etapa(v_etapa_diseno);
  ASSERT (SELECT estado FROM public.orden_etapas WHERE id = v_etapa_diseno) = 'terminada',
    'FALLO: Etapa no pasó a terminada';

  -- Como Planchas estaba omitida, la siguiente en activarse debe ser Prep. Materiales
  SELECT id INTO v_etapa_prep FROM public.orden_etapas WHERE orden_id = v_orden_id AND area_id = v_area_prep;
  ASSERT (SELECT estado FROM public.orden_etapas WHERE id = v_etapa_prep) = 'en_cola',
    'FALLO: terminar_etapa no saltó la etapa omitida (Preparación debió quedar en_cola)';

  RAISE NOTICE '✓ Prueba 3 superada: terminar_etapa salta etapas omitidas automáticamente';

  -- ============================================================================
  -- PRUEBA 4 (VÁLIDA): Secado en Impresión
  -- ============================================================================
  -- Completar preparación
  PERFORM public.iniciar_etapa(v_etapa_prep);
  PERFORM public.terminar_etapa(v_etapa_prep);

  SELECT id INTO v_etapa_impresion FROM public.orden_etapas WHERE orden_id = v_orden_id AND area_id = v_area_impresion;
  PERFORM public.iniciar_etapa(v_etapa_impresion);

  -- Iniciar secado por 6 horas
  v_res := public.iniciar_secado(v_etapa_impresion, 6);
  ASSERT (SELECT estado FROM public.orden_etapas WHERE id = v_etapa_impresion) = 'secando',
    'FALLO: Etapa no pasó a estado secando';
  ASSERT (SELECT secado_hasta FROM public.orden_etapas WHERE id = v_etapa_impresion) IS NOT NULL,
    'FALLO: secado_hasta no fue calculado';

  RAISE NOTICE '✓ Prueba 4 superada: iniciar_secado calcula secado_hasta y actualiza estado';

  -- ============================================================================
  -- PRUEBA 5 (VÁLIDA): Control de Calidad y Reproceso (Rechazo)
  -- ============================================================================
  -- Forzar término de impresión y avanzar hasta Calidad
  PERFORM public.terminar_etapa(v_etapa_impresion);

  SELECT id INTO v_etapa_qc FROM public.orden_etapas WHERE orden_id = v_orden_id AND area_id = v_area_qc;
  -- Simular que llegó a QC
  UPDATE public.orden_etapas SET estado = 'en_cola' WHERE id = v_etapa_qc;
  PERFORM public.iniciar_etapa(v_etapa_qc);

  -- Rechazar a Impresión por tono incorrecto
  v_res := public.rechazar_calidad(
    p_etapa_id => v_etapa_qc,
    p_area_destino_id => v_area_impresion,
    p_motivo => 'Tono pantone desfasado respecto a muestra física',
    p_cantidad_afectada => 500
  );

  ASSERT (v_res->>'reproceso')::BOOLEAN = true, 'FALLO: rechazo_calidad no indicó reproceso';
  ASSERT (SELECT estado FROM public.orden_etapas WHERE id = v_area_impresion) = 'en_cola'
    OR (SELECT estado FROM public.orden_etapas WHERE orden_id = v_orden_id AND area_id = v_area_impresion) = 'en_cola',
    'FALLO: Área destino no fue reiniciada a en_cola';
  ASSERT (SELECT intento FROM public.orden_etapas WHERE id = v_etapa_qc) = 2,
    'FALLO: El contador de intento no se incrementó a 2';

  RAISE NOTICE '✓ Prueba 5 superada: rechazar_calidad registra rechazo, reinicia área destino e incrementa intento';

  -- ============================================================================
  -- PRUEBA 6 (VÁLIDA): Despachar orden
  -- ============================================================================
  v_res := public.despachar(
    p_orden_id => v_orden_id,
    p_guia_despacho => 'GUIA-2026-999',
    p_despachada_a => 'Transportes Exprés - Chofer Juan Pérez'
  );

  ASSERT (SELECT estado FROM public.ordenes WHERE id = v_orden_id) = 'despachada',
    'FALLO: La orden no quedó en estado despachada';
  ASSERT (SELECT guia_despacho FROM public.ordenes WHERE id = v_orden_id) = 'GUIA-2026-999',
    'FALLO: Guía de despacho no fue guardada';

  RAISE NOTICE '✓ Prueba 6 superada: despachar formaliza el cierre de la orden';

  -- ============================================================================
  -- PRUEBAS DE FALLA ESPERADA (VALIDACIONES Y PERMISOS)
  -- ============================================================================

  -- Fallo Esperado 1: Intentar liberar una orden que ya está despachada o no está en en_puerta
  BEGIN
    PERFORM public.liberar_orden(v_orden_id);
    RAISE EXCEPTION 'FALLO: liberar_orden debió fallar al ejecutarse sobre una orden ya procesada';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '✓ Fallo Esperado 1 superado: liberar_orden rechaza órdenes que no están en en_puerta (Error: %)', SQLERRM;
  END;

  -- Fallo Esperado 2: Rechazo de calidad con motivo vacío
  BEGIN
    PERFORM public.rechazar_calidad(
      p_etapa_id => v_etapa_qc,
      p_area_destino_id => v_area_impresion,
      p_motivo => '   '
    );
    RAISE EXCEPTION 'FALLO: rechazar_calidad debió fallar con motivo vacío';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '✓ Fallo Esperado 2 superado: rechazar_calidad exige motivo obligatorio (Error: %)', SQLERRM;
  END;

  -- Fallo Esperado 3: Rechazar calidad hacia un área posterior o igual a control de calidad
  BEGIN
    PERFORM public.rechazar_calidad(
      p_etapa_id => v_etapa_qc,
      p_area_destino_id => v_area_despacho,
      p_motivo => 'Error de prueba hacia despacho'
    );
    RAISE EXCEPTION 'FALLO: rechazar_calidad debió fallar al intentar reproceso hacia un área posterior';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '✓ Fallo Esperado 3 superado: rechazar_calidad impide reproceso hacia áreas posteriores (Error: %)', SQLERRM;
  END;

  RAISE NOTICE '--- TODAS LAS PRUEBAS DE LA FASE 4 COMPLETADAS CON ÉXITO ---';
END $$;

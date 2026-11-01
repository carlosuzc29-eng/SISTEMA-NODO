-- ==============================================================================
-- FASE 4: FUNCIONES RPC Y POLÍTICAS RLS (Flujo Real de Imprenta de 11 Áreas)
-- ==============================================================================

-- 1. FUNCIONES AUXILIARES DE SEGURIDAD
-- 1.1 Obtener todas las áreas asignadas al usuario actual (vía usuario_areas o profiles)
CREATE OR REPLACE FUNCTION public.auth_areas()
RETURNS SETOF UUID AS $$
  SELECT area_id FROM public.usuario_areas WHERE usuario_id = auth.uid()
  UNION
  SELECT area_id FROM public.profiles WHERE id = auth.uid() AND area_id IS NOT NULL;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 1.2 Verificar si el usuario actual pertenece a un área específica
CREATE OR REPLACE FUNCTION public.auth_pertenece_a_area(p_area_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuario_areas WHERE usuario_id = auth.uid() AND area_id = p_area_id
    UNION
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND area_id = p_area_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 2. ACTUALIZACIÓN DE POLÍTICAS RLS
-- ==============================================================================

-- 2.1 Tabla ordenes
DROP POLICY IF EXISTS "Lectura de ordenes" ON public.ordenes;
CREATE POLICY "Lectura de ordenes"
  ON public.ordenes FOR SELECT TO authenticated
  USING (
    public.auth_rol() IN ('admin', 'recepcion', 'supervisor')
    OR id IN (
      SELECT orden_id FROM public.orden_etapas WHERE area_id IN (SELECT public.auth_areas())
    )
  );

-- 2.2 Tabla orden_etapas
DROP POLICY IF EXISTS "Lectura de etapas" ON public.orden_etapas;
CREATE POLICY "Lectura de etapas"
  ON public.orden_etapas FOR SELECT TO authenticated
  USING (
    public.auth_rol() IN ('admin', 'recepcion', 'supervisor')
    OR area_id IN (SELECT public.auth_areas())
  );

DROP POLICY IF EXISTS "Operar etapas" ON public.orden_etapas;
CREATE POLICY "Operar etapas"
  ON public.orden_etapas FOR UPDATE TO authenticated
  USING (
    public.auth_rol() IN ('admin', 'supervisor')
    OR area_id IN (SELECT public.auth_areas())
  );

-- 2.3 Tabla usuario_areas
ALTER TABLE public.usuario_areas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura de usuario_areas" ON public.usuario_areas;
CREATE POLICY "Lectura de usuario_areas"
  ON public.usuario_areas FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin gestiona usuario_areas" ON public.usuario_areas;
CREATE POLICY "Admin gestiona usuario_areas"
  ON public.usuario_areas FOR ALL TO authenticated
  USING (public.auth_rol() = 'admin')
  WITH CHECK (public.auth_rol() = 'admin');

-- 2.4 Tabla proveedores
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura de proveedores" ON public.proveedores;
CREATE POLICY "Lectura de proveedores"
  ON public.proveedores FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin y supervisor gestionan proveedores" ON public.proveedores;
CREATE POLICY "Admin y supervisor gestionan proveedores"
  ON public.proveedores FOR ALL TO authenticated
  USING (public.auth_rol() IN ('admin', 'supervisor'))
  WITH CHECK (public.auth_rol() IN ('admin', 'supervisor'));

-- 2.5 Tabla acabados
ALTER TABLE public.acabados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura de acabados" ON public.acabados;
CREATE POLICY "Lectura de acabados"
  ON public.acabados FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin y supervisor gestionan acabados" ON public.acabados;
CREATE POLICY "Admin y supervisor gestionan acabados"
  ON public.acabados FOR ALL TO authenticated
  USING (public.auth_rol() IN ('admin', 'supervisor'))
  WITH CHECK (public.auth_rol() IN ('admin', 'supervisor'));

-- 2.6 Tabla orden_acabados
ALTER TABLE public.orden_acabados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura de orden_acabados" ON public.orden_acabados;
CREATE POLICY "Lectura de orden_acabados"
  ON public.orden_acabados FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Gestionar orden_acabados" ON public.orden_acabados;
CREATE POLICY "Gestionar orden_acabados"
  ON public.orden_acabados FOR ALL TO authenticated
  USING (public.auth_rol() IN ('admin', 'recepcion', 'supervisor'))
  WITH CHECK (public.auth_rol() IN ('admin', 'recepcion', 'supervisor'));

-- 2.7 Tabla rechazos_calidad
ALTER TABLE public.rechazos_calidad ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura de rechazos_calidad" ON public.rechazos_calidad;
CREATE POLICY "Lectura de rechazos_calidad"
  ON public.rechazos_calidad FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Crear rechazos_calidad" ON public.rechazos_calidad;
CREATE POLICY "Crear rechazos_calidad"
  ON public.rechazos_calidad FOR INSERT TO authenticated
  WITH CHECK (public.auth_rol() IN ('admin', 'supervisor', 'operador'));

-- ==============================================================================
-- 3. FUNCIONES RPC DE PRODUCCIÓN (SECURITY DEFINER)
-- ==============================================================================

-- 3.1 RPC: crear_orden (Soporte multi-área, acabados, planchas y estado en_puerta)
CREATE OR REPLACE FUNCTION public.crear_orden(
  p_cliente_id UUID,
  p_tipo_trabajo_id UUID,
  p_titulo TEXT,
  p_descripcion TEXT,
  p_cantidad INT,
  p_material TEXT,
  p_medidas TEXT,
  p_tintas TEXT,
  p_acabados TEXT DEFAULT NULL,
  p_prioridad public.prioridad_ot DEFAULT 'normal',
  p_fecha_entrega DATE DEFAULT CURRENT_DATE + INTERVAL '3 days',
  p_ruta UUID[] DEFAULT NULL,
  p_usa_planchas_existentes BOOLEAN DEFAULT FALSE,
  p_acabados_ids UUID[] DEFAULT NULL,
  p_notas_acabado TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_orden_id UUID;
  v_codigo TEXT;
  v_ruta UUID[];
  v_area_id UUID;
  v_area RECORD;
  v_sec INT := 1;
  v_user_id UUID := auth.uid();
  v_estado_etapa public.estado_etapa;
  v_omitida_motivo TEXT;
  v_acabado_id UUID;
BEGIN
  -- Validar permisos de creación (admin, recepcion, supervisor)
  IF public.auth_rol() NOT IN ('admin', 'recepcion', 'supervisor') THEN
    RAISE EXCEPTION 'No tienes permisos para crear órdenes de trabajo.';
  END IF;

  -- Resolver ruta de áreas
  IF p_ruta IS NOT NULL AND array_length(p_ruta, 1) > 0 THEN
    v_ruta := p_ruta;
  ELSE
    SELECT ruta INTO v_ruta FROM public.tipos_trabajo WHERE id = p_tipo_trabajo_id;
  END IF;

  IF v_ruta IS NULL OR array_length(v_ruta, 1) = 0 THEN
    RAISE EXCEPTION 'La ruta de producción debe contener al menos un área.';
  END IF;

  -- 1. Insertar orden con estado inicial 'en_puerta'
  INSERT INTO public.ordenes (
    cliente_id, tipo_trabajo_id, titulo, descripcion, cantidad,
    material, medidas, tintas, acabados, prioridad, fecha_entrega,
    estado, area_actual_id, creada_por, usa_planchas_existentes, notas_acabado
  ) VALUES (
    p_cliente_id, p_tipo_trabajo_id, p_titulo, p_descripcion, p_cantidad,
    p_material, p_medidas, p_tintas, p_acabados, p_prioridad, p_fecha_entrega,
    'en_puerta'::public.estado_ot, NULL, v_user_id, p_usa_planchas_existentes, p_notas_acabado
  ) RETURNING id, codigo INTO v_orden_id, v_codigo;

  -- 2. Insertar acabados seleccionados en orden_acabados
  IF p_acabados_ids IS NOT NULL AND array_length(p_acabados_ids, 1) > 0 THEN
    FOREACH v_acabado_id IN ARRAY p_acabados_ids LOOP
      INSERT INTO public.orden_acabados (orden_id, acabado_id)
      VALUES (v_orden_id, v_acabado_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- 3. Crear etapas según ruta con auto-omisión de etapas condicionales
  FOREACH v_area_id IN ARRAY v_ruta LOOP
    SELECT * INTO v_area FROM public.areas WHERE id = v_area_id;

    v_estado_etapa := 'bloqueada'::public.estado_etapa;
    v_omitida_motivo := NULL;

    -- Si el área es Planchas y se marcaron planchas existentes, se omite automáticamente
    IF v_area.slug = 'planchas' AND p_usa_planchas_existentes THEN
      v_estado_etapa := 'omitida'::public.estado_etapa;
      v_omitida_motivo := 'Usa planchas existentes';
    -- Si el área es Acabado y no se seleccionaron acabados, se omite automáticamente
    ELSIF v_area.slug = 'acabado' AND (p_acabados_ids IS NULL OR array_length(p_acabados_ids, 1) IS NULL) THEN
      v_estado_etapa := 'omitida'::public.estado_etapa;
      v_omitida_motivo := 'Sin acabados especiales';
    END IF;

    INSERT INTO public.orden_etapas (
      orden_id, area_id, secuencia, estado, omitida_motivo, intento
    ) VALUES (
      v_orden_id, v_area_id, v_sec, v_estado_etapa, v_omitida_motivo, 1
    );

    v_sec := v_sec + 1;
  END LOOP;

  -- 4. Registrar evento inmutable de creación
  INSERT INTO public.eventos_orden (
    orden_id, usuario_id, tipo, detalle
  ) VALUES (
    v_orden_id, v_user_id, 'creada',
    jsonb_build_object(
      'codigo', v_codigo,
      'titulo', p_titulo,
      'cantidad', p_cantidad,
      'estado', 'en_puerta',
      'usa_planchas_existentes', p_usa_planchas_existentes,
      'acabados_count', COALESCE(array_length(p_acabados_ids, 1), 0)
    )
  );

  RETURN jsonb_build_object('ok', true, 'id', v_orden_id, 'codigo', v_codigo);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.2 RPC: liberar_orden (Pasa de en_puerta a en_produccion y activa la primera etapa no omitida)
CREATE OR REPLACE FUNCTION public.liberar_orden(p_orden_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_orden RECORD;
  v_primera_etapa RECORD;
  v_user_id UUID := auth.uid();
BEGIN
  IF public.auth_rol() NOT IN ('admin', 'recepcion', 'supervisor') THEN
    RAISE EXCEPTION 'No tienes permisos para liberar órdenes de trabajo a planta.';
  END IF;

  SELECT * INTO v_orden FROM public.ordenes WHERE id = p_orden_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orden de trabajo no encontrada.';
  END IF;

  IF v_orden.estado != 'en_puerta' THEN
    RAISE EXCEPTION 'Solo se pueden liberar órdenes que estén en estado "En puerta" (Estado actual: %).', v_orden.estado;
  END IF;

  -- Buscar la primera etapa activa no omitida
  SELECT oe.*, a.nombre AS area_nombre INTO v_primera_etapa
  FROM public.orden_etapas oe
  JOIN public.areas a ON a.id = oe.area_id
  WHERE oe.orden_id = p_orden_id AND oe.estado != 'omitida'
  ORDER BY oe.secuencia ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La orden no tiene ninguna etapa activa para iniciar.';
  END IF;

  -- Activar primera etapa en cola
  UPDATE public.orden_etapas
  SET estado = 'en_cola'::public.estado_etapa,
      updated_at = now()
  WHERE id = v_primera_etapa.id;

  -- Actualizar orden a en_produccion
  UPDATE public.ordenes
  SET estado = 'en_produccion'::public.estado_ot,
      area_actual_id = v_primera_etapa.area_id,
      liberada_en = now(),
      liberada_por = v_user_id,
      updated_at = now()
  WHERE id = p_orden_id;

  -- Registrar evento
  INSERT INTO public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  VALUES (
    p_orden_id, v_primera_etapa.id, v_user_id, 'liberada',
    jsonb_build_object(
      'mensaje', 'Orden liberada a planta',
      'area_inicial', v_primera_etapa.area_nombre,
      'secuencia', v_primera_etapa.secuencia
    )
  );

  RETURN jsonb_build_object('ok', true, 'area_id', v_primera_etapa.area_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.3 RPC: iniciar_etapa
CREATE OR REPLACE FUNCTION public.iniciar_etapa(p_etapa_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_etapa RECORD;
  v_user_id UUID := auth.uid();
  v_rol public.rol_usuario;
BEGIN
  SELECT e.*, o.codigo, a.nombre AS area_nombre, a.tipo_espera
  INTO v_etapa
  FROM public.orden_etapas e
  JOIN public.ordenes o ON o.id = e.orden_id
  JOIN public.areas a ON a.id = e.area_id
  WHERE e.id = p_etapa_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Etapa no encontrada.';
  END IF;

  IF v_etapa.estado IN ('omitida', 'terminada') THEN
    RAISE EXCEPTION 'La etapa no se puede iniciar en estado %.', v_etapa.estado;
  END IF;

  v_rol := public.auth_rol();
  IF v_rol = 'operador' AND NOT public.auth_pertenece_a_area(v_etapa.area_id) THEN
    RAISE EXCEPTION 'No tienes permisos para operar en esta área.';
  END IF;

  UPDATE public.orden_etapas
  SET estado = 'en_proceso'::public.estado_etapa,
      operador_id = COALESCE(operador_id, v_user_id),
      iniciada_en = COALESCE(iniciada_en, now()),
      updated_at = now()
  WHERE id = p_etapa_id;

  UPDATE public.ordenes
  SET area_actual_id = v_etapa.area_id,
      estado = 'en_produccion'::public.estado_ot,
      updated_at = now()
  WHERE id = v_etapa.orden_id;

  INSERT INTO public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  VALUES (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'iniciada',
    jsonb_build_object('area', v_etapa.area_nombre, 'secuencia', v_etapa.secuencia)
  );

  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.4 RPC: pausar_etapa
CREATE OR REPLACE FUNCTION public.pausar_etapa(
  p_etapa_id UUID,
  p_motivo_id UUID,
  p_nota TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_etapa RECORD;
  v_motivo_texto TEXT;
  v_user_id UUID := auth.uid();
BEGIN
  SELECT e.*, a.nombre AS area_nombre INTO v_etapa
  FROM public.orden_etapas e
  JOIN public.areas a ON a.id = e.area_id
  WHERE e.id = p_etapa_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Etapa no encontrada.';
  END IF;

  IF public.auth_rol() = 'operador' AND NOT public.auth_pertenece_a_area(v_etapa.area_id) THEN
    RAISE EXCEPTION 'No tienes permisos para pausar esta etapa.';
  END IF;

  SELECT texto INTO v_motivo_texto FROM public.motivos_pausa WHERE id = p_motivo_id;

  UPDATE public.orden_etapas
  SET estado = 'pausada'::public.estado_etapa,
      motivo_pausa_id = p_motivo_id,
      nota_pausa = p_nota,
      updated_at = now()
  WHERE id = p_etapa_id;

  INSERT INTO public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  VALUES (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'pausada',
    jsonb_build_object(
      'motivo', COALESCE(v_motivo_texto, 'Pausa operativa'),
      'nota', p_nota,
      'area', v_etapa.area_nombre
    )
  );

  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.5 RPC: reanudar_etapa
CREATE OR REPLACE FUNCTION public.reanudar_etapa(p_etapa_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_etapa RECORD;
  v_user_id UUID := auth.uid();
BEGIN
  SELECT e.*, a.nombre AS area_nombre INTO v_etapa
  FROM public.orden_etapas e
  JOIN public.areas a ON a.id = e.area_id
  WHERE e.id = p_etapa_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Etapa no encontrada.';
  END IF;

  IF public.auth_rol() = 'operador' AND NOT public.auth_pertenece_a_area(v_etapa.area_id) THEN
    RAISE EXCEPTION 'No tienes permisos para reanudar esta etapa.';
  END IF;

  UPDATE public.orden_etapas
  SET estado = 'en_proceso'::public.estado_etapa,
      motivo_pausa_id = NULL,
      nota_pausa = NULL,
      updated_at = now()
  WHERE id = p_etapa_id;

  INSERT INTO public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  VALUES (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'reanudada',
    jsonb_build_object('area', v_etapa.area_nombre)
  );

  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.6 RPC: enviar_a_proveedor (Tercerización de acabados)
CREATE OR REPLACE FUNCTION public.enviar_a_proveedor(
  p_etapa_id UUID,
  p_proveedor_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_etapa RECORD;
  v_proveedor RECORD;
  v_user_id UUID := auth.uid();
BEGIN
  SELECT e.*, a.nombre AS area_nombre INTO v_etapa
  FROM public.orden_etapas e
  JOIN public.areas a ON a.id = e.area_id
  WHERE e.id = p_etapa_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Etapa no encontrada.';
  END IF;

  IF public.auth_rol() = 'operador' AND NOT public.auth_pertenece_a_area(v_etapa.area_id) THEN
    RAISE EXCEPTION 'No tienes permisos para gestionar proveedores en esta área.';
  END IF;

  SELECT * INTO v_proveedor FROM public.proveedores WHERE id = p_proveedor_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proveedor no encontrado.';
  END IF;

  UPDATE public.orden_etapas
  SET estado = 'esperando_proveedor'::public.estado_etapa,
      proveedor_id = p_proveedor_id,
      enviado_proveedor_en = now(),
      updated_at = now()
  WHERE id = p_etapa_id;

  INSERT INTO public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  VALUES (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'enviado_proveedor',
    jsonb_build_object(
      'proveedor_id', p_proveedor_id,
      'proveedor_nombre', v_proveedor.nombre,
      'area', v_etapa.area_nombre,
      'fecha_envio', now()
    )
  );

  RETURN jsonb_build_object('ok', true, 'proveedor', v_proveedor.nombre);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.7 RPC: recibir_de_proveedor
CREATE OR REPLACE FUNCTION public.recibir_de_proveedor(p_etapa_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_etapa RECORD;
  v_proveedor_nombre TEXT;
  v_user_id UUID := auth.uid();
BEGIN
  SELECT e.*, a.nombre AS area_nombre, p.nombre AS prov_nombre
  INTO v_etapa
  FROM public.orden_etapas e
  JOIN public.areas a ON a.id = e.area_id
  LEFT JOIN public.proveedores p ON p.id = e.proveedor_id
  WHERE e.id = p_etapa_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Etapa no encontrada.';
  END IF;

  IF public.auth_rol() = 'operador' AND NOT public.auth_pertenece_a_area(v_etapa.area_id) THEN
    RAISE EXCEPTION 'No tienes permisos para recibir trabajos en esta área.';
  END IF;

  IF v_etapa.estado != 'esperando_proveedor' THEN
    RAISE EXCEPTION 'La etapa no se encuentra en espera de proveedor (Estado actual: %).', v_etapa.estado;
  END IF;

  UPDATE public.orden_etapas
  SET estado = 'en_proceso'::public.estado_etapa,
      recibido_proveedor_en = now(),
      updated_at = now()
  WHERE id = p_etapa_id;

  INSERT INTO public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  VALUES (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'recibido_proveedor',
    jsonb_build_object(
      'proveedor_nombre', COALESCE(v_etapa.prov_nombre, 'Proveedor externo'),
      'area', v_etapa.area_nombre,
      'fecha_recepcion', now()
    )
  );

  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.8 RPC: iniciar_secado (Tiempo de espera en prensa)
CREATE OR REPLACE FUNCTION public.iniciar_secado(
  p_etapa_id UUID,
  p_horas NUMERIC DEFAULT 4
)
RETURNS JSONB AS $$
DECLARE
  v_etapa RECORD;
  v_secado_hasta TIMESTAMPTZ;
  v_user_id UUID := auth.uid();
BEGIN
  SELECT e.*, a.nombre AS area_nombre INTO v_etapa
  FROM public.orden_etapas e
  JOIN public.areas a ON a.id = e.area_id
  WHERE e.id = p_etapa_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Etapa no encontrada.';
  END IF;

  IF public.auth_rol() = 'operador' AND NOT public.auth_pertenece_a_area(v_etapa.area_id) THEN
    RAISE EXCEPTION 'No tienes permisos para registrar secado en esta área.';
  END IF;

  v_secado_hasta := now() + (COALESCE(p_horas, 4)::TEXT || ' hours')::INTERVAL;

  UPDATE public.orden_etapas
  SET estado = 'secando'::public.estado_etapa,
      secado_hasta = v_secado_hasta,
      updated_at = now()
  WHERE id = p_etapa_id;

  INSERT INTO public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  VALUES (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'secando',
    jsonb_build_object(
      'horas', p_horas,
      'secado_hasta', v_secado_hasta,
      'area', v_etapa.area_nombre
    )
  );

  RETURN jsonb_build_object('ok', true, 'secado_hasta', v_secado_hasta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.9 RPC: terminar_etapa (Validación de secado, salto de omitidas y pase a lista_despacho)
CREATE OR REPLACE FUNCTION public.terminar_etapa(p_etapa_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_etapa RECORD;
  v_siguiente RECORD;
  v_minutos INT := 0;
  v_user_id UUID := auth.uid();
  v_despacho_area_id UUID;
BEGIN
  SELECT e.*, a.nombre AS area_nombre, a.tipo_espera
  INTO v_etapa
  FROM public.orden_etapas e
  JOIN public.areas a ON a.id = e.area_id
  WHERE e.id = p_etapa_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Etapa no encontrada.';
  END IF;

  -- Validar permisos de operador
  IF public.auth_rol() = 'operador' AND NOT public.auth_pertenece_a_area(v_etapa.area_id) THEN
    RAISE EXCEPTION 'No tienes permisos para terminar etapas en esta área.';
  END IF;

  -- Validación de secado: si está secando y aún no vence el tiempo, solo supervisor/admin puede forzar
  IF v_etapa.estado = 'secando' AND v_etapa.secado_hasta IS NOT NULL AND now() < v_etapa.secado_hasta THEN
    IF public.auth_rol() NOT IN ('admin', 'supervisor') THEN
      RAISE EXCEPTION 'El material aún está en tiempo de secado (hasta %). Solo un supervisor o admin puede forzar el avance.', v_etapa.secado_hasta;
    END IF;
  END IF;

  IF v_etapa.iniciada_en IS NOT NULL THEN
    v_minutos := GREATEST(1, ROUND(EXTRACT(EPOCH FROM (now() - v_etapa.iniciada_en)) / 60));
  END IF;

  -- 1. Marcar etapa actual como terminada
  UPDATE public.orden_etapas
  SET estado = 'terminada'::public.estado_etapa,
      terminada_en = now(),
      minutos_trabajados = COALESCE(minutos_trabajados, 0) + v_minutos,
      updated_at = now()
  WHERE id = p_etapa_id;

  -- 2. Buscar siguiente etapa activa (no omitida)
  SELECT oe.* INTO v_siguiente
  FROM public.orden_etapas oe
  WHERE oe.orden_id = v_etapa.orden_id
    AND oe.secuencia > v_etapa.secuencia
    AND oe.estado != 'omitida'
  ORDER BY oe.secuencia ASC
  LIMIT 1;

  IF FOUND THEN
    -- Activar la siguiente etapa
    UPDATE public.orden_etapas
    SET estado = 'en_cola'::public.estado_etapa,
        updated_at = now()
    WHERE id = v_siguiente.id;

    -- Actualizar área actual de la orden
    UPDATE public.ordenes
    SET area_actual_id = v_siguiente.area_id,
        updated_at = now()
    WHERE id = v_etapa.orden_id;
  ELSE
    -- Era la última etapa operativa: pasa a lista_despacho
    SELECT id INTO v_despacho_area_id
    FROM public.areas
    WHERE es_despacho = true AND activa = true
    LIMIT 1;

    UPDATE public.ordenes
    SET estado = 'lista_despacho'::public.estado_ot,
        area_actual_id = v_despacho_area_id,
        updated_at = now()
    WHERE id = v_etapa.orden_id;
  END IF;

  -- Registrar evento
  INSERT INTO public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  VALUES (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'terminada',
    jsonb_build_object(
      'area', v_etapa.area_nombre,
      'minutos_trabajados', v_minutos,
      'es_final', (NOT FOUND)
    )
  );

  RETURN jsonb_build_object('ok', true, 'es_final', (NOT FOUND));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.10 RPC: omitir_etapa (Solo supervisor/admin u operador autorizado)
CREATE OR REPLACE FUNCTION public.omitir_etapa(
  p_etapa_id UUID,
  p_motivo TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_etapa RECORD;
  v_siguiente RECORD;
  v_user_id UUID := auth.uid();
  v_despacho_area_id UUID;
BEGIN
  IF public.auth_rol() NOT IN ('admin', 'supervisor') THEN
    RAISE EXCEPTION 'Solo un supervisor o administrador puede omitir etapas de producción.';
  END IF;

  SELECT e.*, a.nombre AS area_nombre INTO v_etapa
  FROM public.orden_etapas e
  JOIN public.areas a ON a.id = e.area_id
  WHERE e.id = p_etapa_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Etapa no encontrada.';
  END IF;

  IF v_etapa.estado = 'terminada' THEN
    RAISE EXCEPTION 'Una etapa terminada no se puede omitir.';
  END IF;

  -- Marcar como omitida
  UPDATE public.orden_etapas
  SET estado = 'omitida'::public.estado_etapa,
      omitida_motivo = p_motivo,
      updated_at = now()
  WHERE id = p_etapa_id;

  -- Si la etapa estaba en_cola o en_proceso, avanzar la orden a la siguiente no omitida
  IF v_etapa.estado IN ('en_cola', 'en_proceso', 'pausada', 'secando', 'esperando_proveedor') THEN
    SELECT oe.* INTO v_siguiente
    FROM public.orden_etapas oe
    WHERE oe.orden_id = v_etapa.orden_id
      AND oe.secuencia > v_etapa.secuencia
      AND oe.estado != 'omitida'
    ORDER BY oe.secuencia ASC
    LIMIT 1;

    IF FOUND THEN
      UPDATE public.orden_etapas
      SET estado = 'en_cola'::public.estado_etapa,
          updated_at = now()
      WHERE id = v_siguiente.id;

      UPDATE public.ordenes
      SET area_actual_id = v_siguiente.area_id,
          updated_at = now()
      WHERE id = v_etapa.orden_id;
    ELSE
      SELECT id INTO v_despacho_area_id
      FROM public.areas
      WHERE es_despacho = true AND activa = true
      LIMIT 1;

      UPDATE public.ordenes
      SET estado = 'lista_despacho'::public.estado_ot,
          area_actual_id = v_despacho_area_id,
          updated_at = now()
      WHERE id = v_etapa.orden_id;
    END IF;
  END IF;

  INSERT INTO public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  VALUES (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'omitida',
    jsonb_build_object('area', v_etapa.area_nombre, 'motivo', p_motivo)
  );

  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.11 RPC: aprobar_calidad
CREATE OR REPLACE FUNCTION public.aprobar_calidad(p_etapa_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_etapa RECORD;
  v_area RECORD;
BEGIN
  SELECT e.*, a.es_control_calidad, a.nombre as area_nombre
  INTO v_etapa
  FROM public.orden_etapas e
  JOIN public.areas a ON a.id = e.area_id
  WHERE e.id = p_etapa_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Etapa no encontrada.';
  END IF;

  IF NOT v_etapa.es_control_calidad THEN
    RAISE EXCEPTION 'Esta función solo puede ejecutarse en el área de Control de Calidad.';
  END IF;

  IF public.auth_rol() = 'operador' AND NOT public.auth_pertenece_a_area(v_etapa.area_id) THEN
    RAISE EXCEPTION 'No tienes permisos en Control de Calidad.';
  END IF;

  RETURN public.terminar_etapa(p_etapa_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.12 RPC: rechazar_calidad (Reproceso a área previa con motivo obligatorio)
CREATE OR REPLACE FUNCTION public.rechazar_calidad(
  p_etapa_id UUID,
  p_area_destino_id UUID,
  p_motivo TEXT,
  p_cantidad_afectada INT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_etapa RECORD;
  v_etapa_destino RECORD;
  v_area_dest RECORD;
  v_user_id UUID := auth.uid();
  v_rechazo_id UUID;
  v_nuevo_intento INT;
BEGIN
  IF p_motivo IS NULL OR trim(p_motivo) = '' THEN
    RAISE EXCEPTION 'El motivo del rechazo es estrictamente obligatorio.';
  END IF;

  SELECT e.*, a.es_control_calidad, a.nombre AS area_nombre
  INTO v_etapa
  FROM public.orden_etapas e
  JOIN public.areas a ON a.id = e.area_id
  WHERE e.id = p_etapa_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Etapa no encontrada.';
  END IF;

  IF NOT v_etapa.es_control_calidad THEN
    RAISE EXCEPTION 'El rechazo solo puede registrarse desde el área de Control de Calidad.';
  END IF;

  IF public.auth_rol() = 'operador' AND NOT public.auth_pertenece_a_area(v_etapa.area_id) THEN
    RAISE EXCEPTION 'No tienes permisos de Control de Calidad.';
  END IF;

  -- Validar que el área destino esté en la ruta y sea anterior a control de calidad
  SELECT * INTO v_etapa_destino
  FROM public.orden_etapas
  WHERE orden_id = v_etapa.orden_id AND area_id = p_area_destino_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El área seleccionada no forma parte de la ruta de esta orden.';
  END IF;

  IF v_etapa_destino.secuencia >= v_etapa.secuencia THEN
    RAISE EXCEPTION 'El área destino para reproceso debe ser anterior a la revisión de calidad.';
  END IF;

  SELECT nombre INTO v_area_dest FROM public.areas WHERE id = p_area_destino_id;

  -- 1. Insertar registro en rechazos_calidad
  INSERT INTO public.rechazos_calidad (
    orden_id, etapa_qc_id, area_destino_id, motivo, cantidad_afectada, usuario_id
  ) VALUES (
    v_etapa.orden_id, p_etapa_id, p_area_destino_id, p_motivo, p_cantidad_afectada, v_user_id
  ) RETURNING id INTO v_rechazo_id;

  -- 2. Incrementar intento en etapa de calidad
  v_nuevo_intento := COALESCE(v_etapa.intento, 1) + 1;
  UPDATE public.orden_etapas
  SET intento = v_nuevo_intento,
      estado = 'bloqueada'::public.estado_etapa,
      updated_at = now()
  WHERE id = p_etapa_id;

  -- 3. Reiniciar etapas desde el área destino hasta la anterior a calidad
  UPDATE public.orden_etapas
  SET estado = CASE
        WHEN secuencia = v_etapa_destino.secuencia THEN 'en_cola'::public.estado_etapa
        ELSE 'bloqueada'::public.estado_etapa
      END,
      updated_at = now()
  WHERE orden_id = v_etapa.orden_id
    AND secuencia >= v_etapa_destino.secuencia
    AND secuencia < v_etapa.secuencia
    AND estado != 'omitida';

  -- 4. Actualizar la orden
  UPDATE public.ordenes
  SET area_actual_id = p_area_destino_id,
      estado = 'en_produccion'::public.estado_ot,
      updated_at = now()
  WHERE id = v_etapa.orden_id;

  -- 5. Registrar evento
  INSERT INTO public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  VALUES (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'rechazo_calidad',
    jsonb_build_object(
      'motivo', p_motivo,
      'area_destino', v_area_dest.nombre,
      'cantidad_afectada', p_cantidad_afectada,
      'intento', v_nuevo_intento
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'reproceso', true,
    'rechazo_id', v_rechazo_id,
    'intento', v_nuevo_intento,
    'area_destino', v_area_dest.nombre
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.13 RPC: despachar (Cierre formal de la orden)
CREATE OR REPLACE FUNCTION public.despachar(
  p_orden_id UUID,
  p_guia_despacho TEXT DEFAULT NULL,
  p_despachada_a TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_orden RECORD;
  v_user_id UUID := auth.uid();
  v_despacho_etapa_id UUID;
BEGIN
  IF public.auth_rol() NOT IN ('admin', 'recepcion', 'supervisor') THEN
    -- Operadores solo si pertenecen a área con es_despacho = true
    IF NOT EXISTS (
      SELECT 1 FROM public.usuario_areas ua
      JOIN public.areas a ON a.id = ua.area_id
      WHERE ua.usuario_id = v_user_id AND a.es_despacho = true
    ) THEN
      RAISE EXCEPTION 'No tienes permisos para despachar órdenes.';
    END IF;
  END IF;

  SELECT * INTO v_orden FROM public.ordenes WHERE id = p_orden_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orden de trabajo no encontrada.';
  END IF;

  -- Actualizar orden
  UPDATE public.ordenes
  SET estado = 'despachada'::public.estado_ot,
      despachada_en = now(),
      despachada_a = p_despachada_a,
      guia_despacho = p_guia_despacho,
      entregada_en = now(),
      entregada_a = p_despachada_a,
      area_actual_id = NULL,
      updated_at = now()
  WHERE id = p_orden_id;

  -- Terminar etapa de despacho si existe
  SELECT oe.id INTO v_despacho_etapa_id
  FROM public.orden_etapas oe
  JOIN public.areas a ON a.id = oe.area_id
  WHERE oe.orden_id = p_orden_id AND a.es_despacho = true
  LIMIT 1;

  IF v_despacho_etapa_id IS NOT NULL THEN
    UPDATE public.orden_etapas
    SET estado = 'terminada'::public.estado_etapa,
        terminada_en = now(),
        updated_at = now()
    WHERE id = v_despacho_etapa_id;
  END IF;

  -- Registrar evento
  INSERT INTO public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  VALUES (
    p_orden_id, v_despacho_etapa_id, v_user_id, 'despachada',
    jsonb_build_object(
      'guia_despacho', p_guia_despacho,
      'despachada_a', p_despachada_a,
      'fecha', now()
    )
  );

  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Retrocompatibilidad: marcar_entregada delega en despachar
CREATE OR REPLACE FUNCTION public.marcar_entregada(
  p_orden_id UUID,
  p_entregada_a TEXT
)
RETURNS JSONB AS $$
BEGIN
  RETURN public.despachar(p_orden_id, NULL, p_entregada_a);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 4. ACTUALIZACIÓN DE APROBACIÓN DE CLIENTE (Desacoplar de slug 'diseno')
-- ==============================================================================

-- 4.1 aprobar_arte_cliente
CREATE OR REPLACE FUNCTION public.aprobar_arte_cliente(
  p_token TEXT,
  p_nombre TEXT,
  p_cargo_dni TEXT DEFAULT NULL,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_aprobacion RECORD;
  v_etapa_aprobacion RECORD;
  v_siguiente_etapa RECORD;
BEGIN
  SELECT * INTO v_aprobacion
  FROM public.aprobaciones_cliente
  WHERE token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enlace de aprobación inválido o no encontrado';
  END IF;

  IF v_aprobacion.estado != 'pendiente' THEN
    RAISE EXCEPTION 'Este enlace ya fue procesado con anterioridad (Estado: %)', v_aprobacion.estado;
  END IF;

  -- Actualizar estado de aprobación
  UPDATE public.aprobaciones_cliente
  SET estado = 'aprobado',
      fecha_respuesta = now(),
      aprobado_por_nombre = trim(p_nombre),
      aprobado_por_cargo_dni = trim(p_cargo_dni),
      ip_cliente = p_ip,
      user_agent = p_user_agent,
      updated_at = now()
  WHERE id = v_aprobacion.id;

  -- Buscar etapa con requiere_aprobacion_cliente = true (no por slug 'diseno')
  SELECT oe.*, a.nombre AS area_nombre
  INTO v_etapa_aprobacion
  FROM public.orden_etapas oe
  JOIN public.areas a ON a.id = oe.area_id
  WHERE oe.orden_id = v_aprobacion.orden_id
    AND a.requiere_aprobacion_cliente = true
  LIMIT 1;

  -- Si la etapa estaba pendiente o en proceso, terminarla y activar la siguiente no omitida
  IF FOUND AND v_etapa_aprobacion.estado IN ('en_cola', 'en_proceso', 'pausada', 'esperando_cliente') THEN
    UPDATE public.orden_etapas
    SET estado = 'terminada'::public.estado_etapa,
        terminada_en = now(),
        updated_at = now()
    WHERE id = v_etapa_aprobacion.id;

    -- Activar la siguiente etapa no omitida
    SELECT * INTO v_siguiente_etapa
    FROM public.orden_etapas
    WHERE orden_id = v_aprobacion.orden_id
      AND secuencia > v_etapa_aprobacion.secuencia
      AND estado != 'omitida'
    ORDER BY secuencia ASC
    LIMIT 1;

    IF FOUND THEN
      UPDATE public.orden_etapas
      SET estado = 'en_cola'::public.estado_etapa,
          updated_at = now()
      WHERE id = v_siguiente_etapa.id;

      UPDATE public.ordenes
      SET area_actual_id = v_siguiente_etapa.area_id,
          updated_at = now()
      WHERE id = v_aprobacion.orden_id;
    END IF;
  END IF;

  -- Registrar evento inmutable de auditoría
  INSERT INTO public.eventos_orden (
    orden_id,
    tipo,
    detalle
  ) VALUES (
    v_aprobacion.orden_id,
    'cambio_estado',
    jsonb_build_object(
      'descripcion', 'Arte 3D APROBADO por el cliente: ' || trim(p_nombre),
      'aprobado_por', trim(p_nombre),
      'cargo_dni', trim(p_cargo_dni),
      'ip', p_ip,
      'fecha', now()
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'mensaje', 'Arte aprobado exitosamente'
  );
END;
$$;

-- 4.2 solicitar_cambios_cliente
CREATE OR REPLACE FUNCTION public.solicitar_cambios_cliente(
  p_token TEXT,
  p_nombre TEXT,
  p_comentarios TEXT,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_aprobacion RECORD;
  v_motivo_id UUID;
  v_etapa_aprobacion RECORD;
BEGIN
  SELECT * INTO v_aprobacion
  FROM public.aprobaciones_cliente
  WHERE token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enlace de aprobación no encontrado';
  END IF;

  IF v_aprobacion.estado != 'pendiente' THEN
    RAISE EXCEPTION 'Este enlace ya fue procesado previamente';
  END IF;

  UPDATE public.aprobaciones_cliente
  SET estado = 'cambios_solicitados',
      fecha_respuesta = now(),
      aprobado_por_nombre = trim(p_nombre),
      comentarios_cliente = trim(p_comentarios),
      ip_cliente = p_ip,
      user_agent = p_user_agent,
      updated_at = now()
  WHERE id = v_aprobacion.id;

  -- Obtener motivo de pausa relacionado a aprobación del cliente
  SELECT id INTO v_motivo_id
  FROM public.motivos_pausa
  WHERE texto ILIKE '%cliente%' OR texto ILIKE '%aprobaci%'
  LIMIT 1;

  -- Pausar etapa con requiere_aprobacion_cliente = true
  SELECT oe.* INTO v_etapa_aprobacion
  FROM public.orden_etapas oe
  JOIN public.areas a ON a.id = oe.area_id
  WHERE oe.orden_id = v_aprobacion.orden_id
    AND a.requiere_aprobacion_cliente = true
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.orden_etapas
    SET estado = 'pausada'::public.estado_etapa,
        motivo_pausa_id = v_motivo_id,
        nota_pausa = trim(p_comentarios),
        updated_at = now()
    WHERE id = v_etapa_aprobacion.id;
  END IF;

  -- Registrar comentario
  INSERT INTO public.comentarios (orden_id, texto)
  VALUES (
    v_aprobacion.orden_id,
    'SOLICITUD DE CAMBIOS DE CLIENTE (' || trim(p_nombre) || '): ' || trim(p_comentarios)
  );

  -- Registrar evento
  INSERT INTO public.eventos_orden (orden_id, tipo, detalle)
  VALUES (
    v_aprobacion.orden_id,
    'pausada',
    jsonb_build_object(
      'descripcion', 'Cliente solicitó ajustes al diseño: ' || trim(p_comentarios),
      'solicitado_por', trim(p_nombre),
      'comentarios', trim(p_comentarios),
      'fecha', now()
    )
  );

  RETURN jsonb_build_object('ok', true);
END;
$$;

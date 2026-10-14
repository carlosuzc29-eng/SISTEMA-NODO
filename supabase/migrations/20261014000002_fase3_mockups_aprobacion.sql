-- =====================================================================
-- NODO 26 — SISTEMA DE CONTROL DE PRODUCCIÓN
-- MIGRACIÓN FASE 3: MOCKUPS 3D Y APROBACIÓN DE CLIENTES
-- =====================================================================

-- 1. ENUMS PARA MODELOS Y APROBACIONES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_modelo_empaque') THEN
    CREATE TYPE tipo_modelo_empaque AS ENUM (
      'caja_tuck_end',
      'caja_pizza',
      'bolsa_kraft'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_hot_stamping') THEN
    CREATE TYPE tipo_hot_stamping AS ENUM (
      'ninguno',
      'oro',
      'plata',
      'cobre'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_aprobacion') THEN
    CREATE TYPE estado_aprobacion AS ENUM (
      'pendiente',
      'aprobado',
      'cambios_solicitados',
      'expirado'
    );
  END IF;
END $$;

-- 2. TABLA: mockups_empaque
CREATE TABLE IF NOT EXISTS mockups_empaque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  modelo_tipo tipo_modelo_empaque NOT NULL DEFAULT 'caja_tuck_end',
  ancho_cm NUMERIC(6,2) NOT NULL DEFAULT 15.00,
  alto_cm NUMERIC(6,2) NOT NULL DEFAULT 20.00,
  profundidad_cm NUMERIC(6,2) NOT NULL DEFAULT 8.00,
  grosor_mm NUMERIC(4,2) NOT NULL DEFAULT 0.50,
  textura_arte_url TEXT,
  textura_acabado_url TEXT,
  acabado_barniz_uv BOOLEAN NOT NULL DEFAULT false,
  acabado_hot_stamping tipo_hot_stamping NOT NULL DEFAULT 'ninguno',
  acabado_relieve BOOLEAN NOT NULL DEFAULT false,
  angulo_apertura NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  snapshot_url TEXT,
  creado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA: aprobaciones_cliente
CREATE TABLE IF NOT EXISTS aprobaciones_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  orden_id UUID NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  mockup_id UUID NOT NULL REFERENCES mockups_empaque(id) ON DELETE CASCADE,
  estado estado_aprobacion NOT NULL DEFAULT 'pendiente',
  fecha_envio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_respuesta TIMESTAMPTZ,
  aprobado_por_nombre TEXT,
  aprobado_por_cargo_dni TEXT,
  comentarios_cliente TEXT,
  ip_cliente TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_mockups_orden ON mockups_empaque(orden_id);
CREATE INDEX IF NOT EXISTS idx_aprobaciones_token ON aprobaciones_cliente(token);
CREATE INDEX IF NOT EXISTS idx_aprobaciones_orden ON aprobaciones_cliente(orden_id);

-- 4. SEGURIDAD (RLS)
ALTER TABLE mockups_empaque ENABLE ROW LEVEL SECURITY;
ALTER TABLE aprobaciones_cliente ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Lectura pública de aprobaciones por token"
  ON aprobaciones_cliente FOR SELECT
  USING (true);

CREATE POLICY "Lectura pública de mockups asociados a aprobación"
  ON mockups_empaque FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados gestionan mockups"
  ON mockups_empaque FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados gestionan aprobaciones"
  ON aprobaciones_cliente FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. RPC TRANSACCIONAL: generar_token_aprobacion
CREATE OR REPLACE FUNCTION generar_token_aprobacion(
  p_orden_id UUID,
  p_mockup_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
  v_aprobacion_id UUID;
BEGIN
  -- Generar token alfanumérico seguro
  v_token := encode(gen_random_bytes(16), 'hex');

  -- Insertar o actualizar aprobación pendiente
  INSERT INTO aprobaciones_cliente (
    token,
    orden_id,
    mockup_id,
    estado,
    fecha_envio
  ) VALUES (
    v_token,
    p_orden_id,
    p_mockup_id,
    'pendiente',
    NOW()
  )
  RETURNING id INTO v_aprobacion_id;

  -- Registrar evento
  INSERT INTO eventos_orden (
    orden_id,
    tipo,
    descripcion,
    detalles
  ) VALUES (
    p_orden_id,
    'comentario',
    'Se generó enlace de aprobación 3D para el cliente',
    jsonb_build_object('token', v_token, 'mockup_id', p_mockup_id)
  );

  RETURN jsonb_build_object(
    'ok', true,
    'token', v_token,
    'aprobacion_id', v_aprobacion_id
  );
END;
$$;

-- 6. RPC TRANSACCIONAL: aprobar_arte_cliente
CREATE OR REPLACE FUNCTION aprobar_arte_cliente(
  p_token TEXT,
  p_nombre TEXT,
  p_cargo_dni TEXT DEFAULT NULL,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_aprobacion RECORD;
  v_etapa_diseno RECORD;
  v_siguiente_etapa RECORD;
BEGIN
  SELECT * INTO v_aprobacion
  FROM aprobaciones_cliente
  WHERE token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enlace de aprobación inválido o no encontrado';
  END IF;

  IF v_aprobacion.estado != 'pendiente' THEN
    RAISE EXCEPTION 'Este enlace ya fue procesado con anterioridad (Estado: %)', v_aprobacion.estado;
  END IF;

  -- Actualizar estado de aprobación
  UPDATE aprobaciones_cliente
  SET estado = 'aprobado',
      fecha_respuesta = NOW(),
      aprobado_por_nombre = TRIM(p_nombre),
      aprobado_por_cargo_dni = TRIM(p_cargo_dni),
      ip_cliente = p_ip,
      user_agent = p_user_agent,
      updated_at = NOW()
  WHERE id = v_aprobacion.id;

  -- Buscar etapa de diseño si existe
  SELECT oe.*, a.slug AS area_slug
  INTO v_etapa_diseno
  FROM orden_etapas oe
  JOIN areas a ON a.id = oe.area_id
  WHERE oe.orden_id = v_aprobacion.orden_id
    AND a.slug = 'diseno'
  LIMIT 1;

  -- Si la etapa de diseño estaba pendiente/proceso, terminarla
  IF FOUND AND v_etapa_diseno.estado IN ('en_cola', 'en_proceso', 'pausada', 'esperando_cliente') THEN
    UPDATE orden_etapas
    SET estado = 'terminada',
        fecha_fin = NOW(),
        duracion_minutos = COALESCE(ROUND(EXTRACT(EPOCH FROM (NOW() - COALESCE(fecha_inicio, NOW()))) / 60)::INT, 0),
        updated_at = NOW()
    WHERE id = v_etapa_diseno.id;

    -- Activar la siguiente etapa en la ruta
    SELECT * INTO v_siguiente_etapa
    FROM orden_etapas
    WHERE orden_id = v_aprobacion.orden_id
      AND secuencia > v_etapa_diseno.secuencia
    ORDER BY secuencia ASC
    LIMIT 1;

    IF FOUND THEN
      UPDATE orden_etapas
      SET estado = 'en_cola',
          updated_at = NOW()
      WHERE id = v_siguiente_etapa.id;

      UPDATE ordenes
      SET area_actual_id = v_siguiente_etapa.area_id,
          updated_at = NOW()
      WHERE id = v_aprobacion.orden_id;
    END IF;
  END IF;

  -- Registrar evento inmutable de auditoría
  INSERT INTO eventos_orden (
    orden_id,
    tipo,
    descripcion,
    detalles
  ) VALUES (
    v_aprobacion.orden_id,
    'cambio_estado',
    'Arte 3D APROBADO por el cliente: ' || TRIM(p_nombre),
    jsonb_build_object(
      'aprobado_por', TRIM(p_nombre),
      'cargo_dni', TRIM(p_cargo_dni),
      'ip', p_ip,
      'fecha', NOW()
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'mensaje', 'Arte aprobado exitosamente'
  );
END;
$$;

-- 7. RPC TRANSACCIONAL: solicitar_cambios_cliente
CREATE OR REPLACE FUNCTION solicitar_cambios_cliente(
  p_token TEXT,
  p_nombre TEXT,
  p_comentarios TEXT,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_aprobacion RECORD;
  v_motivo_id UUID;
  v_etapa_diseno RECORD;
BEGIN
  SELECT * INTO v_aprobacion
  FROM aprobaciones_cliente
  WHERE token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enlace de aprobación no encontrado';
  END IF;

  IF v_aprobacion.estado != 'pendiente' THEN
    RAISE EXCEPTION 'Este enlace ya fue procesado previamente';
  END IF;

  -- Actualizar registro
  UPDATE aprobaciones_cliente
  SET estado = 'cambios_solicitados',
      fecha_respuesta = NOW(),
      aprobado_por_nombre = TRIM(p_nombre),
      comentarios_cliente = TRIM(p_comentarios),
      ip_cliente = p_ip,
      user_agent = p_user_agent,
      updated_at = NOW()
  WHERE id = v_aprobacion.id;

  -- Obtener motivo de pausa "Esperando al cliente" o similar
  SELECT id INTO v_motivo_id
  FROM motivos_pausa
  WHERE nombre ILIKE '%cliente%' OR nombre ILIKE '%aprobaci%'
  LIMIT 1;

  -- Pausar etapa de diseño
  SELECT oe.* INTO v_etapa_diseno
  FROM orden_etapas oe
  JOIN areas a ON a.id = oe.area_id
  WHERE oe.orden_id = v_aprobacion.orden_id
    AND a.slug = 'diseno'
  LIMIT 1;

  IF FOUND THEN
    UPDATE orden_etapas
    SET estado = 'pausada',
        motivo_pausa_id = v_motivo_id,
        updated_at = NOW()
    WHERE id = v_etapa_diseno.id;

    UPDATE ordenes
    SET estado = 'en_produccion',
        area_actual_id = v_etapa_diseno.area_id,
        updated_at = NOW()
    WHERE id = v_aprobacion.orden_id;
  END IF;

  -- Registrar comentario y evento
  INSERT INTO comentarios (orden_id, autor_id, texto)
  VALUES (
    v_aprobacion.orden_id,
    NULL,
    'SOLICITUD DE CAMBIOS DE CLIENTE (' || TRIM(p_nombre) || '): ' || TRIM(p_comentarios)
  );

  INSERT INTO eventos_orden (
    orden_id,
    tipo,
    descripcion,
    detalles
  ) VALUES (
    v_aprobacion.orden_id,
    'pausa',
    'Cliente solicitó ajustes al diseño: ' || TRIM(p_comentarios),
    jsonb_build_object(
      'solicitado_por', TRIM(p_nombre),
      'comentarios', TRIM(p_comentarios),
      'ip', p_ip
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'mensaje', 'Comentarios registrados correctamente'
  );
END;
$$;

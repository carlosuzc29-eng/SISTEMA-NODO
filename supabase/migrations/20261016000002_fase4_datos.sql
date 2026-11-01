-- ==============================================================================
-- FASE 4: MIGRACIÓN DE DATOS (11 Áreas, Estados de OT, Seed de Acabados y Proveedores)
-- ==============================================================================

-- 1. Actualización de las 4 áreas existentes (manteniendo sus IDs y etapas previas)
-- 1.1 Diseño -> Diseño gráfico / Arte final (pre_prensa, orden 1)
UPDATE public.areas
SET nombre = 'Diseño gráfico / Arte final',
    slug = 'diseno-arte-final',
    color_hex = '#8B5CF6',
    icono_lucide = 'Palette',
    orden = 1,
    fase = 'pre_prensa'::public.fase_area,
    tipo_espera = 'ninguna'::public.tipo_espera,
    requiere_aprobacion_cliente = true,
    es_condicional = false,
    es_control_calidad = false,
    es_despacho = false
WHERE id = '11111111-1111-1111-1111-111111111101' OR slug = 'diseno';

-- 1.2 Impresión -> Impresión / Secado (prensa, orden 4, tipo_espera = secado)
UPDATE public.areas
SET nombre = 'Impresión / Secado',
    slug = 'impresion-secado',
    color_hex = '#3B82F6',
    icono_lucide = 'Printer',
    orden = 4,
    fase = 'prensa'::public.fase_area,
    tipo_espera = 'secado'::public.tipo_espera,
    requiere_aprobacion_cliente = false,
    es_condicional = false,
    es_control_calidad = false,
    es_despacho = false
WHERE id = '11111111-1111-1111-1111-111111111102' OR slug = 'impresion';

-- 1.3 Troquelado -> Troquelado (post_prensa, orden 6, condicional)
UPDATE public.areas
SET nombre = 'Troquelado',
    slug = 'troquelado',
    color_hex = '#F59E0B',
    icono_lucide = 'Scissors',
    orden = 6,
    fase = 'post_prensa'::public.fase_area,
    tipo_espera = 'ninguna'::public.tipo_espera,
    requiere_aprobacion_cliente = false,
    es_condicional = false,
    es_control_calidad = false,
    es_despacho = false
WHERE id = '11111111-1111-1111-1111-111111111103' OR slug = 'troquelado';

-- 1.4 Corte -> Corte y refile / Esquineado (post_prensa, orden 7)
UPDATE public.areas
SET nombre = 'Corte y refile / Esquineado',
    slug = 'corte-refile',
    color_hex = '#10B981',
    icono_lucide = 'Layers',
    orden = 7,
    fase = 'post_prensa'::public.fase_area,
    tipo_espera = 'ninguna'::public.tipo_espera,
    requiere_aprobacion_cliente = false,
    es_condicional = false,
    es_control_calidad = false,
    es_despacho = false
WHERE id = '11111111-1111-1111-1111-111111111104' OR slug = 'corte';

-- 2. Inserción de las 7 Áreas Nuevas
INSERT INTO public.areas (
  id, nombre, slug, color_hex, icono_lucide, orden, fase, tipo_espera,
  requiere_aprobacion_cliente, es_condicional, es_control_calidad, es_despacho, activa
) VALUES
  (
    '11111111-1111-1111-1111-111111111105',
    'Planchas',
    'planchas',
    '#6366F1',
    'Layers',
    2,
    'pre_prensa'::public.fase_area,
    'ninguna'::public.tipo_espera,
    false,
    true,
    false,
    false,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111106',
    'Preparación de materiales',
    'preparacion-materiales',
    '#0EA5E9',
    'Box',
    3,
    'pre_prensa'::public.fase_area,
    'ninguna'::public.tipo_espera,
    false,
    false,
    false,
    false,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111107',
    'Acabado',
    'acabado',
    '#EC4899',
    'Sparkles',
    5,
    'post_prensa'::public.fase_area,
    'proveedor'::public.tipo_espera,
    false,
    true,
    false,
    false,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111108',
    'Encuadernación / Trabajo manual',
    'encuadernacion-manual',
    '#D97706',
    'BookOpen',
    8,
    'post_prensa'::public.fase_area,
    'ninguna'::public.tipo_espera,
    false,
    true,
    false,
    false,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111109',
    'Revisión y control de calidad',
    'control-calidad',
    '#EF4444',
    'ShieldCheck',
    9,
    'post_prensa'::public.fase_area,
    'ninguna'::public.tipo_espera,
    false,
    false,
    true,
    false,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111110',
    'Embalaje',
    'embalaje',
    '#84CC16',
    'PackageCheck',
    10,
    'post_prensa'::public.fase_area,
    'ninguna'::public.tipo_espera,
    false,
    false,
    false,
    false,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Despacho',
    'despacho',
    '#059669',
    'Truck',
    11,
    'post_prensa'::public.fase_area,
    'ninguna'::public.tipo_espera,
    false,
    false,
    false,
    true,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  color_hex = EXCLUDED.color_hex,
  icono_lucide = EXCLUDED.icono_lucide,
  orden = EXCLUDED.orden,
  fase = EXCLUDED.fase,
  tipo_espera = EXCLUDED.tipo_espera,
  requiere_aprobacion_cliente = EXCLUDED.requiere_aprobacion_cliente,
  es_condicional = EXCLUDED.es_condicional,
  es_control_calidad = EXCLUDED.es_control_calidad,
  es_despacho = EXCLUDED.es_despacho,
  activa = EXCLUDED.activa;

-- 3. Migración de estados de Órdenes de Trabajo (OT) existentes
UPDATE public.ordenes SET estado = 'en_puerta' WHERE estado = 'recibida';
UPDATE public.ordenes SET estado = 'lista_despacho' WHERE estado = 'lista_entrega';
UPDATE public.ordenes SET estado = 'despachada' WHERE estado = 'entregada';

-- 4. Excepción de OTs en curso:
-- Si una OT en curso ya terminó todas sus etapas y estaba en lista_entrega (ahora lista_despacho),
-- agregarle una etapa de Despacho en_cola para que pueda cerrarse con el nuevo flujo.
DO $$
DECLARE
  v_despacho_id UUID;
  r RECORD;
  v_max_sec INT;
BEGIN
  SELECT id INTO v_despacho_id FROM public.areas WHERE es_despacho = true AND activa = true LIMIT 1;

  IF v_despacho_id IS NOT NULL THEN
    FOR r IN (
      SELECT o.id AS orden_id
      FROM public.ordenes o
      WHERE o.estado = 'lista_despacho'
        AND NOT EXISTS (
          SELECT 1 FROM public.orden_etapas oe
          WHERE oe.orden_id = o.id AND oe.area_id = v_despacho_id
        )
    ) LOOP
      SELECT COALESCE(MAX(secuencia), 0) INTO v_max_sec
      FROM public.orden_etapas
      WHERE orden_id = r.orden_id;

      INSERT INTO public.orden_etapas (orden_id, area_id, secuencia, estado)
      VALUES (r.orden_id, v_despacho_id, v_max_sec + 1, 'en_cola');
    END LOOP;
  END IF;
END $$;

-- 5. Seed de Catálogos Nuevos
-- 5.1 Acabados
INSERT INTO public.acabados (nombre, activo)
VALUES
  ('UV', true),
  ('Plastificado', true),
  ('Barniz litho', true)
ON CONFLICT (nombre) DO UPDATE SET activo = true;

-- 5.2 Proveedor de planchas de ejemplo
INSERT INTO public.proveedores (nombre, telefono, tipo, activo)
SELECT 'Planchas Gráficas Express C.A.', '+584141112233', 'planchas', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.proveedores WHERE nombre = 'Planchas Gráficas Express C.A.'
);

-- 5.3 Nuevos motivos de pausa
INSERT INTO public.motivos_pausa (texto, activo)
SELECT 'Esperando planchas', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.motivos_pausa WHERE texto = 'Esperando planchas'
);

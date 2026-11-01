-- ==============================================================================
-- FASE 4: MIGRACIÓN DE ESQUEMA (Tablas nuevas, columnas nuevas y usuario_areas)
-- ==============================================================================

-- 1. Actualización de Tabla: public.areas
ALTER TABLE public.areas
  ADD COLUMN IF NOT EXISTS fase public.fase_area NOT NULL DEFAULT 'post_prensa',
  ADD COLUMN IF NOT EXISTS tipo_espera public.tipo_espera NOT NULL DEFAULT 'ninguna',
  ADD COLUMN IF NOT EXISTS es_control_calidad BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS es_despacho BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS es_condicional BOOLEAN NOT NULL DEFAULT false;

-- Restricción de unicidad: solo puede haber un área activa con es_control_calidad = true y una con es_despacho = true
CREATE UNIQUE INDEX IF NOT EXISTS idx_areas_unica_calidad
  ON public.areas(es_control_calidad)
  WHERE es_control_calidad = true AND activa = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_areas_unico_despacho
  ON public.areas(es_despacho)
  WHERE es_despacho = true AND activa = true;

-- 2. Nueva Tabla: public.usuario_areas (Soporte de usuarios en múltiples áreas)
CREATE TABLE IF NOT EXISTS public.usuario_areas (
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, area_id)
);

CREATE INDEX IF NOT EXISTS idx_usuario_areas_usuario ON public.usuario_areas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_areas_area ON public.usuario_areas(area_id);

-- Migración de datos existentes: copiar profiles.area_id a usuario_areas
INSERT INTO public.usuario_areas (usuario_id, area_id)
SELECT id, area_id
FROM public.profiles
WHERE area_id IS NOT NULL
ON CONFLICT (usuario_id, area_id) DO NOTHING;

-- Documentar que profiles.area_id queda obsoleto y se eliminará en la fase final
COMMENT ON COLUMN public.profiles.area_id IS 'OBSOLETO: Relación 1-a-1 migrada a tabla usuario_areas (N-a-N). Se eliminará en el paso final de limpieza.';

-- 3. Nueva Tabla: public.proveedores
CREATE TABLE IF NOT EXISTS public.proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('planchas', 'papel', 'otros')),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tr_proveedores_updated_at
BEFORE UPDATE ON public.proveedores
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Nueva Tabla: public.acabados
CREATE TABLE IF NOT EXISTS public.acabados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tr_acabados_updated_at
BEFORE UPDATE ON public.acabados
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Nueva Tabla: public.orden_acabados (Relación N-a-N ordenes <-> acabados)
CREATE TABLE IF NOT EXISTS public.orden_acabados (
  orden_id UUID NOT NULL REFERENCES public.ordenes(id) ON DELETE CASCADE,
  acabado_id UUID NOT NULL REFERENCES public.acabados(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (orden_id, acabado_id)
);

CREATE INDEX IF NOT EXISTS idx_orden_acabados_orden ON public.orden_acabados(orden_id);
CREATE INDEX IF NOT EXISTS idx_orden_acabados_acabado ON public.orden_acabados(acabado_id);

-- 6. Actualización de Tabla: public.ordenes
DO $$
BEGIN
  -- Renombrar entregada_en a despachada_en de forma segura e idempotente
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ordenes' AND column_name = 'entregada_en'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ordenes' AND column_name = 'despachada_en'
  ) THEN
    ALTER TABLE public.ordenes RENAME COLUMN entregada_en TO despachada_en;
  END IF;

  -- Renombrar entregada_a a despachada_a de forma segura e idempotente
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ordenes' AND column_name = 'entregada_a'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ordenes' AND column_name = 'despachada_a'
  ) THEN
    ALTER TABLE public.ordenes RENAME COLUMN entregada_a TO despachada_a;
  END IF;
END $$;

ALTER TABLE public.ordenes
  ADD COLUMN IF NOT EXISTS despachada_en TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS despachada_a TEXT NULL,
  ADD COLUMN IF NOT EXISTS guia_despacho TEXT NULL,
  ADD COLUMN IF NOT EXISTS usa_planchas_existentes BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notas_acabado TEXT NULL,
  ADD COLUMN IF NOT EXISTS liberada_en TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS liberada_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Cambiar default del estado en ordenes a 'en_puerta'
ALTER TABLE public.ordenes ALTER COLUMN estado SET DEFAULT 'en_puerta'::public.estado_ot;

-- 7. Actualización de Tabla: public.orden_etapas
ALTER TABLE public.orden_etapas
  ADD COLUMN IF NOT EXISTS proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS enviado_proveedor_en TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS recibido_proveedor_en TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS secado_hasta TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS intento INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS omitida_motivo TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_orden_etapas_proveedor ON public.orden_etapas(proveedor_id);

-- 8. Nueva Tabla: public.rechazos_calidad
CREATE TABLE IF NOT EXISTS public.rechazos_calidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES public.ordenes(id) ON DELETE CASCADE,
  etapa_qc_id UUID NOT NULL REFERENCES public.orden_etapas(id) ON DELETE CASCADE,
  area_destino_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE RESTRICT,
  motivo TEXT NOT NULL,
  cantidad_afectada INT NULL,
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rechazos_calidad_orden ON public.rechazos_calidad(orden_id);
CREATE INDEX IF NOT EXISTS idx_rechazos_calidad_etapa ON public.rechazos_calidad(etapa_qc_id);
CREATE INDEX IF NOT EXISTS idx_rechazos_calidad_area ON public.rechazos_calidad(area_destino_id);

-- 9. Habilitar RLS en las nuevas tablas
ALTER TABLE public.usuario_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acabados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orden_acabados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rechazos_calidad ENABLE ROW LEVEL SECURITY;

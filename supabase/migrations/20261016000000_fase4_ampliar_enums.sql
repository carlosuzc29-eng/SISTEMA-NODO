-- ==============================================================================
-- FASE 4: MIGRACIÓN DE ENUMS (Separada para permitir uso seguro de nuevos valores)
-- ==============================================================================

-- 1. Nuevo Enum: fase_area (Pre-prensa, Prensa, Post-prensa)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fase_area') THEN
    CREATE TYPE public.fase_area AS ENUM ('pre_prensa', 'prensa', 'post_prensa');
  END IF;
END $$;

-- 2. Nuevo Enum: tipo_espera (ninguna, cliente, proveedor, secado)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_espera') THEN
    CREATE TYPE public.tipo_espera AS ENUM ('ninguna', 'cliente', 'proveedor', 'secado');
  END IF;
END $$;

-- 3. Ampliación de Enum estado_ot: agregar en_puerta, lista_despacho, despachada
-- Nota: se conservan temporalmente recibida, lista_entrega, entregada para migración de datos
ALTER TYPE public.estado_ot ADD VALUE IF NOT EXISTS 'en_puerta';
ALTER TYPE public.estado_ot ADD VALUE IF NOT EXISTS 'lista_despacho';
ALTER TYPE public.estado_ot ADD VALUE IF NOT EXISTS 'despachada';

-- 4. Ampliación de Enum estado_etapa: agregar esperando_proveedor, secando, omitida
ALTER TYPE public.estado_etapa ADD VALUE IF NOT EXISTS 'esperando_proveedor';
ALTER TYPE public.estado_etapa ADD VALUE IF NOT EXISTS 'secando';
ALTER TYPE public.estado_etapa ADD VALUE IF NOT EXISTS 'omitida';

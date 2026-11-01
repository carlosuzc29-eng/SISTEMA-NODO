-- ==============================================================================
-- FASE 4: MIGRACIÓN DE LIMPIEZA FINAL (Eliminación de profiles.area_id)
-- ==============================================================================
-- Descripción:
-- Ahora que el flujo real de 11 estaciones está completamente probado y en funcionamiento,
-- y que todos los operadores están vinculados de manera flexible y multi-área mediante
-- la tabla `public.usuario_areas`, se elimina definitivamente la columna obsoleta
-- `profiles.area_id` y se actualizan los helpers de seguridad para consultar exclusivamente
-- la tabla `usuario_areas`.
-- ==============================================================================

-- 1. Actualizar helper auth_areas() para leer exclusivamente de usuario_areas
CREATE OR REPLACE FUNCTION public.auth_areas()
RETURNS SETOF UUID AS $$
  SELECT area_id FROM public.usuario_areas WHERE usuario_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 2. Actualizar helper auth_pertenece_a_area() para leer exclusivamente de usuario_areas
CREATE OR REPLACE FUNCTION public.auth_pertenece_a_area(p_area_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuario_areas WHERE usuario_id = auth.uid() AND area_id = p_area_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 3. Actualizar helper de compatibilidad histórica auth_area()
CREATE OR REPLACE FUNCTION public.auth_area()
RETURNS UUID AS $$
  SELECT area_id FROM public.usuario_areas WHERE usuario_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 4. Asegurar que cualquier asignación residual en profiles.area_id esté en usuario_areas
INSERT INTO public.usuario_areas (usuario_id, area_id)
SELECT id, area_id
FROM public.profiles
WHERE area_id IS NOT NULL
ON CONFLICT (usuario_id, area_id) DO NOTHING;

-- 5. Eliminar constraints de llave foránea asociadas a profiles.area_id si existen
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  FOR v_constraint_name IN (
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'profiles'
      AND kcu.column_name = 'area_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I;', v_constraint_name);
  END LOOP;
END $$;

-- 6. Eliminar la columna profiles.area_id
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS area_id;

-- 7. Documentación
COMMENT ON TABLE public.usuario_areas IS 'Asignaciones activas de operadores a una o múltiples estaciones de trabajo (11 áreas de producción).';

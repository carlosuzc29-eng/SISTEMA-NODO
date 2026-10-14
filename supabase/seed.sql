-- ==============================================================================
-- SEED DE DATOS DE PRUEBA: FASE 1 & FASE 2
-- ==============================================================================

-- 1. Insertar Áreas de Producción
insert into public.areas (id, nombre, slug, color_hex, icono_lucide, orden, requiere_aprobacion_cliente, activa)
values
  ('11111111-1111-1111-1111-111111111101', 'Diseño', 'diseno', '#8B5CF6', 'Palette', 1, true, true),
  ('11111111-1111-1111-1111-111111111102', 'Impresión', 'impresion', '#3B82F6', 'Printer', 2, false, true),
  ('11111111-1111-1111-1111-111111111103', 'Troquelado', 'troquelado', '#F59E0B', 'Scissors', 3, false, true),
  ('11111111-1111-1111-1111-111111111104', 'Corte', 'corte', '#10B981', 'Layers', 4, false, true)
on conflict (slug) do update set
  nombre = excluded.nombre,
  color_hex = excluded.color_hex,
  icono_lucide = excluded.icono_lucide,
  orden = excluded.orden,
  requiere_aprobacion_cliente = excluded.requiere_aprobacion_cliente;

-- 2. Crear Usuarios en auth.users y perfiles en public.profiles (PIN: '123456')
do $$
declare
  v_encrypted_pw text := crypt('123456', gen_salt('bf'));
  v_diseno_id uuid := '11111111-1111-1111-1111-111111111101';
  v_impresion_id uuid := '11111111-1111-1111-1111-111111111102';
  v_troquelado_id uuid := '11111111-1111-1111-1111-111111111103';
  v_corte_id uuid := '11111111-1111-1111-1111-111111111104';
begin
  -- 1) Admin
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Administrador General","usuario":"admin"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, area_id, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Administrador General', 'admin', 'admin', null, true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol;

  -- 2) Recepción
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'recepcion@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Atención y Recepción","usuario":"recepcion"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, area_id, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'Atención y Recepción', 'recepcion', 'recepcion', null, true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol;

  -- 3) Supervisor
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'supervisor@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Supervisor de Planta","usuario":"supervisor"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, area_id, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003', 'Supervisor de Planta', 'supervisor', 'supervisor', null, true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol;

  -- 4) Operador Diseño
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'op_diseno@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Operador de Diseño","usuario":"op_diseno"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, area_id, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004', 'Operador de Diseño', 'op_diseno', 'operador', v_diseno_id, true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol, area_id = excluded.area_id;

  -- 5) Operador Impresión
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'op_impresion@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Operador de Impresión","usuario":"op_impresion"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, area_id, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005', 'Operador de Impresión', 'op_impresion', 'operador', v_impresion_id, true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol, area_id = excluded.area_id;

  -- 6) Operador Troquelado
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'op_troquelado@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Operador de Troquelado","usuario":"op_troquelado"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, area_id, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006', 'Operador de Troquelado', 'op_troquelado', 'operador', v_troquelado_id, true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol, area_id = excluded.area_id;

  -- 7) Operador Corte
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'op_corte@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Operador de Corte","usuario":"op_corte"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, area_id, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007', 'Operador de Corte', 'op_corte', 'operador', v_corte_id, true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol, area_id = excluded.area_id;
end $$;

-- 3. Motivos de Pausa
insert into public.motivos_pausa (id, texto, activo) values
  ('22222222-2222-2222-2222-222222222201', 'Falta de material o insumos', true),
  ('22222222-2222-2222-2222-222222222202', 'Máquina en mantenimiento o calibración', true),
  ('22222222-2222-2222-2222-222222222203', 'Esperando aprobación del cliente', true),
  ('22222222-2222-2222-2222-222222222204', 'Error o corrección en archivo de arte', true),
  ('22222222-2222-2222-2222-222222222205', 'Otro motivo operativo', true)
on conflict (id) do update set texto = excluded.texto, activo = excluded.activo;

-- 4. Clientes de Ejemplo
insert into public.clientes (id, nombre, empresa, telefono, email, notas) values
  ('33333333-3333-3333-3333-333333333301', 'Carlos Mendoza', 'Farmacéutica Nova Salud', '+584121234567', 'cmendoza@novasalud.com', 'Cliente corporativo de empaques médicos'),
  ('33333333-3333-3333-3333-333333333302', 'Elena Rivas', 'Chocolates Artesanales CacaoReal', '+584149876543', 'contacto@cacaoreal.ve', 'Exige papel kraft con acabado satinado'),
  ('33333333-3333-3333-3333-333333333303', 'Marcos Delgado', 'Agencia Creativa Zenith', '+584165551122', 'marcos@zenith.design', 'Campañas publicitarias frecuentes y urgentes')
on conflict (id) do update set nombre = excluded.nombre, empresa = excluded.empresa, telefono = excluded.telefono;

-- 5. Tipos de Trabajo con sus Rutas
insert into public.tipos_trabajo (id, nombre, descripcion, icono, ruta, activo) values
  (
    '44444444-4444-4444-4444-444444444401',
    'Caja Plegadiza (Tuck End)',
    'Empaque plegadizo con solapas para cosmética, farmacia o alimentos',
    'Box',
    array['11111111-1111-1111-1111-111111111101'::uuid, '11111111-1111-1111-1111-111111111102'::uuid, '11111111-1111-1111-1111-111111111103'::uuid, '11111111-1111-1111-1111-111111111104'::uuid],
    true
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    'Folleto Publicitario Tríptico',
    'Folleto promocional en papel glasé con doble pliegue',
    'FileText',
    array['11111111-1111-1111-1111-111111111101'::uuid, '11111111-1111-1111-1111-111111111102'::uuid, '11111111-1111-1111-1111-111111111104'::uuid],
    true
  ),
  (
    '44444444-4444-4444-4444-444444444403',
    'Etiqueta Troquelada Adhesiva',
    'Stickers y etiquetas en vinil adhesivo o papel con forma troquelada',
    'Tag',
    array['11111111-1111-1111-1111-111111111101'::uuid, '11111111-1111-1111-1111-111111111102'::uuid, '11111111-1111-1111-1111-111111111103'::uuid],
    true
  )
on conflict (id) do update set nombre = excluded.nombre, ruta = excluded.ruta;

-- ==============================================================================
-- SEED DE DATOS DE PRUEBA: 11 ÁREAS, 3 FASES, CATÁLOGOS Y USUARIOS MULTI-ÁREA
-- ==============================================================================

-- 1. Insertar las 11 Áreas de Producción
insert into public.areas (
  id, nombre, slug, color_hex, icono_lucide, orden, fase, tipo_espera,
  requiere_aprobacion_cliente, es_condicional, es_control_calidad, es_despacho, activa
) values
  -- PRE-PRENSA
  ('11111111-1111-1111-1111-111111111101', 'Diseño gráfico / Arte final', 'diseno-arte-final', '#8B5CF6', 'Palette', 1, 'pre_prensa', 'ninguna', true, false, false, false, true),
  ('11111111-1111-1111-1111-111111111105', 'Planchas', 'planchas', '#6366F1', 'Disc', 2, 'pre_prensa', 'proveedor', false, false, false, false, true),
  ('11111111-1111-1111-1111-111111111106', 'Preparación de materiales', 'preparacion-materiales', '#06B6D4', 'Boxes', 3, 'pre_prensa', 'ninguna', false, false, false, false, true),
  -- PRENSA
  ('11111111-1111-1111-1111-111111111102', 'Impresión / Secado', 'impresion-secado', '#3B82F6', 'Printer', 4, 'prensa', 'secado', false, false, false, false, true),
  -- POST-PRENSA
  ('11111111-1111-1111-1111-111111111107', 'Acabado', 'acabado', '#EC4899', 'Sparkles', 5, 'post_prensa', 'ninguna', false, true, false, false, true),
  ('11111111-1111-1111-1111-111111111103', 'Troquelado', 'troquelado', '#F59E0B', 'Scissors', 6, 'post_prensa', 'ninguna', false, true, false, false, true),
  ('11111111-1111-1111-1111-111111111104', 'Corte y refile / Esquineado', 'corte-refile', '#10B981', 'Layers', 7, 'post_prensa', 'ninguna', false, false, false, false, true),
  ('11111111-1111-1111-1111-111111111108', 'Encuadernación / Trabajo manual', 'encuadernacion-manual', '#D97706', 'BookOpen', 8, 'post_prensa', 'ninguna', false, true, false, false, true),
  ('11111111-1111-1111-1111-111111111109', 'Revisión y control de calidad', 'control-calidad', '#EF4444', 'ShieldCheck', 9, 'post_prensa', 'ninguna', false, false, true, false, true),
  ('11111111-1111-1111-1111-111111111110', 'Embalaje', 'embalaje', '#84CC16', 'PackageCheck', 10, 'post_prensa', 'ninguna', false, false, false, false, true),
  ('11111111-1111-1111-1111-111111111111', 'Despacho', 'despacho', '#059669', 'Truck', 11, 'post_prensa', 'ninguna', false, false, false, true, true)
on conflict (id) do update set
  nombre = excluded.nombre,
  slug = excluded.slug,
  color_hex = excluded.color_hex,
  icono_lucide = excluded.icono_lucide,
  orden = excluded.orden,
  fase = excluded.fase,
  tipo_espera = excluded.tipo_espera,
  requiere_aprobacion_cliente = excluded.requiere_aprobacion_cliente,
  es_condicional = excluded.es_condicional,
  es_control_calidad = excluded.es_control_calidad,
  es_despacho = excluded.es_despacho,
  activa = excluded.activa;

-- 2. Crear Usuarios en auth.users y perfiles en public.profiles (PIN: '123456')
do $$
declare
  v_encrypted_pw text := crypt('123456', gen_salt('bf'));
  v_diseno_id uuid := '11111111-1111-1111-1111-111111111101';
  v_planchas_id uuid := '11111111-1111-1111-1111-111111111105';
  v_materiales_id uuid := '11111111-1111-1111-1111-111111111106';
  v_impresion_id uuid := '11111111-1111-1111-1111-111111111102';
  v_acabado_id uuid := '11111111-1111-1111-1111-111111111107';
  v_troquelado_id uuid := '11111111-1111-1111-1111-111111111103';
  v_corte_id uuid := '11111111-1111-1111-1111-111111111104';
  v_encuadernacion_id uuid := '11111111-1111-1111-1111-111111111108';
  v_calidad_id uuid := '11111111-1111-1111-1111-111111111109';
  v_embalaje_id uuid := '11111111-1111-1111-1111-111111111110';
  v_despacho_id uuid := '11111111-1111-1111-1111-111111111111';

  v_op_embalaje_despacho_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008';
begin
  -- 1) Admin
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Administrador General","usuario":"admin"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Administrador General', 'admin', 'admin', true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol;

  -- 2) Recepción
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'recepcion@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Atención y Recepción","usuario":"recepcion"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'Atención y Recepción', 'recepcion', 'recepcion', true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol;

  -- 3) Supervisor
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'supervisor@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Supervisor de Planta","usuario":"supervisor"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003', 'Supervisor de Planta', 'supervisor', 'supervisor', true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol;

  -- 4) Operador Diseño
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'op_diseno@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Operador de Diseño","usuario":"op_diseno"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004', 'Operador de Diseño', 'op_diseno', 'operador', true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol;

  insert into public.usuario_areas (usuario_id, area_id) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004', v_diseno_id)
  on conflict do nothing;

  -- 5) Operador Impresión
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'op_impresion@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Operador de Impresión","usuario":"op_impresion"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005', 'Operador de Impresión', 'op_impresion', 'operador', true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol;

  insert into public.usuario_areas (usuario_id, area_id) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005', v_impresion_id)
  on conflict do nothing;

  -- 6) Operador Troquelado
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'op_troquelado@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Operador de Troquelado","usuario":"op_troquelado"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006', 'Operador de Troquelado', 'op_troquelado', 'operador', true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol;

  insert into public.usuario_areas (usuario_id, area_id) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006', v_troquelado_id)
  on conflict do nothing;

  -- 7) Operador Corte
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'op_corte@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Operador de Corte","usuario":"op_corte"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, activo)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007', 'Operador de Corte', 'op_corte', 'operador', true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol;

  insert into public.usuario_areas (usuario_id, area_id) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007', v_corte_id)
  on conflict do nothing;

  -- 8) Operador Multi-Área (Embalaje + Despacho)
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values (v_op_embalaje_despacho_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'op_logistica@nodo26.local', v_encrypted_pw, now(), '{"provider":"email","providers":["email"]}', '{"nombre_completo":"Operador de Embalaje y Despacho","usuario":"op_logistica"}', now(), now())
  on conflict (id) do update set encrypted_password = v_encrypted_pw;

  insert into public.profiles (id, nombre_completo, usuario, rol, activo)
  values (v_op_embalaje_despacho_id, 'Operador de Embalaje y Despacho', 'op_logistica', 'operador', true)
  on conflict (id) do update set nombre_completo = excluded.nombre_completo, usuario = excluded.usuario, rol = excluded.rol;

  insert into public.usuario_areas (usuario_id, area_id) values
    (v_op_embalaje_despacho_id, v_embalaje_id),
    (v_op_embalaje_despacho_id, v_despacho_id)
  on conflict do nothing;
end $$;

-- 3. Catálogos: Acabados, Proveedores y Motivos de Pausa
insert into public.acabados (nombre, activo) values
  ('UV', true),
  ('Plastificado', true),
  ('Barniz litho', true)
on conflict (nombre) do update set activo = true;

insert into public.proveedores (nombre, telefono, tipo, activo) values
  ('Planchas Gráficas Express C.A.', '+584141112233', 'planchas', true)
on conflict do nothing;

insert into public.motivos_pausa (id, texto, activo) values
  ('22222222-2222-2222-2222-222222222201', 'Falta de material o insumos', true),
  ('22222222-2222-2222-2222-222222222202', 'Máquina en mantenimiento o calibración', true),
  ('22222222-2222-2222-2222-222222222203', 'Esperando aprobación del cliente', true),
  ('22222222-2222-2222-2222-222222222204', 'Error o corrección en archivo de arte', true),
  ('22222222-2222-2222-2222-222222222205', 'Esperando planchas', true),
  ('22222222-2222-2222-2222-222222222206', 'Otro motivo operativo', true)
on conflict (id) do update set texto = excluded.texto, activo = excluded.activo;

-- 4. Clientes de Ejemplo
insert into public.clientes (id, nombre, empresa, telefono, email, notas) values
  ('33333333-3333-3333-3333-333333333301', 'Carlos Mendoza', 'Farmacéutica Nova Salud', '+584121234567', 'cmendoza@novasalud.com', 'Cliente corporativo de empaques médicos'),
  ('33333333-3333-3333-3333-333333333302', 'Elena Rivas', 'Chocolates Artesanales CacaoReal', '+584149876543', 'contacto@cacaoreal.ve', 'Exige papel kraft con acabado satinado'),
  ('33333333-3333-3333-3333-333333333303', 'Marcos Delgado', 'Agencia Creativa Zenith', '+584165551122', 'marcos@zenith.design', 'Campañas publicitarias frecuentes y urgentes')
on conflict (id) do update set nombre = excluded.nombre, empresa = excluded.empresa, telefono = excluded.telefono;

-- 5. Tipos de Trabajo con sus Nuevas Rutas de Producción
insert into public.tipos_trabajo (id, nombre, descripcion, icono, ruta, activo) values
  (
    '44444444-4444-4444-4444-444444444401',
    'Caja Plegadiza (Tuck End)',
    'Empaque plegadizo con solapas para cosmética, farmacia o alimentos',
    'Box',
    array[
      '11111111-1111-1111-1111-111111111101'::uuid, -- 1. Diseño gráfico / Arte final
      '11111111-1111-1111-1111-111111111105'::uuid, -- 2. Planchas
      '11111111-1111-1111-1111-111111111106'::uuid, -- 3. Preparación de materiales
      '11111111-1111-1111-1111-111111111102'::uuid, -- 4. Impresión / Secado
      '11111111-1111-1111-1111-111111111107'::uuid, -- 5. Acabado
      '11111111-1111-1111-1111-111111111103'::uuid, -- 6. Troquelado
      '11111111-1111-1111-1111-111111111104'::uuid, -- 7. Corte y refile / Esquineado
      '11111111-1111-1111-1111-111111111109'::uuid, -- 9. Revisión y control de calidad
      '11111111-1111-1111-1111-111111111110'::uuid, -- 10. Embalaje
      '11111111-1111-1111-1111-111111111111'::uuid  -- 11. Despacho
    ],
    true
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    'Folleto Publicitario Tríptico',
    'Folleto promocional en papel glasé con doble pliegue',
    'FileText',
    array[
      '11111111-1111-1111-1111-111111111101'::uuid, -- 1. Diseño
      '11111111-1111-1111-1111-111111111105'::uuid, -- 2. Planchas
      '11111111-1111-1111-1111-111111111106'::uuid, -- 3. Preparación de materiales
      '11111111-1111-1111-1111-111111111102'::uuid, -- 4. Impresión / Secado
      '11111111-1111-1111-1111-111111111107'::uuid, -- 5. Acabado
      '11111111-1111-1111-1111-111111111104'::uuid, -- 7. Corte y refile
      '11111111-1111-1111-1111-111111111108'::uuid, -- 8. Encuadernación / Manual
      '11111111-1111-1111-1111-111111111109'::uuid, -- 9. Calidad
      '11111111-1111-1111-1111-111111111110'::uuid, -- 10. Embalaje
      '11111111-1111-1111-1111-111111111111'::uuid  -- 11. Despacho
    ],
    true
  ),
  (
    '44444444-4444-4444-4444-444444444403',
    'Etiqueta Troquelada Adhesiva',
    'Stickers y etiquetas en vinil adhesivo o papel con forma troquelada',
    'Tag',
    array[
      '11111111-1111-1111-1111-111111111101'::uuid, -- 1. Diseño
      '11111111-1111-1111-1111-111111111105'::uuid, -- 2. Planchas
      '11111111-1111-1111-1111-111111111106'::uuid, -- 3. Preparación de materiales
      '11111111-1111-1111-1111-111111111102'::uuid, -- 4. Impresión / Secado
      '11111111-1111-1111-1111-111111111107'::uuid, -- 5. Acabado
      '11111111-1111-1111-1111-111111111103'::uuid, -- 6. Troquelado
      '11111111-1111-1111-1111-111111111104'::uuid, -- 7. Corte y refile
      '11111111-1111-1111-1111-111111111109'::uuid, -- 9. Calidad
      '11111111-1111-1111-1111-111111111110'::uuid, -- 10. Embalaje
      '11111111-1111-1111-1111-111111111111'::uuid  -- 11. Despacho
    ],
    true
  )
on conflict (id) do update set nombre = excluded.nombre, ruta = excluded.ruta;

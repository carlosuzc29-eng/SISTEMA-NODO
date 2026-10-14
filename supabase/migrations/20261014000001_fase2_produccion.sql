-- ==============================================================================
-- FASE 2: NÚCLEO DE PRODUCCIÓN — Clientes, Tipos de Trabajo, Órdenes, Etapas y Eventos
-- ==============================================================================

-- 1. Tabla de Clientes
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  empresa text,
  telefono text,
  email text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_clientes_updated_at
before update on public.clientes
for each row execute function set_updated_at();

-- 2. Tabla de Motivos de Pausa
create table if not exists public.motivos_pausa (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_motivos_pausa_updated_at
before update on public.motivos_pausa
for each row execute function set_updated_at();

-- 3. Tabla de Tipos de Trabajo con constructor de ruta
create table if not exists public.tipos_trabajo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  icono text not null default 'Box',
  ruta uuid[] not null default '{}', -- IDs de áreas en secuencia ordenada
  modelo_empaque_id uuid null,       -- Enlazado en Fase 3
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_tipos_trabajo_updated_at
before update on public.tipos_trabajo
for each row execute function set_updated_at();

-- 4. Secuencia para correlativo de Órdenes de Trabajo (OT-0001)
create sequence if not exists public.ordenes_codigo_seq start 1;

create or replace function public.generar_codigo_ot()
returns text as $$
declare
  v_num bigint;
begin
  v_num := nextval('public.ordenes_codigo_seq');
  return 'OT-' || lpad(v_num::text, 4, '0');
end;
$$ language plpgsql;

-- 5. Tabla de Órdenes de Trabajo (OT)
create table if not exists public.ordenes (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default public.generar_codigo_ot(),
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  tipo_trabajo_id uuid not null references public.tipos_trabajo(id) on delete restrict,
  titulo text not null,
  descripcion text,
  cantidad int not null check (cantidad > 0),
  material text,
  medidas text,
  tintas text,
  acabados text,
  prioridad prioridad_ot not null default 'normal',
  fecha_entrega date not null,
  estado estado_ot not null default 'recibida',
  area_actual_id uuid references public.areas(id) on delete set null,
  creada_por uuid references public.profiles(id) on delete set null,
  entregada_en timestamptz,
  entregada_a text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ordenes_estado on public.ordenes(estado);
create index if not exists idx_ordenes_area_actual on public.ordenes(area_actual_id);
create index if not exists idx_ordenes_cliente on public.ordenes(cliente_id);
create index if not exists idx_ordenes_prioridad_fecha on public.ordenes(prioridad, fecha_entrega);

create trigger tr_ordenes_updated_at
before update on public.ordenes
for each row execute function set_updated_at();

-- 6. Tabla de Etapas de la Orden (Secuencia por Áreas)
create table if not exists public.orden_etapas (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references public.ordenes(id) on delete cascade,
  area_id uuid not null references public.areas(id) on delete restrict,
  secuencia int not null,
  estado estado_etapa not null default 'bloqueada',
  operador_id uuid references public.profiles(id) on delete set null,
  iniciada_en timestamptz,
  terminada_en timestamptz,
  motivo_pausa_id uuid references public.motivos_pausa(id) on delete set null,
  nota_pausa text,
  minutos_trabajados int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(orden_id, secuencia)
);

create index if not exists idx_orden_etapas_area_estado on public.orden_etapas(area_id, estado);
create index if not exists idx_orden_etapas_orden on public.orden_etapas(orden_id);

create trigger tr_orden_etapas_updated_at
before update on public.orden_etapas
for each row execute function set_updated_at();

-- 7. Tabla de Eventos de la Orden (Línea de tiempo)
create table if not exists public.eventos_orden (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references public.ordenes(id) on delete cascade,
  etapa_id uuid references public.orden_etapas(id) on delete set null,
  usuario_id uuid references public.profiles(id) on delete set null,
  tipo text not null, -- creada, iniciada, pausada, reanudada, terminada, aprobada, cambios, entregada, comentario, archivo
  detalle jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_eventos_orden on public.eventos_orden(orden_id, created_at desc);

-- 8. Tabla de Comentarios
create table if not exists public.comentarios (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references public.ordenes(id) on delete cascade,
  autor_id uuid references public.profiles(id) on delete set null,
  texto text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_comentarios_orden on public.comentarios(orden_id, created_at desc);

-- 9. Tabla de Archivos Adjuntos de la Orden
create table if not exists public.archivos_orden (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references public.ordenes(id) on delete cascade,
  nombre text not null,
  storage_path text not null,
  mime text,
  tamano bigint,
  subido_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 10. FUNCIONES RPC TRANSACCIONALES (SECURITY DEFINER)
-- ==============================================================================

-- RPC 1: Crear Orden con sus Etapas según ruta
create or replace function public.crear_orden(
  p_cliente_id uuid,
  p_tipo_trabajo_id uuid,
  p_titulo text,
  p_descripcion text,
  p_cantidad int,
  p_material text,
  p_medidas text,
  p_tintas text,
  p_acabados text,
  p_prioridad prioridad_ot,
  p_fecha_entrega date,
  p_ruta uuid[] default null
)
returns jsonb as $$
declare
  v_orden_id uuid;
  v_codigo text;
  v_ruta uuid[];
  v_area_id uuid;
  v_sec int := 1;
  v_user_id uuid := auth.uid();
  v_primera_area_id uuid := null;
begin
  -- Si no se envía ruta personalizada, tomar la del tipo de trabajo
  if p_ruta is not null and array_length(p_ruta, 1) > 0 then
    v_ruta := p_ruta;
  else
    select ruta into v_ruta from public.tipos_trabajo where id = p_tipo_trabajo_id;
  end if;

  if v_ruta is null or array_length(v_ruta, 1) = 0 then
    raise exception 'La ruta de producción debe contener al menos un área.';
  end if;

  v_primera_area_id := v_ruta[1];

  -- Insertar Orden de Trabajo
  insert into public.ordenes (
    cliente_id, tipo_trabajo_id, titulo, descripcion, cantidad,
    material, medidas, tintas, acabados, prioridad, fecha_entrega,
    estado, area_actual_id, creada_por
  ) values (
    p_cliente_id, p_tipo_trabajo_id, p_titulo, p_descripcion, p_cantidad,
    p_material, p_medidas, p_tintas, p_acabados, p_prioridad, p_fecha_entrega,
    'en_produccion', v_primera_area_id, v_user_id
  ) returning id, codigo into v_orden_id, v_codigo;

  -- Crear las etapas
  foreach v_area_id in array v_ruta loop
    insert into public.orden_etapas (
      orden_id, area_id, secuencia, estado
    ) values (
      v_orden_id,
      v_area_id,
      v_sec,
      case when v_sec = 1 then 'en_cola'::estado_etapa else 'bloqueada'::estado_etapa end
    );
    v_sec := v_sec + 1;
  end loop;

  -- Registrar evento de creación
  insert into public.eventos_orden (
    orden_id, usuario_id, tipo, detalle
  ) values (
    v_orden_id, v_user_id, 'creada',
    jsonb_build_object(
      'codigo', v_codigo,
      'titulo', p_titulo,
      'cantidad', p_cantidad,
      'ruta_longitud', array_length(v_ruta, 1)
    )
  );

  return jsonb_build_object('ok', true, 'id', v_orden_id, 'codigo', v_codigo);
end;
$$ language plpgsql security definer;

-- RPC 2: Iniciar Etapa
create or replace function public.iniciar_etapa(p_etapa_id uuid)
returns jsonb as $$
declare
  v_etapa record;
  v_user_id uuid := auth.uid();
  v_rol rol_usuario;
  v_user_area uuid;
begin
  select e.*, o.codigo, a.nombre as area_nombre
  into v_etapa
  from public.orden_etapas e
  join public.ordenes o on o.id = e.orden_id
  join public.areas a on a.id = e.area_id
  where e.id = p_etapa_id;

  if not found then
    raise exception 'Etapa no encontrada.';
  end if;

  select rol, area_id into v_rol, v_user_area from public.profiles where id = v_user_id;

  -- Validar permisos de área si es operador
  if v_rol = 'operador' and v_user_area <> v_etapa.area_id then
    raise exception 'No tienes permisos para operar etapas fuera de tu área asignada.';
  end if;

  -- Actualizar etapa a en_proceso
  update public.orden_etapas
  set estado = 'en_proceso',
      operador_id = coalesce(operador_id, v_user_id),
      iniciada_en = coalesce(iniciada_en, now())
  where id = p_etapa_id;

  -- Actualizar área actual de la orden si corresponde
  update public.ordenes
  set area_actual_id = v_etapa.area_id,
      estado = 'en_produccion'
  where id = v_etapa.orden_id;

  -- Registrar evento
  insert into public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  values (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'iniciada',
    jsonb_build_object('area', v_etapa.area_nombre, 'secuencia', v_etapa.secuencia)
  );

  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- RPC 3: Pausar Etapa
create or replace function public.pausar_etapa(
  p_etapa_id uuid,
  p_motivo_id uuid,
  p_nota text default null
)
returns jsonb as $$
declare
  v_etapa record;
  v_motivo_texto text;
  v_user_id uuid := auth.uid();
begin
  select e.*, a.nombre as area_nombre into v_etapa
  from public.orden_etapas e
  join public.areas a on a.id = e.area_id
  where e.id = p_etapa_id;

  select texto into v_motivo_texto from public.motivos_pausa where id = p_motivo_id;

  update public.orden_etapas
  set estado = 'pausada',
      motivo_pausa_id = p_motivo_id,
      nota_pausa = p_nota
  where id = p_etapa_id;

  insert into public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  values (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'pausada',
    jsonb_build_object(
      'motivo', coalesce(v_motivo_texto, 'No especificado'),
      'nota', p_nota,
      'area', v_etapa.area_nombre
    )
  );

  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- RPC 4: Reanudar Etapa
create or replace function public.reanudar_etapa(p_etapa_id uuid)
returns jsonb as $$
declare
  v_etapa record;
  v_user_id uuid := auth.uid();
begin
  select e.*, a.nombre as area_nombre into v_etapa
  from public.orden_etapas e
  join public.areas a on a.id = e.area_id
  where e.id = p_etapa_id;

  update public.orden_etapas
  set estado = 'en_proceso',
      motivo_pausa_id = null,
      nota_pausa = null
  where id = p_etapa_id;

  insert into public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  values (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'reanudada',
    jsonb_build_object('area', v_etapa.area_nombre)
  );

  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- RPC 5: Terminar Etapa y Activar Siguiente
create or replace function public.terminar_etapa(p_etapa_id uuid)
returns jsonb as $$
declare
  v_etapa record;
  v_siguiente record;
  v_minutos int := 0;
  v_user_id uuid := auth.uid();
begin
  select e.*, a.nombre as area_nombre into v_etapa
  from public.orden_etapas e
  join public.areas a on a.id = e.area_id
  where e.id = p_etapa_id;

  if v_etapa.iniciada_en is not null then
    v_minutos := greatest(1, round(extract(epoch from (now() - v_etapa.iniciada_en)) / 60));
  end if;

  -- 1. Marcar etapa actual como terminada
  update public.orden_etapas
  set estado = 'terminada',
      terminada_en = now(),
      minutos_trabajados = v_minutos
  where id = p_etapa_id;

  -- 2. Buscar si existe siguiente etapa
  select * into v_siguiente
  from public.orden_etapas
  where orden_id = v_etapa.orden_id and secuencia = v_etapa.secuencia + 1;

  if found then
    -- Activar siguiente etapa
    update public.orden_etapas
    set estado = 'en_cola'
    where id = v_siguiente.id;

    -- Actualizar orden con la nueva área actual
    update public.ordenes
    set area_actual_id = v_siguiente.area_id
    where id = v_etapa.orden_id;
  else
    -- Era la última etapa de la ruta: pasa a lista para entrega
    update public.ordenes
    set estado = 'lista_entrega',
      area_actual_id = null
    where id = v_etapa.orden_id;
  end if;

  -- Registrar evento
  insert into public.eventos_orden (orden_id, etapa_id, usuario_id, tipo, detalle)
  values (
    v_etapa.orden_id, p_etapa_id, v_user_id, 'terminada',
    jsonb_build_object(
      'area', v_etapa.area_nombre,
      'minutos_trabajados', v_minutos,
      'es_final', not found
    )
  );

  return jsonb_build_object('ok', true, 'es_final', not found);
end;
$$ language plpgsql security definer;

-- RPC 6: Marcar Orden como Entregada
create or replace function public.marcar_entregada(
  p_orden_id uuid,
  p_entregada_a text
)
returns jsonb as $$
declare
  v_user_id uuid := auth.uid();
begin
  update public.ordenes
  set estado = 'entregada',
      entregada_en = now(),
      entregada_a = p_entregada_a
  where id = p_orden_id;

  insert into public.eventos_orden (orden_id, usuario_id, tipo, detalle)
  values (
    p_orden_id, v_user_id, 'entregada',
    jsonb_build_object('entregada_a', p_entregada_a, 'fecha', now())
  );

  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.clientes enable row level security;
alter table public.motivos_pausa enable row level security;
alter table public.tipos_trabajo enable row level security;
alter table public.ordenes enable row level security;
alter table public.orden_etapas enable row level security;
alter table public.eventos_orden enable row level security;
alter table public.comentarios enable row level security;
alter table public.archivos_orden enable row level security;

-- Políticas para Clientes:
create policy "Lectura de clientes por usuarios autenticados"
  on public.clientes for select to authenticated using (true);

create policy "Crear y editar clientes por recepcion, supervisor y admin"
  on public.clientes for all to authenticated
  using (public.auth_rol() in ('admin', 'recepcion', 'supervisor'))
  with check (public.auth_rol() in ('admin', 'recepcion', 'supervisor'));

-- Políticas para Motivos de Pausa:
create policy "Lectura de motivos de pausa"
  on public.motivos_pausa for select to authenticated using (true);

create policy "Admin administra motivos de pausa"
  on public.motivos_pausa for all to authenticated
  using (public.auth_rol() = 'admin') with check (public.auth_rol() = 'admin');

-- Políticas para Tipos de Trabajo:
create policy "Lectura de tipos de trabajo"
  on public.tipos_trabajo for select to authenticated using (true);

create policy "Admin administra tipos de trabajo"
  on public.tipos_trabajo for all to authenticated
  using (public.auth_rol() = 'admin') with check (public.auth_rol() = 'admin');

-- Políticas para Órdenes:
create policy "Lectura de ordenes"
  on public.ordenes for select to authenticated
  using (
    public.auth_rol() in ('admin', 'recepcion', 'supervisor')
    or id in (
      select orden_id from public.orden_etapas where area_id = public.auth_area()
    )
  );

create policy "Crear y editar ordenes"
  on public.ordenes for all to authenticated
  using (public.auth_rol() in ('admin', 'recepcion', 'supervisor'))
  with check (public.auth_rol() in ('admin', 'recepcion', 'supervisor'));

-- Políticas para Etapas:
create policy "Lectura de etapas"
  on public.orden_etapas for select to authenticated
  using (
    public.auth_rol() in ('admin', 'recepcion', 'supervisor')
    or area_id = public.auth_area()
  );

create policy "Operar etapas"
  on public.orden_etapas for update to authenticated
  using (
    public.auth_rol() in ('admin', 'supervisor')
    or area_id = public.auth_area()
  );

-- Políticas para Eventos, Comentarios y Archivos:
create policy "Lectura de eventos"
  on public.eventos_orden for select to authenticated using (true);

create policy "Lectura de comentarios"
  on public.comentarios for select to authenticated using (true);

create policy "Crear comentarios"
  on public.comentarios for insert to authenticated
  with check (true);

create policy "Lectura de archivos"
  on public.archivos_orden for select to authenticated using (true);

create policy "Subir archivos"
  on public.archivos_orden for insert to authenticated
  with check (true);

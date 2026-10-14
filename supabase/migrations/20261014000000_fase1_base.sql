-- ==============================================================================
-- FASE 1: FUNDACIONES — Esquema base, enums, perfiles, áreas y autenticación
-- ==============================================================================

-- 1. Extensiones necesarias
create extension if not exists "uuid-ossp";

-- 2. Enums
create type rol_usuario as enum ('admin', 'recepcion', 'supervisor', 'operador');
create type prioridad_ot as enum ('baja', 'normal', 'alta', 'urgente');
create type estado_ot as enum ('recibida', 'en_produccion', 'lista_entrega', 'entregada', 'cancelada');
create type estado_etapa as enum ('bloqueada', 'en_cola', 'en_proceso', 'pausada', 'esperando_cliente', 'terminada');
create type estado_aprobacion as enum ('pendiente', 'aprobado', 'cambios_solicitados', 'expirado');

-- 3. Trigger genérico para updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 4. Tabla de Áreas de Producción
create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text unique not null,
  color_hex text not null default '#2563EB',
  icono_lucide text not null default 'Layers',
  orden int not null default 0,
  requiere_aprobacion_cliente boolean not null default false,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_areas_updated_at
before update on public.areas
for each row execute function set_updated_at();

-- 5. Tabla de Perfiles vinculada a auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  usuario text unique not null,
  rol rol_usuario not null default 'operador',
  area_id uuid references public.areas(id) on delete set null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_profiles_updated_at
before update on public.profiles
for each row execute function set_updated_at();

-- 6. Tabla de Registro de Intentos de Login (Fuerza Bruta)
create table if not exists public.intentos_login (
  id uuid primary key default gen_random_uuid(),
  usuario text not null,
  exito boolean not null default false,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists idx_intentos_login_usuario_created on public.intentos_login(usuario, created_at desc);

-- 7. Funciones Helper de Autenticación
create or replace function public.auth_rol()
returns rol_usuario as $$
  select rol from public.profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function public.auth_area()
returns uuid as $$
  select area_id from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- 8. Función para verificar bloqueo por fuerza bruta (5 fallos en 15 minutos)
create or replace function public.verificar_bloqueo_login(p_usuario text)
returns jsonb as $$
declare
  v_fallos int;
  v_primer_fallo timestamptz;
  v_minutos_restantes int;
begin
  select count(*), min(created_at)
  into v_fallos, v_primer_fallo
  from (
    select created_at
    from public.intentos_login
    where lower(usuario) = lower(p_usuario)
      and exito = false
      and created_at > now() - interval '15 minutes'
    order by created_at desc
    limit 5
  ) t;

  if v_fallos >= 5 then
    v_minutos_restantes := ceil(extract(epoch from ((v_primer_fallo + interval '15 minutes') - now())) / 60);
    if v_minutos_restantes <= 0 then
      v_minutos_restantes := 1;
    end if;
    return jsonb_build_object('bloqueado', true, 'minutos_restantes', v_minutos_restantes);
  end if;

  return jsonb_build_object('bloqueado', false, 'minutos_restantes', 0);
end;
$$ language plpgsql security definer;

-- 9. Función para registrar intento de login
create or replace function public.registrar_intento_login(p_usuario text, p_exito boolean, p_ip text default null)
returns void as $$
begin
  insert into public.intentos_login (usuario, exito, ip)
  values (lower(p_usuario), p_exito, p_ip);

  -- Si el login es exitoso, podemos limpiar intentos fallidos antiguos de este usuario
  if p_exito then
    delete from public.intentos_login
    where lower(usuario) = lower(p_usuario)
      and exito = false;
  end if;
end;
$$ language plpgsql security definer;

-- 10. Políticas de Seguridad (Row Level Security - RLS)
alter table public.areas enable row level security;
alter table public.profiles enable row level security;
alter table public.intentos_login enable row level security;

-- Políticas para Areas:
create policy "Cualquiera autenticado puede leer áreas activas"
  on public.areas for select
  to authenticated
  using (activa = true or public.auth_rol() = 'admin');

create policy "Solo admin puede modificar áreas"
  on public.areas for all
  to authenticated
  using (public.auth_rol() = 'admin')
  with check (public.auth_rol() = 'admin');

-- Políticas para Profiles:
create policy "Usuarios pueden ver su propio perfil o supervisores ver todos"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or public.auth_rol() in ('admin', 'supervisor', 'recepcion')
  );

create policy "Solo admin puede insertar o modificar perfiles"
  on public.profiles for all
  to authenticated
  using (public.auth_rol() = 'admin')
  with check (public.auth_rol() = 'admin');

-- Políticas para Intentos de Login:
create policy "Solo admin puede consultar intentos de login"
  on public.intentos_login for select
  to authenticated
  using (public.auth_rol() = 'admin');

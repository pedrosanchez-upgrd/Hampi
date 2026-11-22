-- Hampi — esquema inicial (Fase 1). Aplicado en el proyecto Supabase «Hampi» (absuudeafyxnjvnbejrv) el 22-nov-2026.
-- Cada usuario solo ve y cambia lo suyo (RLS). Fase 1: solo casos ficticios.

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  rol text not null default 'estudiante' check (rol in ('estudiante', 'interno', 'medico', 'docente')),
  institucion text,
  creado_en timestamptz not null default now()
);

create table public.aceptaciones_terminos (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  version text not null,
  aceptado_en timestamptz not null default now()
);

create table public.historias (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  especialidad text not null default 'medicina_interna',
  contenido jsonb not null default '{}'::jsonb,
  estado text not null default 'borrador' check (estado in ('borrador', 'firmada')),
  ficticia boolean not null default true,
  creada_en timestamptz not null default now(),
  actualizada_en timestamptz not null default now()
);
create index historias_autor_idx on public.historias (autor_id, actualizada_en desc);

-- Registro de quién abrió o cambió cada historia.
create table public.auditoria (
  id bigint generated always as identity primary key,
  usuario_id uuid not null default auth.uid(),
  historia_id uuid references public.historias (id) on delete set null,
  accion text not null,
  en timestamptz not null default now()
);

alter table public.perfiles enable row level security;
alter table public.aceptaciones_terminos enable row level security;
alter table public.historias enable row level security;
alter table public.auditoria enable row level security;

create policy "perfil propio" on public.perfiles
  for all to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "ver mis aceptaciones" on public.aceptaciones_terminos
  for select to authenticated using (usuario_id = (select auth.uid()));
create policy "registrar mi aceptación" on public.aceptaciones_terminos
  for insert to authenticated with check (usuario_id = (select auth.uid()));

create policy "mis historias" on public.historias
  for all to authenticated using (autor_id = (select auth.uid())) with check (autor_id = (select auth.uid()));

create policy "registrar mi auditoría" on public.auditoria
  for insert to authenticated with check (usuario_id = (select auth.uid()));
-- La auditoría no se puede leer ni borrar desde la app (solo administración).

-- Índices para las llaves foráneas (recomendación del asesor de rendimiento).
create index aceptaciones_usuario_idx on public.aceptaciones_terminos (usuario_id);
create index auditoria_usuario_idx on public.auditoria (usuario_id);
create index auditoria_historia_idx on public.auditoria (historia_id);

-- Nada para usuarios sin sesión: los datos de salud solo se ven con cuenta.
revoke all on public.perfiles, public.aceptaciones_terminos, public.historias, public.auditoria from anon;

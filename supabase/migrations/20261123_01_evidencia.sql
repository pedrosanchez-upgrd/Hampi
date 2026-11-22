-- Hampi — Fase 3: base de conocimiento que se actualiza sola, con revisión médica.
-- NO APLICADA. Aplicar solo con autorización explícita del dueño.
--
-- Flujo:
--   1. La función «buscar-evidencia» (servidor) busca en PubMed, SciELO y Elsevier, deja solo
--      revistas Q1/Q2 (Scimago), A1/A2 (Publindex) o del catálogo Latindex, y guarda cada artículo
--      en «evidencia» como «pendiente». La app no puede insertar evidencia.
--   2. Un revisor (médico nombrado por administración) aprueba o rechaza cada artículo.
--   3. De un artículo aprobado, un revisor propone una regla (diagnóstico, hallazgo, LR) copiando
--      la frase del resumen donde aparece el número.
--   4. La regla cuenta en los diagnósticos solo cuando la confirma un SEGUNDO revisor distinto.

create table public.revisores (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  especialidad text,
  agregado_en timestamptz not null default now()
);
-- Solo administración agrega revisores (panel de Supabase): no hay política de escritura.

create function public.es_revisor() returns boolean
  language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.revisores where usuario_id = (select auth.uid())) $$;

-- Calidad de cada revista, por ISSN (se carga desde Scimago, Latindex y Publindex).
create table public.revistas (
  issn text primary key check (issn ~ '^[0-9]{4}-[0-9]{3}[0-9X]$'),
  nombre text not null,
  scimago_cuartil text check (scimago_cuartil in ('Q1', 'Q2', 'Q3', 'Q4')),
  scimago_anio int,
  latindex_catalogo boolean not null default false,
  publindex text check (publindex in ('A1', 'A2', 'B', 'C')),
  actualizada_en timestamptz not null default now()
);

create table public.evidencia (
  id uuid primary key default gen_random_uuid(),
  base text not null check (base in ('pubmed', 'scielo', 'elsevier')),
  identificador text not null,            -- PMID, PID de SciELO o EID de Elsevier
  doi text,
  titulo text not null,
  autores text,
  revista text,
  issn text,
  anio int,
  resumen text,
  url text not null,
  idioma text,
  consulta text not null,                 -- lo que se buscó (síntoma o diagnóstico)
  calidad text not null check (calidad in ('Q1', 'Q2', 'A1', 'A2', 'Latindex')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
  nota_revision text,
  revisado_por uuid references auth.users (id),
  revisado_en timestamptz,
  encontrada_en timestamptz not null default now(),
  unique (base, identificador)
);
create index evidencia_estado_idx on public.evidencia (estado, encontrada_en desc);
create index evidencia_revisado_por_idx on public.evidencia (revisado_por);

create table public.reglas_aprobadas (
  id uuid primary key default gen_random_uuid(),
  evidencia_id uuid not null references public.evidencia (id) on delete restrict,
  diagnostico text not null,              -- id del diagnóstico en src/data/conocimiento.ts
  hallazgo text not null,                 -- id del hallazgo
  lr_pos numeric check (lr_pos > 0),
  lr_neg numeric check (lr_neg > 0),
  cualitativo text check (cualitativo in ('sube', 'baja')),
  solo_ausente boolean not null default false,
  cita_textual text not null check (length(cita_textual) >= 20),  -- frase del resumen con el número
  aprobada_por uuid not null default auth.uid() references auth.users (id),
  confirmada_por uuid references auth.users (id),
  creada_en timestamptz not null default now(),
  confirmada_en timestamptz,
  check (lr_pos is not null or lr_neg is not null or cualitativo is not null),
  check (confirmada_por is null or confirmada_por <> aprobada_por)
);
create index reglas_evidencia_idx on public.reglas_aprobadas (evidencia_id);
create index reglas_aprobada_por_idx on public.reglas_aprobadas (aprobada_por);
create index reglas_confirmada_por_idx on public.reglas_aprobadas (confirmada_por);

-- Consultas cruzadas entre evidencia y reglas sin que sus políticas se llamen entre sí (evita recursión).
-- Van en un esquema privado: la API de Supabase no lo expone, así que no se pueden llamar desde la app.
create schema if not exists privado;
revoke all on schema privado from public, anon;
grant usage on schema privado to authenticated;
create function privado.evidencia_aprobada(e uuid) returns boolean
  language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.evidencia where id = e and estado = 'aprobada') $$;
create function privado.tiene_regla_confirmada(e uuid) returns boolean
  language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.reglas_aprobadas where evidencia_id = e and confirmada_por is not null) $$;

alter table public.revisores enable row level security;
alter table public.revistas enable row level security;
alter table public.evidencia enable row level security;
alter table public.reglas_aprobadas enable row level security;

create policy "saber si soy revisor" on public.revisores
  for select to authenticated using (usuario_id = (select auth.uid()));

create policy "ver calidad de revistas" on public.revistas
  for select to authenticated using (true);

create policy "revisores ven la evidencia" on public.evidencia
  for select to authenticated using ((select public.es_revisor()));
-- La cita de una regla ya confirmada la puede ver cualquier usuario con sesión (para verificarla).
create policy "ver artículos de reglas confirmadas" on public.evidencia
  for select to authenticated using ((select privado.tiene_regla_confirmada(id)));
create policy "revisores aprueban o rechazan" on public.evidencia
  for update to authenticated
  using ((select public.es_revisor()))
  with check ((select public.es_revisor()) and revisado_por = (select auth.uid()));

-- Todos ven las reglas confirmadas por dos revisores (las usa el motor); los revisores ven también las pendientes.
create policy "ver reglas" on public.reglas_aprobadas
  for select to authenticated using (confirmada_por is not null or (select public.es_revisor()));
create policy "revisor propone regla de evidencia aprobada" on public.reglas_aprobadas
  for insert to authenticated with check (
    (select public.es_revisor())
    and aprobada_por = (select auth.uid())
    and confirmada_por is null
    and privado.evidencia_aprobada(evidencia_id));
create policy "otro revisor confirma" on public.reglas_aprobadas
  for update to authenticated
  using ((select public.es_revisor()) and confirmada_por is null and aprobada_por <> (select auth.uid()))
  with check (confirmada_por = (select auth.uid()));

-- Columnas que la app puede cambiar (lo demás solo desde el servidor).
revoke update on public.evidencia, public.reglas_aprobadas from authenticated;
grant update (estado, nota_revision, revisado_por, revisado_en) on public.evidencia to authenticated;
grant update (confirmada_por, confirmada_en) on public.reglas_aprobadas to authenticated;
revoke delete on public.evidencia, public.reglas_aprobadas, public.revistas, public.revisores from authenticated;
revoke insert on public.evidencia, public.revistas, public.revisores from authenticated;

revoke all on public.revisores, public.revistas, public.evidencia, public.reglas_aprobadas from anon;
revoke execute on function public.es_revisor(), privado.evidencia_aprobada(uuid), privado.tiene_regla_confirmada(uuid) from anon, public;
grant execute on function public.es_revisor(), privado.evidencia_aprobada(uuid), privado.tiene_regla_confirmada(uuid) to authenticated;

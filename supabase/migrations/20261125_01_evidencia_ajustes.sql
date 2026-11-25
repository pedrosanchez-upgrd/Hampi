-- Hampi — ajustes a la base de evidencia según el asesor de Supabase (25-nov-2026).
-- 1. es_revisor no necesita privilegios elevados: cada usuario ya puede leer su propia fila en «revisores».
-- 2. Una sola política de lectura en «evidencia» (antes eran dos; el asesor de rendimiento lo marcó).

create or replace function public.es_revisor() returns boolean
  language sql stable security invoker set search_path = ''
as $$ select exists (select 1 from public.revisores where usuario_id = (select auth.uid())) $$;

drop policy "revisores ven la evidencia" on public.evidencia;
drop policy "ver artículos de reglas confirmadas" on public.evidencia;
-- Los revisores ven todo; cualquier usuario con sesión ve el artículo de una regla ya confirmada.
create policy "ver evidencia" on public.evidencia
  for select to authenticated using ((select public.es_revisor()) or (select privado.tiene_regla_confirmada(id)));

// Fase 3: la evidencia solo se usa con revisión de dos médicos distintos.
import { describe, it, expect, beforeAll } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'

const R1 = '00000000-0000-0000-0000-0000000000a1' // revisor 1
const R2 = '00000000-0000-0000-0000-0000000000a2' // revisor 2
const U = '00000000-0000-0000-0000-0000000000b1'  // usuario común
let db: PGlite
let evId = ''

const PREPARAR = `
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create role authenticated; create role anon;
grant usage on schema public, auth to authenticated, anon;
-- Como en Supabase: las tablas nuevas nacen con todos los permisos para la app.
alter default privileges in schema public grant all on tables to authenticated, anon;
alter default privileges in schema public grant execute on functions to authenticated, anon, public;
`

async function como(uid: string, sql: string, params: unknown[] = []) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false);`)
  try { return await db.query<Record<string, unknown>>(sql, params) } finally { await db.exec('reset role;') }
}
const falla = async (p: Promise<unknown>) => { let e: unknown = null; try { await p } catch (x) { e = x } ; expect(e).not.toBeNull() }

beforeAll(async () => {
  db = new PGlite()
  await db.exec(PREPARAR)
  await db.exec(readFileSync('supabase/migrations/20261122_01_inicial.sql', 'utf8'))
  await db.exec(readFileSync('supabase/migrations/20261123_01_evidencia.sql', 'utf8'))
  await db.exec(readFileSync('supabase/migrations/20261125_01_evidencia_ajustes.sql', 'utf8'))
  // Lo que hace el servidor (sin RLS): nombrar revisores y guardar un artículo encontrado.
  await db.exec(`insert into auth.users values ('${R1}'), ('${R2}'), ('${U}');
    insert into public.revisores (usuario_id, nombre) values ('${R1}', 'Revisor 1'), ('${R2}', 'Revisor 2');`)
  const r = await db.query<{ id: string }>(`insert into public.evidencia (base, identificador, titulo, url, consulta, calidad)
    values ('pubmed', '123', 'Artículo de prueba', 'https://pubmed.ncbi.nlm.nih.gov/123/', 'dolor toracico', 'Q1') returning id`)
  evId = r.rows[0].id
})

describe('evidencia con revisión', () => {
  it('RLS activo en las 4 tablas nuevas', async () => {
    const r = await db.query<{ relname: string; relrowsecurity: boolean }>(
      `select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r'`)
    for (const t of r.rows) expect(t.relrowsecurity, t.relname).toBe(true)
    expect(r.rows.map((x) => x.relname)).toEqual(expect.arrayContaining(['revisores', 'revistas', 'evidencia', 'reglas_aprobadas']))
  })
  it('un usuario común no ve la evidencia ni puede nombrarse revisor', async () => {
    expect((await como(U, 'select * from public.evidencia')).rows).toEqual([])
    await falla(como(U, `insert into public.revisores (usuario_id, nombre) values ('${U}', 'yo')`))
    expect((await como(U, 'select public.es_revisor() as r')).rows[0].r).toBe(false)
  })
  it('la app no puede insertar ni borrar evidencia', async () => {
    await falla(como(R1, `insert into public.evidencia (base, identificador, titulo, url, consulta, calidad) values ('pubmed','9','x','u','c','Q1')`))
    await falla(como(R1, `delete from public.evidencia`))
  })
  it('no se puede proponer una regla de un artículo sin aprobar', async () => {
    await falla(como(R1, `insert into public.reglas_aprobadas (evidencia_id, diagnostico, hallazgo, lr_pos, cita_textual, aprobada_por)
      values ('${evId}', 'sca', 'irradiaBrazos', 2.3, 'radiation to both arms LR 2.3 (texto del resumen)', '${R1}')`))
  })
  it('el revisor aprueba el artículo; no puede cambiar el título', async () => {
    await como(R1, `update public.evidencia set estado = 'aprobada', revisado_por = '${R1}', revisado_en = now() where id = '${evId}'`)
    expect((await db.query<{ estado: string }>(`select estado from public.evidencia where id = '${evId}'`)).rows[0].estado).toBe('aprobada')
    await falla(como(R1, `update public.evidencia set titulo = 'otro' where id = '${evId}'`))
  })
  it('una regla cuenta solo cuando la confirma un segundo revisor distinto', async () => {
    await como(R1, `insert into public.reglas_aprobadas (evidencia_id, diagnostico, hallazgo, lr_pos, cita_textual, aprobada_por)
      values ('${evId}', 'sca', 'irradiaBrazos', 2.3, 'radiation to both arms LR 2.3 (texto del resumen)', '${R1}')`)
    expect((await como(U, 'select * from public.reglas_aprobadas')).rows).toEqual([]) // aún no confirmada
    await como(R1, `update public.reglas_aprobadas set confirmada_por = '${R1}'`) // el mismo revisor: no aplica
    expect((await db.query(`select * from public.reglas_aprobadas where confirmada_por is not null`)).rows).toEqual([])
    await falla(como(R2, `update public.reglas_aprobadas set lr_pos = 9`)) // nadie cambia el número
    await como(R2, `update public.reglas_aprobadas set confirmada_por = '${R2}', confirmada_en = now()`)
    expect((await como(U, 'select hallazgo, lr_pos from public.reglas_aprobadas')).rows).toEqual([{ hallazgo: 'irradiaBrazos', lr_pos: '2.3' }])
    // Ahora el usuario común sí ve ese artículo (para verificar la cita), pero no los demás.
    expect((await como(U, 'select titulo from public.evidencia')).rows).toEqual([{ titulo: 'Artículo de prueba' }])
  })
  it('un usuario común no puede proponer reglas', async () => {
    await falla(como(U, `insert into public.reglas_aprobadas (evidencia_id, diagnostico, hallazgo, lr_pos, cita_textual, aprobada_por)
      values ('${evId}', 'sca', 'dolorEsfuerzo', 2, 'texto suficientemente largo del resumen', '${U}')`))
  })
  it('anon no ve nada', async () => {
    await db.exec(`set role anon`)
    try {
      await falla(db.query('select * from public.revistas'))
      await falla(db.query(`select privado.evidencia_aprobada('${evId}')`))
    } finally { await db.exec('reset role') }
  })
})

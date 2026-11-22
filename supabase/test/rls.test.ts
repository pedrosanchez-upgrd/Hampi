// Prueba el esquema de Supabase con PGlite (Postgres en memoria): tablas, RLS y políticas.
import { describe, it, expect, beforeAll } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'

const A = '00000000-0000-0000-0000-00000000000a'
const B = '00000000-0000-0000-0000-00000000000b'
let db: PGlite

// Simula lo mínimo de Supabase: esquema auth, auth.uid() y el rol authenticated.
const PREPARAR = `
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create role authenticated;
create role anon;
grant usage on schema public, auth to authenticated;
`

async function como(uid: string, sql: string, params: unknown[] = []) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false);`)
  try { return await db.query(sql, params) } finally { await db.exec('reset role;') }
}

beforeAll(async () => {
  db = new PGlite()
  await db.exec(PREPARAR)
  await db.exec(readFileSync('supabase/migrations/20261122_01_inicial.sql', 'utf8'))
  await db.exec(`grant select, insert, update, delete on all tables in schema public to authenticated;
    grant usage on all sequences in schema public to authenticated;
    insert into auth.users values ('${A}'), ('${B}');`)
})

describe('RLS', () => {
  it('está activado en todas las tablas', async () => {
    const r = await db.query<{ relname: string; relrowsecurity: boolean }>(
      `select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r'`)
    expect(r.rows.length).toBe(4)
    for (const t of r.rows) expect(t.relrowsecurity, t.relname).toBe(true)
  })

  it('cada usuario ve solo sus historias', async () => {
    await como(A, `insert into historias (contenido) values ('{"motivo":{"motivo":"A"}}')`)
    await como(B, `insert into historias (contenido) values ('{"motivo":{"motivo":"B"}}')`)
    const a = await como(A, 'select contenido from historias')
    expect(a.rows).toHaveLength(1)
    expect(JSON.stringify(a.rows[0])).toContain('"A"')
  })

  it('no se puede crear una historia a nombre de otro', async () => {
    await expect(como(A, `insert into historias (autor_id) values ('${B}')`)).rejects.toThrow()
  })

  it('no se puede cambiar ni borrar la historia de otro', async () => {
    await como(A, `update historias set estado = 'firmada'`)
    await como(A, `delete from historias`)
    const b = await como(B, 'select estado from historias')
    expect(b.rows).toEqual([{ estado: 'borrador' }])
  })

  it('la aceptación de términos queda registrada y es privada', async () => {
    await como(A, `insert into aceptaciones_terminos (usuario_id, version) values ('${A}', '0.1-borrador')`)
    expect((await como(B, 'select * from aceptaciones_terminos')).rows).toHaveLength(0)
    expect((await como(A, 'select version from aceptaciones_terminos')).rows).toEqual([{ version: '0.1-borrador' }])
  })

  it('la auditoría se puede escribir pero no leer desde la app', async () => {
    await como(A, `insert into auditoria (accion) values ('abrir')`)
    expect((await como(A, 'select * from auditoria')).rows).toHaveLength(0)
  })
})

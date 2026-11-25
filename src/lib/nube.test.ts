import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { guardarHistoria, mensajeError, registrarAceptacion, resumenHistoria, validarCuenta, crearCuenta } from './nube'
import { historiaVacia } from './historia'

/** Cliente simulado: registra las llamadas a las tablas. */
function clienteFalso(respuestas: Record<string, unknown> = {}) {
  const llamadas: { tabla: string; op: string; arg?: unknown }[] = []
  const cadena = (tabla: string) => {
    const r: Record<string, unknown> = {}
    const fin = (op: string) => respuestas[`${tabla}.${op}`] ?? { data: null, error: null }
    for (const op of ['select', 'eq', 'order', 'limit'] as const)
      r[op] = (arg?: unknown) => { llamadas.push({ tabla, op, arg }); return Object.assign(Promise.resolve(fin(op)), r) }
    r.insert = (arg: unknown) => { llamadas.push({ tabla, op: 'insert', arg }); const p = Promise.resolve(fin('insert')); return Object.assign(p, { select: () => ({ single: () => Promise.resolve(fin('insert.single')) }) }) }
    r.update = (arg: unknown) => { llamadas.push({ tabla, op: 'update', arg }); return { eq: () => Promise.resolve(fin('update')) } }
    return r
  }
  const c = { from: vi.fn(cadena), auth: { signUp: vi.fn(async () => ({ data: { session: null }, error: null })) } }
  return { c: c as unknown as SupabaseClient, llamadas, auth: c.auth }
}

describe('mensajes y validación', () => {
  it('traduce los errores comunes', () => {
    expect(mensajeError(new Error('Invalid login credentials'))).toBe('Correo o contraseña incorrectos.')
    expect(mensajeError(new TypeError('Failed to fetch'))).toContain('No se pudo conectar')
    expect(mensajeError({ message: 'User already registered' })).toContain('ya tiene una cuenta')
    expect(mensajeError(new Error('Email not confirmed'))).toContain('confirmar tu correo')
  })
  it('valida correo, contraseña y nombre', () => {
    expect(validarCuenta('malo', '12345678')).toBe('Escribe un correo válido.')
    expect(validarCuenta('a@b.ec', '1234')).toContain('8 caracteres')
    expect(validarCuenta('a@b.ec', '12345678', { nombre: 'Ana Pérez', rol: 'interno', institucion: '' })).toContain('letras y números')
    expect(validarCuenta('a@b.ec', 'clave1234', { nombre: 'An', rol: 'interno', institucion: '' })).toContain('nombre')
    expect(validarCuenta('a@b.ec', 'clave1234', { nombre: 'Ana Pérez', rol: 'interno', institucion: 'UC' })).toBeNull()
  })
  it('resume una historia para la lista', () => {
    const h = historiaVacia()
    expect(resumenHistoria(h)).toBe('Historia sin datos')
    h.filiacion = { sexo: 'Mujer', edad: '34' }
    h.motivo = { motivo: 'fiebre' }
    expect(resumenHistoria(h)).toBe('Mujer, 34 años · fiebre')
  })
})

describe('guardado en la nube', () => {
  it('crea la historia como ficticia la primera vez y la actualiza después', async () => {
    const { c, llamadas } = clienteFalso({ 'historias.insert.single': { data: { id: 'h1' }, error: null } })
    const id = await guardarHistoria(null, historiaVacia(), c)
    expect(id).toBe('h1')
    expect(llamadas.find((l) => l.tabla === 'historias' && l.op === 'insert')!.arg).toMatchObject({ ficticia: true })
    expect(llamadas.some((l) => l.tabla === 'auditoria' && l.op === 'insert')).toBe(true)
    await guardarHistoria('h1', historiaVacia(), c)
    expect(llamadas.some((l) => l.tabla === 'historias' && l.op === 'update')).toBe(true)
  })
  it('registra la aceptación de términos una sola vez por versión', async () => {
    const sesion = { user: { id: 'u1', user_metadata: {} } } as never
    const yaEsta = clienteFalso({ 'aceptaciones_terminos.limit': { data: [{ id: 1 }], error: null } })
    await registrarAceptacion(sesion, 'v1', yaEsta.c)
    expect(yaEsta.llamadas.some((l) => l.op === 'insert')).toBe(false)
    const nueva = clienteFalso({ 'aceptaciones_terminos.limit': { data: [], error: null } })
    await registrarAceptacion(sesion, 'v1', nueva.c)
    expect(nueva.llamadas.find((l) => l.op === 'insert')!.arg).toEqual({ usuario_id: 'u1', version: 'v1' })
  })
  it('crear cuenta avisa cuando hay que confirmar el correo', async () => {
    const { c, auth } = clienteFalso()
    const r = await crearCuenta(' ana@uc.ec ', 'clave1234', { nombre: 'Ana', rol: 'interno', institucion: 'UC' }, c)
    expect(r.necesitaConfirmar).toBe(true)
    expect(auth.signUp).toHaveBeenCalledWith(expect.objectContaining({ email: 'ana@uc.ec', options: expect.objectContaining({ data: { nombre: 'Ana', rol: 'interno', institucion: 'UC' } }) }))
  })
})

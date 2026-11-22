// Conexión con Supabase: cuentas (correo y contraseña) e historias guardadas en la nube.
// La seguridad la da RLS en la base: cada usuario solo ve y cambia lo suyo.
// Fase 1: solo casos ficticios (columna `ficticia` = true).

import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_CLAVE_PUBLICA, SUPABASE_URL } from './config'
import type { Historia } from './historia'

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_CLAVE_PUBLICA, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

export type Rol = 'estudiante' | 'interno' | 'medico' | 'docente'
export const ROLES: { id: Rol; nombre: string }[] = [
  { id: 'estudiante', nombre: 'Estudiante' },
  { id: 'interno', nombre: 'Interno/a' },
  { id: 'medico', nombre: 'Médico/a' },
  { id: 'docente', nombre: 'Docente' },
]

export interface DatosRegistro { nombre: string; rol: Rol; institucion: string }

export interface HistoriaGuardada {
  id: string
  contenido: Historia
  estado: 'borrador' | 'firmada'
  actualizada_en: string
}

/** Traduce los errores de Supabase a mensajes claros en español. */
export function mensajeError(e: unknown): string {
  const m = (e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e)).toLowerCase()
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('load failed') || m.includes('fetch'))
    return 'No se pudo conectar con el servidor. Revise su internet. En la vista de prueba de Claude el inicio de sesión no funciona: use «Seguir sin cuenta».'
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (m.includes('email not confirmed')) return 'Falta confirmar su correo: abra el enlace que le enviamos y vuelva a entrar.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ese correo ya tiene una cuenta. Use «Entrar» o «¿Olvidó su contraseña?».'
  if (m.includes('password should be') || m.includes('weak password')) return 'La contraseña es muy débil: use al menos 8 caracteres, con letras y números.'
  if (m.includes('rate limit')) return 'Se enviaron demasiados correos seguidos. Intente de nuevo en una hora.'
  if (m.includes('invalid email') || m.includes('unable to validate email')) return 'Ese correo no es válido.'
  return 'Ocurrió un error. Intente de nuevo; si sigue, avise al equipo de Hampi.'
}

/** Validación previa en el formulario, antes de llamar al servidor. */
export function validarCuenta(correo: string, clave: string, registro?: DatosRegistro): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) return 'Escriba un correo válido.'
  if (clave.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (registro) {
    if (!/[a-zA-Z]/.test(clave) || !/\d/.test(clave)) return 'La contraseña debe tener letras y números.'
    if (registro.nombre.trim().length < 3) return 'Escriba su nombre completo.'
  }
  return null
}

/** Título corto de una historia para la lista («Hombre, 58 años · dolor en el pecho»). */
export function resumenHistoria(h: Historia): string {
  const f = h.filiacion ?? {}, m = h.motivo ?? {}
  const quien = [f.sexo, f.edad && `${f.edad} años`].filter(Boolean).join(', ')
  const motivo = (m.motivo ?? '').trim()
  return [quien, motivo].filter(Boolean).join(' · ') || 'Historia sin datos'
}

export async function entrar(correo: string, clave: string, c = supabase) {
  const { data, error } = await c.auth.signInWithPassword({ email: correo.trim(), password: clave })
  if (error) throw error
  return data.session
}

export async function crearCuenta(correo: string, clave: string, datos: DatosRegistro, c = supabase) {
  const { data, error } = await c.auth.signUp({
    email: correo.trim(), password: clave,
    options: { data: datos, emailRedirectTo: typeof location !== 'undefined' ? location.origin : undefined },
  })
  if (error) throw error
  // Con confirmación de correo activa, no hay sesión hasta que abra el enlace.
  return { session: data.session, necesitaConfirmar: !data.session }
}

export async function recuperarClave(correo: string, c = supabase) {
  const { error } = await c.auth.resetPasswordForEmail(correo.trim(), { redirectTo: typeof location !== 'undefined' ? location.origin : undefined })
  if (error) throw error
}

export async function cambiarClave(clave: string, c = supabase) {
  const { error } = await c.auth.updateUser({ password: clave })
  if (error) throw error
}

export async function salir(c = supabase) {
  await c.auth.signOut()
}

/** Crea o actualiza el perfil con los datos que el usuario dio al registrarse. */
export async function asegurarPerfil(s: Session, c = supabase) {
  const md = (s.user.user_metadata ?? {}) as Partial<DatosRegistro>
  const { error } = await c.from('perfiles').upsert({
    id: s.user.id, nombre: md.nombre ?? null, rol: md.rol ?? 'estudiante', institucion: md.institucion ?? null,
  })
  if (error) throw error
}

/** Registra la aceptación de esta versión de los términos (una vez por versión). */
export async function registrarAceptacion(s: Session, version: string, c = supabase) {
  const { data, error } = await c.from('aceptaciones_terminos').select('id').eq('version', version).limit(1)
  if (error) throw error
  if (data && data.length) return
  const { error: e2 } = await c.from('aceptaciones_terminos').insert({ usuario_id: s.user.id, version })
  if (e2) throw e2
}

export async function listarHistorias(c = supabase): Promise<HistoriaGuardada[]> {
  const { data, error } = await c.from('historias').select('id, contenido, estado, actualizada_en')
    .order('actualizada_en', { ascending: false }).limit(100)
  if (error) throw error
  return (data ?? []) as HistoriaGuardada[]
}

/** Guarda la historia: la crea si no tiene id, o la actualiza. Devuelve el id. */
export async function guardarHistoria(id: string | null, contenido: Historia, c = supabase): Promise<string> {
  const ahora = new Date().toISOString()
  if (id) {
    const { error } = await c.from('historias').update({ contenido, actualizada_en: ahora }).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await c.from('historias').insert({ contenido, ficticia: true }).select('id').single()
  if (error) throw error
  await auditar('crear', data.id, c)
  return data.id as string
}

export async function borrarHistoria(id: string, c = supabase) {
  await auditar('borrar', id, c)
  const { error } = await c.from('historias').delete().eq('id', id)
  if (error) throw error
}

/** Registro de quién creó, abrió o borró cada historia. Si falla, no detiene el trabajo. */
export async function auditar(accion: 'crear' | 'abrir' | 'borrar', historiaId: string | null, c = supabase) {
  try { await c.from('auditoria').insert({ accion, historia_id: historiaId }) } catch { /* no bloquear al usuario */ }
}

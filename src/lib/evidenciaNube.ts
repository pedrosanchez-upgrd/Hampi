// Fase 3: base de conocimiento en Supabase (evidencia encontrada, revisión médica y reglas aprobadas).
// Ver supabase/migrations/20261123_01_evidencia.sql. Nada se usa en los diagnósticos sin dos revisores.

import type { Fuente, Regla } from '../data/conocimiento'
import { establecerReglasAprobadas } from './motor'
import { supabase } from './nube'

export interface Evidencia {
  id: string
  base: 'pubmed' | 'scielo' | 'elsevier'
  identificador: string
  doi: string | null
  titulo: string
  autores: string | null
  revista: string | null
  anio: number | null
  resumen: string | null
  url: string
  consulta: string
  calidad: string
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  nota_revision: string | null
  encontrada_en: string
}

export interface ReglaPropuesta {
  evidencia_id: string
  diagnostico: string
  hallazgo: string
  lr_pos: number | null
  lr_neg: number | null
  cualitativo: 'sube' | 'baja' | null
  solo_ausente: boolean
  cita_textual: string
}

export interface ReglaGuardada extends ReglaPropuesta {
  id: string
  aprobada_por: string
  confirmada_por: string | null
  evidencia?: Evidencia
}

const normal = (t: string) => t.replace(/\s+/g, ' ').trim().toLowerCase()
const numeroEn = (n: number, texto: string) => {
  const v = String(n)
  return [v, v.replace('.', ','), n.toFixed(1), n.toFixed(2)].some((x) => texto.includes(x))
}

/**
 * Controles antes de proponer una regla. La cita debe copiarse del resumen y contener el número:
 * así ningún LR entra a Hampi sin estar escrito en el artículo.
 */
export function validarRegla(p: ReglaPropuesta, resumen: string | null): string | null {
  if (!resumen) return 'Este artículo no trae resumen: no se pueden sacar números de él.'
  if (p.cita_textual.trim().length < 20) return 'Copie la frase completa del resumen donde aparece el dato.'
  if (!normal(resumen).includes(normal(p.cita_textual))) return 'La cita debe copiarse tal cual del resumen (no se encontró en el texto).'
  const nums = [p.lr_pos, p.lr_neg].filter((x): x is number => x !== null)
  if (!nums.length && !p.cualitativo) return 'Indique LR positivo, LR negativo o si el hallazgo sube o baja el diagnóstico.'
  for (const n of nums) {
    if (!(n > 0) || n > 1000) return 'El LR debe ser un número mayor que 0.'
    if (!numeroEn(n, p.cita_textual)) return `El número ${String(n).replace('.', ',')} no aparece en la cita copiada.`
  }
  return null
}

export async function esRevisor(c = supabase): Promise<boolean> {
  const { data } = await c.rpc('es_revisor')
  return data === true
}

export async function listarEvidencia(estado: Evidencia['estado'], c = supabase): Promise<Evidencia[]> {
  const { data, error } = await c.from('evidencia').select('*').eq('estado', estado).order('encontrada_en', { ascending: false }).limit(50)
  if (error) throw error
  return data as Evidencia[]
}

export async function revisarEvidencia(id: string, estado: 'aprobada' | 'rechazada', nota: string, usuarioId: string, c = supabase) {
  const { error } = await c.from('evidencia')
    .update({ estado, nota_revision: nota.trim() || null, revisado_por: usuarioId, revisado_en: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function proponerRegla(p: ReglaPropuesta, usuarioId: string, c = supabase) {
  const { error } = await c.from('reglas_aprobadas').insert({ ...p, aprobada_por: usuarioId })
  if (error) throw error
}

export async function listarReglas(c = supabase): Promise<ReglaGuardada[]> {
  const { data, error } = await c.from('reglas_aprobadas').select('*, evidencia(*)').order('creada_en', { ascending: false })
  if (error) throw error
  return data as ReglaGuardada[]
}

export async function confirmarRegla(id: string, usuarioId: string, c = supabase) {
  const { error } = await c.from('reglas_aprobadas').update({ confirmada_por: usuarioId, confirmada_en: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

/** Pide al servidor buscar evidencia nueva para un diagnóstico (solo revisores). */
export async function buscarEvidencia(diagnostico: string, c = supabase) {
  const { data, error } = await c.functions.invoke('buscar-evidencia', { body: { diagnostico } })
  if (error) throw error
  return data as { resumen: Record<string, { encontrados: number; aceptados: number; sinCalidad: number; errores: string[] }> }
}

/** Convierte las reglas confirmadas por dos revisores al formato del motor. */
export function reglasParaMotor(filas: ReglaGuardada[]): { diagnostico: string; regla: Regla; fuente: Fuente }[] {
  return filas.filter((f) => f.confirmada_por && f.evidencia).map((f) => {
    const e = f.evidencia!
    const id = `ev:${f.id}`
    const regla: Regla = {
      hallazgo: f.hallazgo, fuente: id,
      ...(f.lr_pos !== null ? { lrPos: Number(f.lr_pos) } : {}),
      ...(f.lr_neg !== null ? { lrNeg: Number(f.lr_neg) } : {}),
      ...(f.cualitativo ? { cualitativo: f.cualitativo } : {}),
      ...(f.solo_ausente ? { soloAusente: true } : {}),
      nota: `«${f.cita_textual}»`,
    }
    const fuente: Fuente = {
      id, titulo: e.titulo, url: e.url, doi: e.doi ?? undefined, base: e.base, calidad: e.calidad,
      pmid: e.base === 'pubmed' ? e.identificador : undefined,
      cita: [e.autores, e.revista, e.anio].filter(Boolean).join('. '),
    }
    return { diagnostico: f.diagnostico, regla, fuente }
  })
}

/** Al iniciar sesión: el motor suma las reglas confirmadas. Si falla, sigue con las del código. */
export async function cargarReglasAprobadas(c = supabase): Promise<number> {
  try {
    const r = reglasParaMotor((await listarReglas(c)).filter((x) => x.confirmada_por))
    establecerReglasAprobadas(r)
    return r.length
  } catch {
    return 0
  }
}

// Motor de diagnósticos en vivo: suma los pesos (log de las razones de verosimilitud)
// de los hallazgos registrados y ordena los diagnósticos. Es determinista: con los
// mismos datos siempre da el mismo orden. No calcula probabilidades absolutas.

import { DIAGNOSTICOS, FUENTES, HALLAZGOS, type Fuente, type Regla } from '../data/conocimiento'
import { sintomasAbiertos, type Historia } from './historia'

export type Estado = 'si' | 'no'

const PESO_CUALITATIVO = 2 // ×2 si sube, ×0,5 si baja
const LR_MINIMO = 0.01 // evita log(0) cuando el artículo reporta LR 0

const num = (v: string | undefined) => {
  const n = Number((v ?? '').replace(',', '.'))
  return v && v.trim() !== '' && !Number.isNaN(n) ? n : null
}

/** Hallazgos que se deducen de otros datos de la historia. */
export function hallazgosAutomaticos(h: Historia): Record<string, Estado> {
  const out: Record<string, Estado> = {}
  const fc = num(h.examen?.fc), t = num(h.examen?.temp), fr = num(h.examen?.fr), edad = num(h.filiacion?.edad)
  if (fc !== null) out.taquicardia = fc > 100 ? 'si' : 'no'
  if (t !== null) out.fiebreMedida = t >= 38 ? 'si' : 'no'
  if (fr !== null) out.taquipnea = fr > 24 ? 'si' : 'no'
  if (edad !== null) out.edad40 = edad >= 40 ? 'si' : 'no'
  return out
}

/** Estado de cada hallazgo: lo marcado a mano manda sobre lo automático. */
export function estadoHallazgos(h: Historia): Record<string, Estado> {
  const manual = Object.fromEntries(
    Object.entries(h.hallazgos ?? {}).filter(([, v]) => v === 'si' || v === 'no'),
  ) as Record<string, Estado>
  return { ...hallazgosAutomaticos(h), ...manual }
}

export interface Razon {
  texto: string
  factor: number
  tipo: 'lr' | 'cualitativo'
  presente: boolean
  nota?: string
  fuente: Fuente
}

export interface Resultado {
  id: string
  nombre: string
  grave: boolean
  /** Producto de los factores (equivale a una razón de verosimilitud combinada). */
  factor: number
  razones: Razon[]
  fuentes: Fuente[]
  nota?: string
  descartado: boolean
}

function factorDe(r: Regla, estado: Estado): { factor: number; tipo: 'lr' | 'cualitativo' } | null {
  if (r.cualitativo) {
    const sube = r.cualitativo === 'sube'
    if (estado === 'si') return { factor: sube ? PESO_CUALITATIVO : 1 / PESO_CUALITATIVO, tipo: 'cualitativo' }
    if (r.ausenteCuenta) return { factor: sube ? 1 / PESO_CUALITATIVO : PESO_CUALITATIVO, tipo: 'cualitativo' }
    return null
  }
  const lr = estado === 'si' ? r.lrPos : r.lrNeg
  return lr === undefined ? null : { factor: Math.max(lr, LR_MINIMO), tipo: 'lr' }
}

export function diagnosticosEnVivo(h: Historia): Resultado[] {
  const abiertos = new Set(sintomasAbiertos(h))
  const estados = estadoHallazgos(h)
  const sexo = h.filiacion?.sexo
  const descartados = new Set((h.diagnosticosVivo?.descartados ?? '').split(',').filter(Boolean))

  const resultados = DIAGNOSTICOS
    .filter((d) => d.sintomas.some((s) => abiertos.has(s)))
    .filter((d) => !d.soloSexo || d.soloSexo === sexo)
    .filter((d) => !d.requiere || estados[d.requiere] === 'si')
    .map((d) => {
      const razones: Razon[] = []
      for (const r of d.reglas) {
        const e = estados[r.hallazgo]
        if (!e) continue
        const f = factorDe(r, e)
        if (!f || f.factor === 1) continue
        const hz = HALLAZGOS.find((x) => x.id === r.hallazgo)!
        razones.push({ texto: hz.texto, presente: e === 'si', nota: r.nota, fuente: FUENTES[r.fuente], ...f })
      }
      const factor = razones.reduce((acc, r) => acc * r.factor, 1)
      const fuentes = [...new Set(d.reglas.map((r) => r.fuente))].map((id) => FUENTES[id])
      return { id: d.id, nombre: d.nombre, grave: d.grave, factor, razones, fuentes, nota: d.nota, descartado: descartados.has(d.id) }
    })

  // Orden: no descartados primero; luego por factor; a igual factor, los graves arriba.
  return resultados.sort((a, b) =>
    Number(a.descartado) - Number(b.descartado) ||
    Math.log10(b.factor) - Math.log10(a.factor) ||
    Number(b.grave) - Number(a.grave))
}

/** Hallazgos a mostrar en una pestaña de síntoma. */
export const hallazgosDeSintoma = (id: string) => HALLAZGOS.filter((x) => x.sintomas.includes(id))

export function formatoFactor(f: number): string {
  if (f >= 10) return `×${Math.round(f)}`
  if (f >= 1) return `×${f.toFixed(1).replace('.', ',')}`
  return `×${f.toFixed(2).replace('.', ',')}`
}

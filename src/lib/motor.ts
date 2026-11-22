// Motor de diagnósticos en vivo: suma los pesos (log de las razones de verosimilitud)
// de los hallazgos registrados y ordena los diagnósticos. Es determinista: con los
// mismos datos siempre da el mismo orden. No calcula probabilidades absolutas.

import { DIAGNOSTICOS, FUENTES, HALLAZGOS, type Fuente, type Regla } from '../data/conocimiento'
import { sintomasAbiertos, type Historia } from './historia'
import { EPIDEMIOLOGICOS, PATOLOGICOS } from '../data/antecedentes'

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
  if (fc !== null) out.taquicardia = out.taquicardiaSangrado = fc > 100 ? 'si' : 'no'
  const emb = h.personales?.embarazo
  if (emb) out.embarazoPosible = emb === 'No' ? 'no' : 'si'
  if (t !== null) out.fiebreMedida = t >= 38 ? 'si' : 'no'
  if (fr !== null) out.taquipnea = fr > 24 ? 'si' : 'no'
  if (edad !== null) out.edad40 = edad >= 40 ? 'si' : 'no'
  // Antecedentes conectados: «Sí» en cualquiera de los que alimentan un hallazgo lo marca presente;
  // «No» en todos los que lo alimentan lo marca ausente.
  const a = h.antecedentes ?? {}
  const fuentes: [string, string][] = [
    ...PATOLOGICOS.filter((x) => x.hallazgo).map((x) => [`p.${x.id}`, x.hallazgo!] as [string, string]),
    ...EPIDEMIOLOGICOS.filter((x) => x.hallazgo).map((x) => [`e.${x.id}`, x.hallazgo!] as [string, string]),
  ]
  for (const hz of new Set(fuentes.map(([, z]) => z))) {
    const valores = fuentes.filter(([, z]) => z === hz).map(([k]) => a[k])
    if (valores.includes('si')) out[hz] = 'si'
    else if (valores.length && valores.every((v) => v === 'no')) out[hz] = 'no'
  }
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
  /** Producto de todos los factores: ordena la lista. */
  factor: number
  /** Producto solo de las razones de verosimilitud publicadas (lo que se muestra como número). */
  factorLR: number
  /** Cuántos factores cualitativos suben y bajan. */
  cualitativos: { suben: number; bajan: number }
  razones: Razon[]
  fuentes: Fuente[]
  nota?: string
  descartado: boolean
}

function factorDe(r: Regla, estado: Estado): { factor: number; tipo: 'lr' | 'cualitativo' } | null {
  if (r.cualitativo) {
    const sube = r.cualitativo === 'sube'
    if (estado === 'si' && r.soloAusente) return null
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
      if (d.conteo) {
        const c = d.conteo
        const presentes = c.hallazgos.filter((x) => estados[x] === 'si').length
        const sinResponder = c.hallazgos.filter((x) => !estados[x]).length
        const tramo = (n: number) => c.tramos.find((t) => n >= t.min)!
        // Se aplica solo si lo que falta responder ya no puede cambiar el tramo.
        if (sinResponder < c.hallazgos.length && tramo(presentes) === tramo(presentes + sinResponder)) {
          const t = tramo(presentes)
          razones.push({ texto: `${c.texto}: ${presentes} de ${c.hallazgos.length}`, presente: true, nota: c.nota, fuente: FUENTES[c.fuente], factor: t.lr, tipo: 'lr' })
        }
      }
      const factor = razones.reduce((acc, r) => acc * r.factor, 1)
      const factorLR = razones.filter((r) => r.tipo === 'lr').reduce((acc, r) => acc * r.factor, 1)
      const cualitativos = {
        suben: razones.filter((r) => r.tipo === 'cualitativo' && r.factor > 1).length,
        bajan: razones.filter((r) => r.tipo === 'cualitativo' && r.factor < 1).length,
      }
      const fuentes = [...new Set([...d.reglas.map((r) => r.fuente), ...(d.conteo ? [d.conteo.fuente] : [])])].map((id) => FUENTES[id])
      return { id: d.id, nombre: d.nombre, grave: d.grave, factor, factorLR, cualitativos, razones, fuentes, nota: d.nota, descartado: descartados.has(d.id) }
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

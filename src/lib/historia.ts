import { SECCIONES, type Campo } from '../data/secciones'
import { SINTOMAS, detectarSintomas } from '../data/sintomas'

/** Valores de la historia: seccionId -> campoId -> texto. */
export type Historia = Record<string, Record<string, string>>

export const historiaVacia = (): Historia => ({
  ...Object.fromEntries(SECCIONES.map((s) => [s.id, {}])),
  sintomas: {},
  hallazgos: {},
  diagnosticosVivo: {},
})

const lista = (v: string | undefined) => (v ? v.split(',').filter(Boolean) : [])

/** Texto donde se buscan síntomas: motivo de consulta y enfermedad actual. */
export const textoClinico = (h: Historia) =>
  [...Object.values(h.motivo ?? {}), ...Object.values(h.enfermedad ?? {})].join(' ')

/**
 * Pestañas de síntoma abiertas: las detectadas en el texto más las agregadas a mano,
 * menos las que el usuario cerró. Se respeta el orden de la lista de síntomas.
 */
export function sintomasAbiertos(h: Historia): string[] {
  const sx = h.sintomas ?? {}
  const cerrados = new Set(lista(sx.cerrados))
  const ids = new Set([...detectarSintomas(textoClinico(h)), ...lista(sx.manuales)])
  return SINTOMAS.map((s) => s.id).filter((id) => ids.has(id) && !cerrados.has(id))
}

export function abrirSintoma(h: Historia, id: string): Historia {
  const sx = h.sintomas ?? {}
  return { ...h, sintomas: { ...sx,
    manuales: [...new Set([...lista(sx.manuales), id])].join(','),
    cerrados: lista(sx.cerrados).filter((x) => x !== id).join(',') } }
}

export function cerrarSintoma(h: Historia, id: string): Historia {
  const sx = h.sintomas ?? {}
  return { ...h, sintomas: { ...sx,
    manuales: lista(sx.manuales).filter((x) => x !== id).join(','),
    cerrados: [...new Set([...lista(sx.cerrados), id])].join(',') } }
}

/** Signos de alarma marcados como presentes en las pestañas abiertas. */
export function alarmasMarcadas(h: Historia): { sintoma: string; alarma: string }[] {
  const sx = h.sintomas ?? {}
  return sintomasAbiertos(h).flatMap((id) => {
    const s = SINTOMAS.find((x) => x.id === id)!
    return s.alarmas.filter((_, i) => sx[`${id}.a${i}`] === '1').map((a) => ({ sintoma: s.nombre, alarma: a }))
  })
}

/** Valida una cédula ecuatoriana (10 dígitos, provincia y dígito verificador módulo 10). */
export function cedulaValida(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false
  const provincia = Number(cedula.slice(0, 2))
  if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) return false
  if (Number(cedula[2]) >= 6) return false
  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  const suma = coef.reduce((acc, c, i) => {
    const p = Number(cedula[i]) * c
    return acc + (p > 9 ? p - 9 : p)
  }, 0)
  return (10 - (suma % 10)) % 10 === Number(cedula[9])
}

export function imc(pesoKg: number, tallaCm: number): number | null {
  if (!pesoKg || !tallaCm) return null
  const m = tallaCm / 100
  return Math.round((pesoKg / (m * m)) * 10) / 10
}

/**
 * Rangos de aviso de signos vitales en adultos.
 * VALORES PROVISIONALES: los fijan los médicos revisores (en especial la saturación,
 * porque en Cuenca, a unos 2.500 m, la saturación normal es menor que a nivel del mar).
 */
export const RANGOS: Record<string, { min?: number; max?: number; texto: string }> = {
  pas: { min: 90, max: 179, texto: 'Presión sistólica' },
  pad: { max: 119, texto: 'Presión diastólica' },
  fc: { min: 50, max: 120, texto: 'Frecuencia cardiaca' },
  fr: { min: 10, max: 24, texto: 'Frecuencia respiratoria' },
  temp: { min: 35.5, max: 37.9, texto: 'Temperatura' },
  sat: { min: 90, texto: 'Saturación' },
  glucemia: { min: 70, max: 250, texto: 'Glucometría' },
}

export function avisoSigno(campoId: string, valor: string): string | null {
  const r = RANGOS[campoId]
  const n = Number(valor.replace(',', '.'))
  if (!r || valor.trim() === '' || Number.isNaN(n)) return null
  if (r.min !== undefined && n < r.min) return `${r.texto} baja`
  if (r.max !== undefined && n > r.max) return `${r.texto} alta`
  return null
}

export interface Faltante { seccionId: string; seccion: string; campo: string }

export function faltantes(h: Historia): Faltante[] {
  const out: Faltante[] = []
  for (const s of SECCIONES)
    for (const c of s.campos)
      if (c.obligatorio && !(h[s.id]?.[c.id] ?? '').trim())
        out.push({ seccionId: s.id, seccion: s.titulo, campo: c.etiqueta })
  return out
}

const valor = (h: Historia, s: string, c: string) => (h[s]?.[c] ?? '').trim()

function lineaCampo(c: Campo, v: string): string {
  return `${c.corto ?? c.etiqueta}: ${v}${c.unidad && c.tipo === 'numero' ? ` ${c.unidad}` : ''}`
}

/**
 * Redacción ordenada (sin IA todavía): resumen y alertas arriba, luego cada apartado
 * con lo que se llenó. En el Día 8-9 la IA mejora la redacción de este mismo texto.
 */
export function redactar(h: Historia): string {
  const partes: string[] = []
  const edad = valor(h, 'filiacion', 'edad')
  const sexo = valor(h, 'filiacion', 'sexo')
  const motivo = valor(h, 'motivo', 'motivo')
  const tiempo = valor(h, 'motivo', 'tiempo')

  const resumen = [
    [sexo, edad && `${edad} años`].filter(Boolean).join(' de '),
    motivo && `consulta por «${motivo.replace(/^[«"]|[»"]$/g, '')}»`,
    tiempo && `de ${tiempo} de evolución`,
  ].filter(Boolean).join(', ')
  partes.push('RESUMEN\n' + (resumen ? resumen.charAt(0).toUpperCase() + resumen.slice(1) + '.' : '(Sin datos)'))

  const alertas = Object.keys(RANGOS)
    .map((id) => {
      const v = valor(h, 'examen', id)
      const a = avisoSigno(id, v)
      return a ? `${a} (${v} ${SECCIONES[6].campos.find((c) => c.id === id)?.unidad ?? ''})` : null
    })
    .filter(Boolean) as string[]
  for (const a of alarmasMarcadas(h)) alertas.push(`${a.sintoma}: ${a.alarma}`)
  if (alertas.length) partes.push('SIGNOS DE ALARMA\n' + alertas.map((a) => `- ${a}`).join('\n'))

  for (const s of SECCIONES) {
    const lineas: string[] = []
    let grupo: string | undefined
    for (const c of s.campos) {
      const v = valor(h, s.id, c.id)
      if (!v) continue
      if (c.grupo && c.grupo !== grupo) { grupo = c.grupo; lineas.push(`${grupo}:`) }
      lineas.push(c.tipo === 'parrafo' && s.campos.length === 1 ? v : lineaCampo(c, v))
    }
    if (s.id === 'enfermedad') {
      for (const id of sintomasAbiertos(h)) {
        const notas = (h.sintomas?.[`${id}.notas`] ?? '').trim()
        if (notas) lineas.push(`${SINTOMAS.find((x) => x.id === id)!.nombre}: ${notas}`)
      }
    }
    if (s.id === 'examen') {
      const i = imc(Number(valor(h, 'examen', 'peso')), Number(valor(h, 'examen', 'talla')))
      if (i) lineas.push(`IMC: ${i} kg/m²`)
    }
    if (lineas.length) partes.push(`${s.numero}. ${s.titulo.toUpperCase()}\n${lineas.join('\n')}`)
  }
  return partes.join('\n\n')
}

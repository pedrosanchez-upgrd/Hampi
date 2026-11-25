import { SECCIONES, type Campo, type Seccion } from '../data/secciones'
import { SINTOMAS, detectarSintomas } from '../data/sintomas'
import { EPIDEMIOLOGICOS, FAMILIARES, PATOLOGICOS } from '../data/antecedentes'

/** Valores de la historia: seccionId -> campoId -> texto. */
export type Historia = Record<string, Record<string, string>>

export const historiaVacia = (): Historia => ({
  ...Object.fromEntries(SECCIONES.map((s) => [s.id, {}])),
  sintomas: {},
  hallazgos: {},
  diagnosticosVivo: {},
  guia: {},
  antecedentes: {},
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

/** Campos que aplican a este paciente (los gineco-obstétricos solo en mujeres). */
export const camposVisibles = (s: Seccion, h: Historia) =>
  s.campos.filter((c) => !c.soloSexo || h.filiacion?.sexo === c.soloSexo)

export interface Faltante { seccionId: string; seccion: string; campo: string }

export function faltantes(h: Historia): Faltante[] {
  const out: Faltante[] = []
  for (const s of SECCIONES)
    for (const c of camposVisibles(s, h))
      if (c.obligatorio && !(h[s.id]?.[c.id] ?? '').trim())
        out.push({ seccionId: s.id, seccion: s.titulo, campo: c.corto ?? c.etiqueta })
  return out
}

const valor = (h: Historia, s: string, c: string) => (h[s]?.[c] ?? '').trim()

/** «a, b y c» (lista en español con «y» antes del último). */
export const enLista = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`)
/** Unidad pegada si empieza con «/» (8/10), separada en los demás casos (98 lpm). */
const conUnidad = (v: string, u?: string) => (u ? (u.startsWith('/') ? `${v}${u}` : `${v} ${u}`) : v)

function lineaCampo(c: Campo, v: string): string {
  return `${c.corto ?? c.etiqueta}: ${c.tipo === 'numero' ? conUnidad(v, c.unidad) : v}`
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
      return a ? `${a} (${conUnidad(v, SECCIONES[6].campos.find((c) => c.id === id)?.unidad)})` : null
    })
    .filter(Boolean) as string[]
  for (const a of alarmasMarcadas(h)) alertas.push(`${a.sintoma}: ${a.alarma}`)
  if (alertas.length) partes.push('SIGNOS DE ALARMA\n' + alertas.map((a) => `- ${a}`).join('\n'))

  // Numeración seguida: si un apartado queda vacío, no se salta el número.
  let numero = 0
  for (const s of SECCIONES) {
    const lineas: string[] = []
    let grupo: string | undefined
    // Examen físico: los signos vitales en una sola línea, como en la historia en papel.
    if (s.id === 'examen') {
      const x = h.examen ?? {}
      const i = imc(Number(valor(h, 'examen', 'peso')), Number(valor(h, 'examen', 'talla')))
      const vit = [x.pas && x.pad && `PA ${x.pas}/${x.pad} mmHg`, x.fc && `FC ${x.fc} lpm`, x.fr && `FR ${x.fr} rpm`, x.temp && `T ${x.temp} °C`,
        x.sat && `SatO₂ ${x.sat} %${x.oxigeno === 'Con oxígeno' ? ' con oxígeno' : x.oxigeno === 'Aire ambiente' ? ' al aire ambiente' : ''}`,
        x.glucemia && `glucometría ${x.glucemia} mg/dL`, x.peso && `peso ${x.peso} kg`, x.talla && `talla ${x.talla} cm`, i && `IMC ${String(i).replace('.', ',')} kg/m²`]
        .filter((t): t is string => typeof t === 'string' && t !== '').map((t) => t.trim())
      if (vit.length) lineas.push(`Signos vitales: ${vit.join(', ')}.`)
    }
    for (const c of camposVisibles(s, h)) {
      if (c.id === 'tabacoCig' || c.id === 'tabacoAnios') continue
      if (s.id === 'examen' && c.grupo === 'Signos vitales') continue
      const v = valor(h, s.id, c.id)
      if (!v) continue
      if (c.grupo && c.grupo !== grupo) {
        grupo = c.grupo
        // Un grupo de un solo campo no necesita subtítulo («Alérgicos:» + «Alergias: …» sobra).
        if (camposVisibles(s, h).filter((x) => x.grupo === grupo).length > 1) lineas.push(`${grupo}:`)
      }
      lineas.push(c.tipo === 'parrafo' && s.campos.length === 1 ? v : lineaCampo(c, v))
    }
    if (s.id === 'enfermedad') {
      for (const id of sintomasAbiertos(h)) {
        const notas = (h.sintomas?.[`${id}.notas`] ?? '').trim()
        const sx = SINTOMAS.find((x) => x.id === id)!
        if (notas) lineas.push(`${sx.nombre}: ${notas}`)
        // Negativos pertinentes: los signos de alarma que se preguntaron y están ausentes.
        const niega = sx.alarmas.filter((_, i) => h.sintomas?.[`${id}.a${i}`] === '0')
        if (niega.length) lineas.push(`${sx.nombre}: niega ${enLista(niega.map((x) => x.charAt(0).toLowerCase() + x.slice(1)))}.`)
      }
    }
    if (s.id === 'personales') lineas.unshift(...lineasAntecedentes(h))
    if (s.id === 'familiares') lineas.unshift(...lineasFamiliares(h))
    if (s.id === 'personales') {
      const pa = paquetesAnio(h)
      if (pa !== null) lineas.push(`Índice tabáquico: ${String(pa).replace('.', ',')} paquetes/año`)
    }
    if (lineas.length) partes.push(`${++numero}. ${s.titulo.toUpperCase()}\n${lineas.join('\n')}`)
  }
  return partes.join('\n\n')
}

/** Campos que identifican al paciente y nunca se envían a la IA. */
export const CAMPOS_IDENTIFICADORES = ['nombre', 'cedula', 'hcu', 'acompanante', 'nacimiento', 'lugarNacimiento', 'residencia']

/** Texto de la historia sin datos identificadores, para la redacción con IA. */
export function textoParaIA(h: Historia): string {
  const filiacion = { ...(h.filiacion ?? {}) }
  for (const c of CAMPOS_IDENTIFICADORES) delete filiacion[c]
  return redactar({ ...h, filiacion })
}

export interface Progreso { llenos: number; total: number; obligatoriosFaltan: number }

/** Cuántos campos de un apartado tienen datos y cuántos obligatorios faltan. */
export function progresoSeccion(h: Historia, seccionId: string): Progreso {
  const s = SECCIONES.find((x) => x.id === seccionId)
  if (!s) return { llenos: 0, total: 0, obligatoriosFaltan: 0 }
  const v = h[seccionId] ?? {}
  const campos = camposVisibles(s, h)
  let llenos = campos.filter((c) => (v[c.id] ?? '').trim()).length
  let total = campos.length
  // Los antecedentes estructurados cuentan en el progreso de su apartado.
  const a = h.antecedentes ?? {}
  if (seccionId === 'personales') { total += PATOLOGICOS.length; llenos += PATOLOGICOS.filter((x) => a[`p.${x.id}`]).length }
  if (seccionId === 'familiares') { total += FAMILIARES.length; llenos += a['f.ninguno'] === 'si' ? FAMILIARES.length : FAMILIARES.filter((x) => a[`f.${x.id}`]).length }
  const obligatoriosFaltan = campos.filter((c) => c.obligatorio && !(v[c.id] ?? '').trim()).length
  return { llenos, total, obligatoriosFaltan }
}

/** Índice tabáquico: cigarrillos al día × años fumando ÷ 20. */
export function paquetesAnio(h: Historia): number | null {
  const c = Number((h.personales?.tabacoCig ?? '').replace(',', '.'))
  const a = Number((h.personales?.tabacoAnios ?? '').replace(',', '.'))
  if (!c || !a) return null
  return Math.round(((c * a) / 20) * 10) / 10
}

const minus = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)

function lineasAntecedentes(h: Historia): string[] {
  const a = h.antecedentes ?? {}
  const out: string[] = []
  const si = PATOLOGICOS.filter((x) => a[`p.${x.id}`] === 'si')
    .map((x) => x.nombre + (a[`p.${x.id}.det`]?.trim() ? ` (${a[`p.${x.id}.det`].trim()})` : ''))
  const no = PATOLOGICOS.filter((x) => a[`p.${x.id}`] === 'no').map((x) => minus(x.nombre))
  if (si.length) out.push(`Patológicos: ${si.join('; ')}.`)
  if (no.length) out.push(`Niega ${enLista(no)}.`)
  const ep = EPIDEMIOLOGICOS.filter((x) => a[`e.${x.id}`] === 'si')
    .map((x) => x.nombre + (a[`e.${x.id}.det`]?.trim() ? ` (${a[`e.${x.id}.det`].trim()})` : ''))
  const epNo = EPIDEMIOLOGICOS.filter((x) => a[`e.${x.id}`] === 'no').map((x) => minus(x.nombre))
  if (ep.length) out.push(`Epidemiológicos: ${ep.join('; ')}.`)
  if (epNo.length) out.push(`Epidemiológicos: niega ${enLista(epNo)}.`)
  return out
}

function lineasFamiliares(h: Historia): string[] {
  const a = h.antecedentes ?? {}
  const out = FAMILIARES.filter((x) => (a[`f.${x.id}`] ?? '').trim() && a[`f.${x.id}`] !== 'ninguno')
    .map((x) => `${x.nombre}: ${a[`f.${x.id}`].split(',').join(', ').toLowerCase()}.`)
  if (a['f.ninguno'] === 'si' && !out.length) out.push('Niega antecedentes familiares de importancia.')
  return out
}

export interface Aviso { seccionId: string; texto: string; tipo: 'alarma' | 'dato' }

/**
 * Avisos de datos importantes que faltan (no obligatorios para cerrar, pero clínicamente clave).
 * Pendiente de revisión médica.
 */
export function avisos(h: Historia): Aviso[] {
  const out: Aviso[] = []
  const abiertos = sintomasAbiertos(h)
  for (const id of abiertos) {
    const sx = SINTOMAS.find((x) => x.id === id)!
    const sinRegistrar = sx.alarmas.filter((_, i) => !['0', '1'].includes(h.sintomas?.[`${id}.a${i}`] ?? ''))
    if (sinRegistrar.length)
      out.push({ seccionId: 'enfermedad', tipo: 'alarma', texto: `${sx.nombre}: falta registrar ${sinRegistrar.length === 1 ? 'el signo de alarma' : `${sinRegistrar.length} signos de alarma`} (${sinRegistrar.map(minus).join('; ')})` })
  }
  const edad = Number(h.filiacion?.edad)
  const p = h.personales ?? {}
  if (h.filiacion?.sexo === 'Mujer' && edad >= 12 && edad <= 55 && !(p.fum ?? '').trim() && !(p.embarazo ?? '').trim())
    out.push({ seccionId: 'personales', tipo: 'dato', texto: 'Mujer en edad fértil: registra la FUM y la posibilidad de embarazo' })
  const a = h.antecedentes ?? {}
  if (!PATOLOGICOS.some((x) => a[`p.${x.id}`]) && !(p.patologicos ?? '').trim())
    out.push({ seccionId: 'personales', tipo: 'dato', texto: 'Antecedentes patológicos sin registrar: pregunta por enfermedades previas' })
  if (!FAMILIARES.some((x) => a[`f.${x.id}`]) && a['f.ninguno'] !== 'si' && !(h.familiares?.familiares ?? '').trim())
    out.push({ seccionId: 'familiares', tipo: 'dato', texto: 'Antecedentes familiares sin registrar' })
  if (abiertos.includes('fiebre') && !a['e.viaje'])
    out.push({ seccionId: 'personales', tipo: 'dato', texto: 'Fiebre: pregunta por viajes a la Costa o la Amazonía (dengue, malaria, leptospirosis)' })
  if ((abiertos.includes('tos') || abiertos.includes('hemoptisis') || abiertos.includes('peso')) && !a['e.contactoTb'])
    out.push({ seccionId: 'personales', tipo: 'dato', texto: 'Pregunta por contacto con tuberculosis' })
  if (abiertos.includes('palpitaciones') && !a['e.chagas'])
    out.push({ seccionId: 'personales', tipo: 'dato', texto: 'Palpitaciones: pregunta por origen en zona de Chagas' })
  return out
}

/**
 * Presentación oral del caso (1–2 minutos), en el orden que se enseña en semiología:
 * identificación, motivo, enfermedad actual, antecedentes pertinentes, positivos y negativos,
 * examen, impresión diagnóstica y plan. Solo usa lo que el usuario registró.
 */
export function presentacionOral(h: Historia): string {
  const f = h.filiacion ?? {}, m = h.motivo ?? {}, e = h.enfermedad ?? {}, x = h.examen ?? {}, a = h.antecedentes ?? {}
  const partes: string[] = []
  const quien = [f.sexo === 'Mujer' ? 'Mujer' : f.sexo === 'Hombre' ? 'Hombre' : 'Paciente', f.edad && `de ${f.edad} años`, f.ocupacion && `, ${f.ocupacion.toLowerCase()}`].filter(Boolean).join(' ').replace(' ,', ',')
  const ant = PATOLOGICOS.filter((p) => a[`p.${p.id}`] === 'si').map((p) => minus(p.nombre))
  const pa = paquetesAnio(h)
  if (pa) ant.push(`tabaquismo de ${String(pa).replace('.', ',')} paquetes/año`)
  partes.push(`${quien}${ant.length ? `, con antecedentes de ${ant.join(', ')},` : ''} que consulta por «${m.motivo ?? '—'}»${m.tiempo ? ` de ${m.tiempo} de evolución` : ''}.`)
  const alicia = [e.caracter && `de carácter ${e.caracter.toLowerCase()}`, e.localizacion && `de localización ${e.localizacion.toLowerCase()}`,
    e.intensidad && `intensidad ${e.intensidad}/10`, e.irradiacion && `irradiado a ${e.irradiacion.toLowerCase()}`, e.atenuantes && e.atenuantes.toLowerCase()].filter(Boolean)
  if (e.sintoma && alicia.length) partes.push(`${e.sintoma}: ${alicia.join(', ')}.`)
  if (e.acompanantes) partes.push(`Se acompaña de ${e.acompanantes.toLowerCase()}.`)
  const positivas = alarmasMarcadas(h).map((z) => minus(z.alarma))
  if (positivas.length) partes.push(`Signos de alarma presentes: ${enLista(positivas)}.`)
  const negativos = sintomasAbiertos(h).flatMap((id) => {
    const sx = SINTOMAS.find((s) => s.id === id)!
    return sx.alarmas.filter((_, i) => h.sintomas?.[`${id}.a${i}`] === '0').map(minus)
  })
  if (negativos.length) partes.push(`Niega ${enLista(negativos)}.`)
  const vit = [x.pas && x.pad && `PA ${x.pas}/${x.pad} mmHg`, x.fc && `FC ${x.fc} lpm`, x.fr && `FR ${x.fr} rpm`, x.temp && `T ${x.temp} °C`, x.sat && `SatO₂ ${x.sat} %${x.oxigeno === 'Con oxígeno' ? ' con oxígeno' : ''}`].filter(Boolean)
  if (vit.length || x.aspecto) partes.push(`Al examen: ${[vit.join(', '), x.aspecto].filter(Boolean).join('. ')}${/[.]$/.test(x.aspecto ?? '') ? '' : '.'}`)
  const im = h.impresion ?? {}
  if (im.sindromes) partes.push(`Síndromes: ${im.sindromes.trim()}.`.replace('..', '.'))
  partes.push(im.diagnosticos?.trim() ? `Impresión diagnóstica: ${im.diagnosticos.trim().split('\n').join('; ')}.` : 'Impresión diagnóstica: pendiente.')
  if (h.plan?.manejo?.trim()) partes.push(`Plan: ${h.plan.manejo.trim()}${h.plan.examenes?.trim() ? `; exámenes: ${h.plan.examenes.trim()}` : ''}.`)
  return partes.join(' ').replace(/\.\./g, '.')
}

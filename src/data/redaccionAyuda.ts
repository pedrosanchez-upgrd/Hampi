// Sugerencias de redacción que aparecen debajo de cada campo de texto.
// Se arman con lo que el usuario ya registró; nunca inventan datos del paciente.
// Los textos «normales» del examen físico son plantillas de semiología: el médico
// debe usarlos solo si examinó esa región y la encontró normal.
// Pendiente de revisión médica.

import { PATOLOGICOS } from './antecedentes'
import { SINTOMAS } from './sintomas'
import { edadTexto, enLista, sintomasAbiertos, type Historia } from '../lib/historia'
import { diagnosticosEnVivo } from '../lib/motor'

export interface Sugerencia {
  etiqueta: string
  texto: string
}

const minus = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)
const limpio = (t?: string) => (t ?? '').trim()

/** Examen físico normal por región (plantillas de semiología). */
export const EXAMEN_NORMAL: Record<string, string> = {
  aspecto: 'Paciente consciente, orientado en tiempo, espacio y persona, hidratado, sin facies de dolor ni dificultad respiratoria.',
  cabezaCuello: 'Normocéfalo. Pupilas isocóricas y fotorreactivas. Mucosas orales húmedas. Cuello sin ingurgitación yugular, tiroides no palpable, sin adenopatías.',
  torax: 'Tórax simétrico, expansibilidad conservada. Murmullo vesicular conservado en ambos campos pulmonares, sin ruidos agregados.',
  corazon: 'Ruidos cardiacos rítmicos y normofonéticos, sin soplos ni roce pericárdico.',
  abdomen: 'Abdomen blando, depresible, no doloroso a la palpación. Ruidos hidroaéreos presentes. Sin masas ni visceromegalias. Sin signos de irritación peritoneal. Puño percusión negativa bilateral.',
  extremidades: 'Extremidades simétricas, sin edema. Pulsos distales presentes y simétricos. Llenado capilar menor de 2 segundos.',
  pielExamen: 'Piel y faneras sin lesiones, sin ictericia ni petequias.',
  neurologico: 'Glasgow 15/15. Pares craneales sin alteraciones. Fuerza 5/5 y sensibilidad conservada en las cuatro extremidades. Reflejos osteotendinosos conservados. Sin signos meníngeos.',
}

/** Revisión por sistemas sin hallazgos: solo si se preguntó cada cosa. */
export const SISTEMAS_NIEGA: Record<string, string> = {
  general: 'Niega fiebre, pérdida de peso, sudoración nocturna y astenia.',
  piel: 'Niega lesiones, prurito y cambios de coloración.',
  cabeza: 'Niega cefalea, alteraciones visuales, otalgia, rinorrea y odinofagia.',
  cardio: 'Niega dolor torácico, palpitaciones, edema y ortopnea.',
  respiratorio: 'Niega tos, expectoración, hemoptisis y disnea.',
  digestivo: 'Niega hiporexia, náusea, vómito, dolor abdominal, cambios en las deposiciones y sangrado digestivo.',
  genitourinario: 'Niega disuria, polaquiuria, hematuria y secreciones.',
  musculo: 'Niega artralgias, inflamación articular y debilidad.',
  neuro: 'Niega mareo, síncope, convulsiones y pérdida de fuerza o sensibilidad.',
  endocrino: 'Niega polidipsia, poliuria e intolerancia al frío o al calor.',
  hemato: 'Niega equimosis, sangrados y adenopatías.',
  mental: 'Niega alteraciones del ánimo, ansiedad, insomnio e ideas de autolesión.',
}

/** Síndrome que suele corresponder a cada síntoma (para la impresión diagnóstica). */
const SINDROME_POR_SINTOMA: Record<string, string> = {
  toracico: 'Síndrome doloroso torácico',
  disnea: 'Síndrome de dificultad respiratoria',
  fiebre: 'Síndrome febril',
  abdominal: 'Síndrome doloroso abdominal',
  cefalea: 'Síndrome cefalálgico',
  sincope: 'Síndrome sincopal',
  edema: 'Síndrome edematoso',
  ictericia: 'Síndrome ictérico',
  sangradoDigestivo: 'Síndrome de hemorragia digestiva',
  vomito: 'Síndrome emético',
  diarrea: 'Síndrome diarreico',
  urinario: 'Síndrome miccional',
  deficit: 'Síndrome de déficit neurológico focal',
  confusion: 'Síndrome confusional agudo',
  tos: 'Síndrome bronquial',
  hemoptisis: 'Síndrome de hemoptisis',
  palidez: 'Síndrome anémico',
  poliuria: 'Síndrome poliúrico',
  articular: 'Síndrome articular',
  lumbar: 'Síndrome doloroso lumbar',
  convulsion: 'Síndrome convulsivo',
  ganglios: 'Síndrome adenopático',
}

/** Relato cronológico armado con el motivo y el análisis ALICIA ya registrados. */
export function relatoSugerido(h: Historia): string | null {
  const f = h.filiacion ?? {}, m = h.motivo ?? {}, e = h.enfermedad ?? {}
  const sintoma = limpio(e.sintoma) || limpio(m.motivo)
  if (!sintoma) return null
  const quien = [f.sexo === 'Mujer' ? 'Paciente femenina' : f.sexo === 'Hombre' ? 'Paciente masculino' : 'Paciente', f.edad && `de ${edadTexto(f.edad)}`].filter(Boolean).join(' ')
  const partes = [
    `${quien} que acude por cuadro${m.tiempo ? ` de ${limpio(m.tiempo)} de evolución` : ''} caracterizado por ${minus(sintoma)}`,
    limpio(e.aparicion) && `de inicio ${minus(limpio(e.aparicion))}`,
    limpio(e.localizacion) && `de localización ${minus(limpio(e.localizacion))}`,
    limpio(e.caracter) && `de tipo ${minus(limpio(e.caracter))}`,
    limpio(e.intensidad) && `de intensidad ${limpio(e.intensidad)}/10`,
    limpio(e.irradiacion) && `irradiado a ${minus(limpio(e.irradiacion))}`,
  ].filter(Boolean)
  let texto = partes.join(', ') + '.'
  if (limpio(e.atenuantes)) texto += ` ${limpio(e.atenuantes).replace(/\.?$/, '.')}`
  if (limpio(e.evolucion)) texto += ` Evolución: ${minus(limpio(e.evolucion)).replace(/\.?$/, '.')}`
  if (limpio(e.acompanantes)) texto += ` Se acompaña de ${minus(limpio(e.acompanantes)).replace(/\.?$/, '.')}`
  const negativos = sintomasAbiertos(h).flatMap((id) => {
    const sx = SINTOMAS.find((s) => s.id === id)!
    return sx.alarmas.filter((_, i) => h.sintomas?.[`${id}.a${i}`] === '0').map(minus)
  })
  if (negativos.length) texto += ` Niega ${enLista(negativos)}.`
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** Sugerencias para un campo concreto (`seccion.campo`). */
export function sugerenciasPara(seccionId: string, campoId: string, h: Historia): Sugerencia[] {
  const out: Sugerencia[] = []
  if (seccionId === 'enfermedad' && campoId === 'relato') {
    const r = relatoSugerido(h)
    if (r) out.push({ etiqueta: 'Armar el relato con lo registrado', texto: r })
  }
  if (seccionId === 'examen' && EXAMEN_NORMAL[campoId]) out.push({ etiqueta: 'Examen normal', texto: EXAMEN_NORMAL[campoId] })
  if (seccionId === 'impresion' && campoId === 'sindromes') {
    for (const id of sintomasAbiertos(h)) {
      const sd = SINDROME_POR_SINTOMA[id]
      if (sd && !out.some((x) => x.texto === sd)) out.push({ etiqueta: sd, texto: sd })
    }
  }
  if (seccionId === 'impresion' && campoId === 'cronicos') {
    const a = h.antecedentes ?? {}
    const cronicos = PATOLOGICOS.filter((x) => a[`p.${x.id}`] === 'si').map((x) => x.nombre)
    if (cronicos.length) out.push({ etiqueta: 'Copiar de antecedentes', texto: cronicos.join('\n') })
  }
  if (seccionId === 'plan' && campoId === 'educacion') {
    const alarmas = sintomasAbiertos(h).flatMap((id) => SINTOMAS.find((s) => s.id === id)!.alarmas.map(minus))
    if (alarmas.length)
      out.push({ etiqueta: 'Signos de alarma de sus síntomas', texto: `Se explica al paciente que debe regresar de inmediato si presenta ${enLista([...new Set(alarmas)])}.` })
  }
  // Aparece después de tocar «Niega»: para escribir qué se preguntó y negó.
  if (seccionId === 'sistemas' && SISTEMAS_NIEGA[campoId] && /^niega\.?$/i.test(limpio(h.sistemas?.[campoId])))
    out.push({ etiqueta: 'Escribir qué niega', texto: SISTEMAS_NIEGA[campoId] })
  if (seccionId === 'plan' && campoId === 'examenes') {
    const elegidos = new Set((h.impresion?.diagnosticos ?? '').split('\n').map((l) => l.replace(/\s*\(.*\)\s*$/, '').trim().toLowerCase()).filter(Boolean))
    const con = diagnosticosEnVivo(h).filter((r) => r.estudios && elegidos.has(r.nombre.toLowerCase()))
    if (con.length)
      out.push({ etiqueta: 'Lo que mencionan las fuentes de tus diagnósticos', texto: con.map((r) => `${r.nombre}: ${r.estudios}`).join('\n') })
  }
  if (seccionId === 'plan' && campoId === 'examenes')
    out.push({ etiqueta: 'Formato', texto: 'Examen: … (motivo: …)' })
  if (seccionId === 'plan' && campoId === 'manejo')
    out.push({ etiqueta: 'Formato', texto: 'Medidas generales: …\nMedicamento, dosis, vía, frecuencia: …' })
  return out
}

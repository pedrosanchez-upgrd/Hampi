// Casos FICTICIOS para el modo práctica (estudiantes e internos). Pendientes de revisión médica.
// Solo usan hallazgos y diagnósticos que ya existen en el motor (conocimiento.ts): el resultado
// compara lo que el estudiante preguntó y eligió con lo que el caso tiene escondido.

import { DIAGNOSTICOS, HALLAZGOS } from './conocimiento'
import { diagnosticosEnVivo } from '../lib/motor'
import { historiaVacia, type Historia } from '../lib/historia'

export interface Respuesta { estado: 'si' | 'no'; dice: string }

export interface CasoPractica {
  id: string
  titulo: string
  nivel: 'Básico' | 'Intermedio'
  sexo: 'Mujer' | 'Hombre'
  edad: string
  /** Lo que dice el paciente al entrar, con sus palabras. */
  motivo: string
  tiempo: string
  presentacion: string
  /** Signos vitales al llegar (los copia el estudiante en Examen físico). */
  signos: Record<string, string>
  /** Lo que responde si se le pregunta o se le examina. */
  respuestas: Record<string, Respuesta>
  /** Las preguntas o maniobras que más importan en este caso. */
  clave: string[]
  diagnostico: string
  /** Lo que se aprende con el caso. */
  ensenanza: string
}

export const CASOS: CasoPractica[] = [
  {
    id: 'tep-posoperatorio', titulo: 'Falta de aire después de una cirugía', nivel: 'Intermedio', sexo: 'Mujer', edad: '46',
    motivo: 'me falta el aire y me duele el pecho', tiempo: '1 día',
    presentacion: 'Desde ayer siento que me falta el aire, y cuando respiro hondo me duele aquí al lado derecho del pecho.',
    signos: { pas: '118', pad: '76', fc: '112', fr: '24', temp: '37,4', sat: '88' },
    respuestas: {
      inmovilizacion: { estado: 'si', dice: 'Sí, me operaron de la rodilla hace dos semanas y he estado casi todo el tiempo en cama.' },
      signosTvp: { estado: 'si', dice: 'Ahora que me dice, la pierna derecha está hinchada y me duele la pantorrilla.' },
      hemoptisis: { estado: 'no', dice: 'No, no he tosido sangre.' },
      tvpPrevia: { estado: 'no', dice: 'No, nunca me han dicho que tuve coágulos.' },
      cancer: { estado: 'no', dice: 'No, nunca he tenido cáncer.' },
      dolorPleuritico: { estado: 'si', dice: 'Sí, me duele más cuando respiro hondo.' },
      inicioSubito: { estado: 'si', dice: 'Empezó de golpe, estaba sentada viendo televisión.' },
      irradiaBrazos: { estado: 'no', dice: 'No, no se me va al brazo.' },
      dolorEsfuerzo: { estado: 'no', dice: 'No empezó con ningún esfuerzo.' },
    },
    clave: ['inmovilizacion', 'signosTvp', 'hemoptisis', 'tvpPrevia', 'cancer'],
    diagnostico: 'tep',
    ensenanza: 'Ante disnea con taquicardia, pregunta siempre por cirugía o reposo reciente y examina las piernas: son parte de la regla de Wells.',
  },
  {
    id: 'apendicitis-joven', titulo: 'Dolor de barriga que se movió', nivel: 'Básico', sexo: 'Hombre', edad: '19',
    motivo: 'me duele la barriga', tiempo: '18 horas',
    presentacion: 'Ayer en la tarde empezó un dolor de barriga y ahora me duele mucho más. No he podido comer.',
    signos: { pas: '124', pad: '78', fc: '96', fr: '18', temp: '38,2', sat: '94' },
    respuestas: {
      migracionFid: { estado: 'si', dice: 'Empezó alrededor del ombligo y en la noche se pasó para abajo a la derecha.' },
      dolorFid: { estado: 'si', dice: 'Aquí abajo a la derecha es donde más me duele cuando me aprieta.' },
      vomitoAntesDolor: { estado: 'no', dice: 'Vomité una vez, pero ya tenía el dolor desde antes.' },
      psoas: { estado: 'si', dice: '(Al levantar la pierna derecha contra resistencia, el dolor aumenta.)' },
      defensa: { estado: 'no', dice: '(El abdomen se deja palpar; no hay contractura.)' },
      murphy: { estado: 'no', dice: '(Al palpar bajo las costillas derechas no se detiene la inspiración.)' },
      dolorHcd: { estado: 'no', dice: '(No duele bajo las costillas derechas.)' },
    },
    clave: ['migracionFid', 'dolorFid', 'vomitoAntesDolor', 'psoas', 'defensa'],
    diagnostico: 'apendicitis',
    ensenanza: 'La cronología del dolor (dónde empezó, hacia dónde fue y si el vómito vino antes o después) vale tanto como el examen.',
  },
  {
    id: 'cefalea-en-trueno', titulo: 'El peor dolor de cabeza de su vida', nivel: 'Intermedio', sexo: 'Mujer', edad: '52',
    motivo: 'el peor dolor de cabeza de mi vida', tiempo: '3 horas',
    presentacion: 'Estaba cargando una caja y de repente sentí un golpe en la cabeza. Nunca me había dolido así.',
    signos: { pas: '162', pad: '94', fc: '88', fr: '18', temp: '36,9', sat: '93' },
    respuestas: {
      enTrueno: { estado: 'si', dice: 'Fue de un rato a otro, en segundos ya era lo más fuerte.' },
      cefaleaEsfuerzo: { estado: 'si', dice: 'Sí, estaba levantando una caja pesada.' },
      cuelloDolor: { estado: 'si', dice: 'Me duele la nuca y el cuello está como duro.' },
      perdidaConciencia: { estado: 'no', dice: 'No me desmayé.' },
      flexionLimitada: { estado: 'si', dice: '(Al flexionar el cuello hacia el pecho hay resistencia y dolor.)' },
      pulsatil: { estado: 'no', dice: 'No late, es como un golpe constante.' },
      unilateral: { estado: 'no', dice: 'Me duele toda la cabeza.' },
      nauseaCefalea: { estado: 'si', dice: 'Sí, tengo náusea.' },
      incapacitante: { estado: 'si', dice: 'No puedo hacer nada con este dolor.' },
      dura4a72: { estado: 'no', dice: 'Nunca había tenido crisis así.' },
    },
    clave: ['enTrueno', 'cefaleaEsfuerzo', 'cuelloDolor', 'perdidaConciencia', 'flexionLimitada'],
    diagnostico: 'hsa',
    ensenanza: 'Una cefalea súbita que llega a su máximo en segundos es hemorragia subaracnoidea hasta demostrar lo contrario (regla de Ottawa).',
  },
]

export const casoPorId = (id?: string) => CASOS.find((c) => c.id === id)

/** Historia inicial de un caso: solo lo que el paciente dice al entrar. */
export function historiaDePractica(caso: CasoPractica): Historia {
  const h = historiaVacia()
  return {
    ...h,
    filiacion: { sexo: caso.sexo, edad: caso.edad, nombre: 'Paciente de práctica', fuente: 'Paciente' },
    motivo: { motivo: caso.motivo, tiempo: caso.tiempo },
    practica: { caso: caso.id, preguntados: '' },
  }
}

/** Preguntar o examinar en el modo práctica: revela la respuesta y la marca. */
export function preguntarEnPractica(h: Historia, hallazgo: string): Historia {
  const caso = casoPorId(h.practica?.caso)
  if (!caso) return h
  const r = caso.respuestas[hallazgo] ?? { estado: 'no' as const, dice: 'No.' }
  const prev = (h.practica?.preguntados ?? '').split(',').filter(Boolean)
  return {
    ...h,
    hallazgos: { ...h.hallazgos, [hallazgo]: r.estado },
    practica: { ...h.practica, preguntados: [...new Set([...prev, hallazgo])].join(',') },
  }
}

export const respuestaDe = (h: Historia, hallazgo: string): Respuesta | null => {
  const caso = casoPorId(h.practica?.caso)
  if (!caso || !(h.practica?.preguntados ?? '').split(',').includes(hallazgo)) return null
  return caso.respuestas[hallazgo] ?? { estado: 'no', dice: 'No.' }
}

export interface ResultadoPractica {
  caso: CasoPractica
  diagnosticoNombre: string
  acerto: boolean
  primero: boolean
  claveHechas: string[]
  claveFaltaron: { id: string; texto: string; dice: string }[]
  motorTop: string[]
}

export function resultadoPractica(h: Historia): ResultadoPractica | null {
  const caso = casoPorId(h.practica?.caso)
  if (!caso) return null
  const nombre = DIAGNOSTICOS.find((d) => d.id === caso.diagnostico)!.nombre
  const lineas = (h.impresion?.diagnosticos ?? '').split('\n').map((l) => l.replace(/\s*\(.*\)\s*$/, '').trim().toLowerCase()).filter(Boolean)
  const preguntados = new Set((h.practica?.preguntados ?? '').split(',').filter(Boolean))
  const marcados = new Set(Object.entries(h.hallazgos ?? {}).filter(([, v]) => v === 'si' || v === 'no').map(([k]) => k))
  const hecha = (id: string) => preguntados.has(id) || marcados.has(id)
  return {
    caso, diagnosticoNombre: nombre,
    acerto: lineas.includes(nombre.toLowerCase()),
    primero: lineas[0] === nombre.toLowerCase(),
    claveHechas: caso.clave.filter(hecha),
    claveFaltaron: caso.clave.filter((id) => !hecha(id)).map((id) => ({ id, texto: HALLAZGOS.find((x) => x.id === id)!.texto, dice: caso.respuestas[id]?.dice ?? '' })),
    motorTop: diagnosticosEnVivo({ ...h, examen: { ...h.examen, ...caso.signos }, hallazgos: { ...h.hallazgos, ...Object.fromEntries(Object.entries(caso.respuestas).map(([k, v]) => [k, v.estado])) } })
      .filter((x) => !x.descartado).slice(0, 3).map((x) => x.nombre),
  }
}

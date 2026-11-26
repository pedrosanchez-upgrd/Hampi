// Lee lo que el médico escribe (motivo, enfermedad actual, revisión por sistemas, examen físico,
// antecedentes) y propone marcar los hallazgos del motor que aparecen en el texto.
// Nunca los marca solo: el médico confirma con un toque. Pendiente de revisión médica.

import { HALLAZGOS } from './conocimiento'
import { normalizar, tramosNegados } from './sintomas'
import { sintomasAbiertos, type Historia } from '../lib/historia'

interface Patron {
  /** Todas deben aparecer en la misma oración (texto sin tildes y en minúsculas). */
  todas: RegExp[]
  /** Signo del examen: solo cuenta si dice «positivo» o «negativo» cerca. */
  signo?: boolean
  /** Expresiones que indican directamente que el hallazgo está ausente. */
  ausente?: RegExp[]
}

export const PATRONES: Record<string, Patron> = {
  irradiaBrazos: { todas: [/irradia|se extiende|se corre/, /brazo|hombro|miembros? superior/] },
  dolorEsfuerzo: { todas: [/dolor|opresion/, /esfuerzo|ejercicio|caminar|caminaba|sub\w* (las )?(gradas|escaleras|cuesta)/] },
  dolorPleuritico: { todas: [/punzante|pleuritic|(aumenta|empeora) al respirar|al inspirar|con la inspiracion|posicional|cambios de posicion|se reproduce (a la palpacion|al presionar)/] },
  inicioSubito: { todas: [/subit|repentin|de golpe|brusc/] },
  enTrueno: { todas: [/en trueno|maxim\w* (al instante|en segundos)|peor dolor de (su|mi) vida/] },
  deficitPulso: { todas: [/deficit de pulso|diferencia de presion entre (ambos )?brazos|pulso (ausente|disminuido)/] },
  deficitFocal: { todas: [/hemiparesia|hemiplejia|debilidad de (un|medio) lado|perdida de fuerza (en|de) (el |la |un |una )?(brazo|pierna|hemicuerpo|lado)|deficit (neurologico )?focal/] },
  soploDiastolico: { todas: [/soplo diastolico/] },
  rocePericardico: { todas: [/roce pericardico/] },
  signosTvp: { todas: [/pierna (hinchada|edematosa) y dolorosa|signos de (tvp|trombosis)|homans positivo/] },
  inmovilizacion: { todas: [/reposo (absoluto|en cama)|inmovilizad|enyesad|postquirurgic|postoperatori|cirugia (hace [0-9a-z ]*(dia|semana)|reciente)/] },
  hemoptisis: { todas: [/hemoptisis|tos con sangre|(esputo|expectoracion) con sangre/] },
  cancer: { todas: [/cancer activo|neoplasia|quimioterapia|radioterapia|metastasis|tratamiento oncologic/] },
  edemaUnilateral: { todas: [/edema unilateral|edema (de|en) (una|la) (sola )?pierna|pierna (derecha|izquierda) (hinchada|edematosa)|edema de miembro inferior (derecho|izquierdo)/] },
  dpn: { todas: [/disnea paroxistica nocturna|despierta\w* [^.]{0,20}(falta de aire|ahogo|ahogad)/] },
  disneaEsfuerzo: { todas: [/disnea|ahogo|falta de aire/, /esfuerzo|caminar|caminaba|sub\w* (las )?(gradas|escaleras|cuesta)|grandes|medianos|pequenos/] },
  s3: { todas: [/tercer ruido|galope|\bs3\b/] },
  crepitantes: { todas: [/crepitant|estertores|crepitos/] },
  rigidezNuca: { todas: [/rigidez de nuca|nuca rigida/] },
  alteracionMental: { todas: [/confus|desorientad|somnolient|estupor|alteracion (del estado )?(mental|de (la )?conciencia)|glasgow (1[0-4]|[3-9])\b/] },
  vomitoFiebre: { todas: [/vomit/] },
  dolorAbdFiebre: { todas: [/dolor abdominal|dolor (en el |de )?(abdomen|barriga|estomago)|abdomen doloroso/] },
  sangradoMucosas: { todas: [/gingivorragia|epistaxis|sangrado (de|por) (las )?(encias|nariz|mucosas)|petequias/] },
  acumuloLiquido: { todas: [/ascitis|derrame pleural/] },
  cuelloDolor: { todas: [/dolor (de|en el) cuello|cervicalgia|rigidez de cuello|cuello rigido/] },
  perdidaConciencia: { todas: [/perdida de (la )?conciencia|perdio el conocimiento|desmay/] },
  cefaleaEsfuerzo: { todas: [/cefalea|dolor de cabeza/, /esfuerzo|ejercicio|levantar|relaciones sexuales/] },
  flexionLimitada: { todas: [/flexion (del cuello )?limitada/] },
  disuria: { todas: [/disuria|ardor al orinar|dolor al orinar/] },
  polaquiuria: { todas: [/polaquiuria|orina\w* (con )?(mucha )?frecuen|orinar a cada rato/] },
  hematuria: { todas: [/hematuria|orina con sangre/] },
  dolorLumbar: { todas: [/lumbalgia|dolor lumbar|dolor (de|en la) espalda|dolor en (la )?region lumbar/] },
  punoPercusion: { todas: [/puno ?percusion|giordano/], signo: true },
  flujoVaginal: { todas: [/flujo vaginal|leucorrea|secrecion vaginal/] },
  irritacionVaginal: { todas: [/(prurito|irritacion|picazon) vaginal/] },
  migracionFid: { todas: [/(migr|se traslad|se desplaz|se corr)\w*[^.]{0,40}(fosa iliaca derecha|\bfid\b)/] },
  dolorFid: { todas: [/fosa iliaca derecha|\bfid\b|cuadrante inferior derecho/] },
  psoas: { todas: [/psoas/], signo: true },
  defensa: { todas: [/defensa abdominal|abdomen en tabla|resistencia muscular/] },
  vomitoAntesDolor: { todas: [/vomit\w*[^.]{0,30}antes (del|de que) (el )?dolor/] },
  murphy: { todas: [/murphy/], signo: true },
  dolorHcd: { todas: [/hipocondrio derecho/] },
  pulsatil: { todas: [/pulsatil|como (un )?latido/] },
  unilateral: { todas: [/hemicraneal|unilateral|de un solo lado|lado (derecho|izquierdo) de la cabeza/] },
  nauseaCefalea: { todas: [/nausea/] },
  incapacitante: { todas: [/incapacitante|no puede (realizar|hacer) sus actividades|lo obliga a (acostarse|suspender)/] },
  aura: { todas: [/\baura\b|destellos|escotoma/] },
  agravaValsalva: { todas: [/(empeora|aumenta|exacerba)\w*[^.]{0,30}(tos|pujar|valsalva|estornud)/] },
  vomitoCefalea: { todas: [/vomit/] },
  paresiaFacial: { todas: [/(paresia|paralisis) facial|desviacion de (la )?comisura|boca torcida/] },
  caidaBrazo: { todas: [/caida del brazo|pronador|no puede levantar el brazo/] },
  hablaAnormal: { todas: [/disartria|afasia|habla (arrastrada|alterada|traposa)|dificultad para hablar|no puede hablar/] },
  movilizacionCervical: { todas: [/dolor a la movilizacion (del )?(cervix|cervical)|movilizacion cervical dolorosa/] },
  masaAnexial: { todas: [/(masa|tumoracion) anexial/] },
  dolorAnexial: { todas: [/dolor anexial|anexo doloroso/] },
  melenaReferida: { todas: [/melena|(heces|deposiciones) (negras|como (brea|alquitran))/] },
  coagulosHeces: { todas: [/coagulos en (las )?heces|heces con coagulos/] },
  escalofriosIntensos: { todas: [/tiritona|escalofrios? (intensos?|con temblor)/] },
  axilaSeca: { todas: [/axilas? secas?/] },
  mucosasHumedas: { todas: [/mucosas (orales )?humedas/], ausente: [/mucosas (orales )?secas/] },
  cianosisEpisodio: { todas: [/cianosis|se puso morad|labios morados/] },
  frioAntes: { todas: [/(sintio|sensacion de) frio antes/] },
  ataquePrevio: { todas: [/(episodios?|ataques?|crisis|cuadros?) (similares?|previos?|parecidos?|anteriores?)|ya (le )?(habia|ha) (dado|pasado)|(no es|no era) la primera vez|gota (previa|conocida)|antecedente de gota/] },
  inicio1dia: { todas: [/(en|durante|de) (la noche|la madrugada|horas|pocas horas|unas horas)|desperto con (el )?dolor|amanecio con|(menos de|en) (un|1) dia/] },
  articulacionRoja: { todas: [/(rodilla|tobillo|dedo|articulacion|muneca|codo|pie)[^.]{0,40}(roj|eritemat|enrojecid)|(roj|eritem|enrojec)\w*[^.]{0,30}(rodilla|tobillo|dedo|articulacion|muneca|codo|pie)/] },
  mtp1: { todas: [/dedo gordo|primer dedo del pie|hallux|podagra|primera (articulacion )?metatarsofalang|\bmtf ?1\b|\bmtp ?1\b/] },
  uricoAlto: { todas: [/(acido urico|uricemia|hiperuricemia)[^.]{0,20}(alto|elevad|[6-9][,.]?[0-9]?|1[0-9])|hiperuricemia/] },
  protesisArticular: { todas: [/protesis (de )?(cadera|rodilla)|reemplazo (de )?(cadera|rodilla)|artroplastia|cirugia (de|en) (la )?(rodilla|cadera|hombro|tobillo)/] },
  infeccionPiel: { todas: [/celulitis|absceso|erisipela|herida infectada|infeccion (de|en) (la )?piel|piel (roja|infectada) (sobre|cerca)/] },
  artritisReumatoide: { todas: [/artritis reumatoide/] },
  exudadoAmigdalar: { todas: [/(placas|exudado|pus|puntos blancos)[^.]{0,30}amigdal|amigdal\w*[^.]{0,30}(placas|exudado|purulent|puntos blancos)/] },
  exudadoFaringeo: { todas: [/exudado faringeo|faringe[^.]{0,20}(exudado|placas)/] },
  amigdalasGrandes: { todas: [/amigdalas? (hipertrofic|aumentadas|grandes|grado [2-4i])/] },
  ganglioCervical: { todas: [/(adenopatias?|ganglios?) (cervical\w* )?(anterior\w* )?(dolorosos?|sensibles?)/] },
  aortaAncha: { todas: [/(masa pulsatil|pulsacion aortica (ensanchada|amplia|aumentada)|aorta (palpable )?ensanchada)/] },
}

/** Campos que se leen (no se leen la impresión ni el plan: ahí escribe el médico sus conclusiones). */
const CAMPOS: [string, string, string][] = [
  ['motivo', 'motivo', 'Motivo de consulta'],
  ...['relato', 'sintoma', 'aparicion', 'localizacion', 'caracter', 'irradiacion', 'atenuantes', 'evolucion', 'acompanantes'].map((c) => ['enfermedad', c, 'Enfermedad actual'] as [string, string, string]),
  ['personales', 'patologicos', 'Antecedentes personales'],
  ['personales', 'hospitalizaciones', 'Antecedentes personales'],
  ['personales', 'quirurgicos', 'Antecedentes personales'],
  ...['general', 'piel', 'cabeza', 'cardio', 'respiratorio', 'digestivo', 'genitourinario', 'musculo', 'neuro', 'endocrino', 'hemato', 'mental'].map((c) => ['sistemas', c, 'Revisión por sistemas'] as [string, string, string]),
  ...['aspecto', 'cabezaCuello', 'torax', 'corazon', 'abdomen', 'extremidades', 'pielExamen', 'neurologico'].map((c) => ['examen', c, 'Examen físico'] as [string, string, string]),
]

// Negación fuerte («niega», «sin»…): ver `tramosNegados`. Débil («no»): hasta la coma.
const NEG_DEBIL = /\bno\b/g

function negado(oracion: string, pos: number): boolean {
  if (tramosNegados(oracion).some(([a, b]) => pos >= a && pos < b)) return true
  for (const m of oracion.matchAll(NEG_DEBIL)) {
    if (m.index! >= pos) continue
    if (!/[,;:]/.test(oracion.slice(m.index!, pos))) return true
  }
  return false
}

export interface Detectado {
  hallazgo: string
  texto: string
  estado: 'si' | 'no'
  /** Fragmento donde se encontró, para que el médico vea de dónde sale. */
  fragmento: string
  donde: string
}

/** Evalúa un texto suelto (útil para pruebas). */
export function detectarEnTexto(texto: string, ids = Object.keys(PATRONES)): { hallazgo: string; estado: 'si' | 'no'; fragmento: string }[] {
  const out: { hallazgo: string; estado: 'si' | 'no'; fragmento: string }[] = []
  const original = texto.split(/[.\n]+/).map((x) => x.trim()).filter(Boolean)
  original.forEach((o) => {
    const oracion = normalizar(o)
    for (const id of ids) {
      const p = PATRONES[id]
      if (!p || out.some((x) => x.hallazgo === id)) continue
      const aus = p.ausente?.find((r) => r.test(oracion))
      if (aus) { out.push({ hallazgo: id, estado: 'no', fragmento: o }); continue }
      const ms = p.todas.map((r) => oracion.match(r))
      if (ms.some((m) => !m)) continue
      const pos = ms[ms.length - 1]!.index!
      let estado: 'si' | 'no' = negado(oracion, pos) ? 'no' : 'si'
      if (p.signo) {
        const ventana = oracion.slice(pos, pos + 40)
        if (/negativ/.test(ventana)) estado = 'no'
        else if (/positiv|\+/.test(ventana)) estado = estado === 'no' ? 'no' : 'si'
        else continue
      }
      out.push({ hallazgo: id, estado, fragmento: o })
    }
  })
  return out
}

/**
 * Hallazgos que aparecen en lo escrito y todavía no están marcados (ni a mano ni en automático),
 * solo de los síntomas abiertos, sin los que el médico dijo «No corresponde».
 */
export function hallazgosEnLoEscrito(h: Historia): Detectado[] {
  const abiertos = new Set(sintomasAbiertos(h))
  const ignorados = new Set((h.diagnosticosVivo?.ignorados ?? '').split(',').filter(Boolean))
  const ids = HALLAZGOS.filter((x) => !x.automatico && x.sintomas.some((s) => abiertos.has(s)))
    .map((x) => x.id).filter((id) => PATRONES[id] && !ignorados.has(id) && !['si', 'no'].includes(h.hallazgos?.[id] ?? ''))
  const out: Detectado[] = []
  for (const [sec, campo, donde] of CAMPOS) {
    const v = (h as Record<string, Record<string, string> | undefined>)[sec]?.[campo]
    if (!v?.trim()) continue
    for (const d of detectarEnTexto(v, ids.filter((id) => !out.some((x) => x.hallazgo === id))))
      out.push({ ...d, texto: HALLAZGOS.find((x) => x.id === d.hallazgo)!.texto, donde })
  }
  return out
}

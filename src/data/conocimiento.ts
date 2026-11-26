// Base de conocimiento para los diagnósticos en vivo (Fase 1).
//
// Cada regla dice cuánto cambia un hallazgo la probabilidad de un diagnóstico y de qué
// artículo sale. Todas las fuentes se verificaron en PubMed (PMID y DOI) el 22-nov-2026.
//
// - lrPos / lrNeg: razón de verosimilitud cuando el hallazgo está presente / ausente,
//   copiada del resumen del artículo.
// - cualitativo: el artículo dice que el hallazgo sube o baja la probabilidad pero el
//   resumen no da un número; se usa un peso fijo pequeño (×2 o ×0,5) y se muestra como
//   «cualitativo».
//
// ESTADO: PENDIENTE DE REVISIÓN MÉDICA. Ninguna regla se debe usar con pacientes reales
// hasta que un médico revisor la apruebe.

export interface Fuente {
  id: string
  cita: string
  titulo: string
  /** PubMed; las fuentes de SciELO o Elsevier aprobadas en la Fase 3 traen `url` en su lugar. */
  pmid?: string
  doi?: string
  url?: string
  /** Base de donde viene y calidad de la revista (Fase 3). */
  base?: 'pubmed' | 'scielo' | 'elsevier'
  calidad?: string
}

export const FUENTES: Record<string, Fuente> = {
  swap2005: { id: 'swap2005', pmid: '16304077', doi: '10.1001/jama.294.20.2623',
    cita: 'Swap CJ, Nagurney JT. JAMA. 2005;294(20):2623-9',
    titulo: 'Value and limitations of chest pain history in the evaluation of patients with suspected acute coronary syndromes' },
  klompas2002: { id: 'klompas2002', pmid: '11980527', doi: '10.1001/jama.287.17.2262',
    cita: 'Klompas M. JAMA. 2002;287(17):2262-72',
    titulo: 'Does this patient have an acute thoracic aortic dissection?' },
  wells2000: { id: 'wells2000', pmid: '10744147',
    cita: 'Wells PS, et al. Thromb Haemost. 2000;83(3):416-20',
    titulo: 'Derivation of a simple clinical model to categorize patients probability of pulmonary embolism' },
  adler2015: { id: 'adler2015', pmid: '26320112', doi: '10.1093/eurheartj/ehv318',
    cita: 'Adler Y, et al. Eur Heart J. 2015;36(42):2921-64',
    titulo: '2015 ESC Guidelines for the diagnosis and management of pericardial diseases' },
  wang2005: { id: 'wang2005', pmid: '16234501', doi: '10.1001/jama.294.15.1944',
    cita: 'Wang CS, et al. JAMA. 2005;294(15):1944-56',
    titulo: 'Does this dyspneic patient in the emergency department have congestive heart failure?' },
  metlay1997: { id: 'metlay1997', pmid: '9356004',
    cita: 'Metlay JP, Kapoor WN, Fine MJ. JAMA. 1997;278(17):1440-5',
    titulo: 'Does this patient have community-acquired pneumonia?' },
  attia1999: { id: 'attia1999', pmid: '10411200', doi: '10.1001/jama.282.2.175',
    cita: 'Attia J, et al. JAMA. 1999;282(2):175-81',
    titulo: 'The rational clinical examination. Does this adult patient have acute meningitis?' },
  sangkaew2021: { id: 'sangkaew2021', pmid: '33640077', doi: '10.1016/S1473-3099(20)30601-0',
    cita: 'Sangkaew S, et al. Lancet Infect Dis. 2021;21(7):1014-26',
    titulo: 'Risk predictors of progression to severe disease during the febrile phase of dengue' },
  bent2002: { id: 'bent2002', pmid: '12020306', doi: '10.1001/jama.287.20.2701',
    cita: 'Bent S, et al. JAMA. 2002;287(20):2701-10',
    titulo: 'Does this woman have an acute uncomplicated urinary tract infection?' },
  wagner1996: { id: 'wagner1996', pmid: '8918857',
    cita: 'Wagner JM, McKinney WP, Carpenter JL. JAMA. 1996;276(19):1589-94',
    titulo: 'Does this patient have appendicitis?' },
  trowbridge2003: { id: 'trowbridge2003', pmid: '12503981', doi: '10.1001/jama.289.1.80',
    cita: 'Trowbridge RL, et al. JAMA. 2003;289(1):80-6',
    titulo: 'Does this patient have acute cholecystitis?' },
  perry2013: { id: 'perry2013', pmid: '24065011', doi: '10.1001/jama.2013.278018',
    cita: 'Perry JJ, et al. JAMA. 2013;310(12):1248-55',
    titulo: 'Clinical decision rules to rule out subarachnoid hemorrhage for acute headache' },
  albassam2019: { id: 'albassam2019', pmid: '31237649', doi: '10.1001/jama.2019.8001',
    cita: 'Albassam OT, et al. JAMA. 2019;321(24):2448-57',
    titulo: 'Did This Patient Have Cardiac Syncope? The Rational Clinical Examination Systematic Review' },
  detsky2006: { id: 'detsky2006', pmid: '16968852', doi: '10.1001/jama.296.10.1274',
    cita: 'Detsky ME, et al. JAMA. 2006;296(10):1274-83',
    titulo: 'Does this patient with headache have a migraine or need neuroimaging?' },
  crochet2013: { id: 'crochet2013', pmid: '23613077', doi: '10.1001/jama.2013.3914',
    cita: 'Crochet JR, Bastian LA, Chireau MV. JAMA. 2013;309(16):1722-9',
    titulo: 'Does this woman have an ectopic pregnancy? The rational clinical examination systematic review' },
  goldstein2005: { id: 'goldstein2005', pmid: '15900010', doi: '10.1001/jama.293.19.2391',
    cita: 'Goldstein LB, Simel DL. JAMA. 2005;293(19):2391-402',
    titulo: 'Is this patient having a stroke?' },
  srygley2012: { id: 'srygley2012', pmid: '22416103', doi: '10.1001/jama.2012.253',
    cita: 'Srygley FD, et al. JAMA. 2012;307(10):1072-9',
    titulo: 'Does this patient have a severe upper gastrointestinal bleed?' },
  coburn2012: { id: 'coburn2012', pmid: '22851117', doi: '10.1001/jama.2012.8262',
    cita: 'Coburn B, et al. JAMA. 2012;308(5):502-11',
    titulo: 'Does this adult patient with suspected bacteremia require blood cultures?' },
  mcgee1999: { id: 'mcgee1999', pmid: '10086438', doi: '10.1001/jama.281.11.1022',
    cita: 'McGee S, Abernethy WB, Simel DL. JAMA. 1999;281(11):1022-9',
    titulo: 'The rational clinical examination. Is this patient hypovolemic?' },
  wells2003: { id: 'wells2003', pmid: '14507948', doi: '10.1056/NEJMoa023153',
    cita: 'Wells PS, et al. N Engl J Med. 2003;349(13):1227-35',
    titulo: 'Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis' },
  janssens2010: { id: 'janssens2010', pmid: '20625017', doi: '10.1001/archinternmed.2010.196',
    cita: 'Janssens HJ, et al. Arch Intern Med. 2010;170(13):1120-6',
    titulo: 'A diagnostic rule for acute gouty arthritis in primary care without joint fluid analysis' },
  margaretten2007: { id: 'margaretten2007', pmid: '17405973', doi: '10.1001/jama.297.13.1478',
    cita: 'Margaretten ME, et al. JAMA. 2007;297(13):1478-88',
    titulo: 'Does this adult patient have septic arthritis?' },
  ebell2000: { id: 'ebell2000', pmid: '11147989', doi: '10.1001/jama.284.22.2912',
    cita: 'Ebell MH, et al. JAMA. 2000;284(22):2912-8',
    titulo: 'The rational clinical examination. Does this patient have strep throat?' },
  lederle1999: { id: 'lederle1999', pmid: '9892455', doi: '10.1001/jama.281.1.77',
    cita: 'Lederle FA, Simel DL. JAMA. 1999;281(1):77-82',
    titulo: 'The rational clinical examination. Does this patient have abdominal aortic aneurysm?' },
}

export interface Hallazgo {
  id: string
  texto: string
  /** Pestañas de síntoma donde se pregunta este hallazgo. */
  sintomas: string[]
  /** Si se calcula solo a partir de otros datos (signos vitales, edad). */
  automatico?: string
}

export const HALLAZGOS: Hallazgo[] = [
  // Automáticos
  { id: 'taquicardia', texto: 'Frecuencia cardiaca mayor de 100', sintomas: ['toracico', 'disnea'], automatico: 'Se calcula de la frecuencia cardiaca' },
  { id: 'fiebreMedida', texto: 'Temperatura de 38 °C o más', sintomas: ['fiebre', 'tos', 'disnea', 'abdominal', 'cefalea'], automatico: 'Se calcula de la temperatura' },
  { id: 'taquipnea', texto: 'Frecuencia respiratoria mayor de 24', sintomas: ['tos', 'disnea', 'fiebre'], automatico: 'Se calcula de la frecuencia respiratoria' },
  { id: 'edad40', texto: 'Edad de 40 años o más', sintomas: ['cefalea'], automatico: 'Se calcula de la edad' },
  // Dolor torácico
  { id: 'irradiaBrazos', texto: 'Dolor que irradia a uno o ambos hombros o brazos', sintomas: ['toracico'] },
  { id: 'dolorEsfuerzo', texto: 'Dolor desencadenado por el esfuerzo', sintomas: ['toracico'] },
  { id: 'dolorPleuritico', texto: 'Dolor punzante, pleurítico, posicional o que se reproduce al presionar', sintomas: ['toracico'] },
  { id: 'inicioSubito', texto: 'Dolor de inicio súbito', sintomas: ['toracico'] },
  { id: 'deficitPulso', texto: 'Déficit de pulso o diferencia de presión entre brazos', sintomas: ['toracico'] },
  { id: 'deficitFocal', texto: 'Déficit neurológico focal', sintomas: ['toracico'] },
  { id: 'soploDiastolico', texto: 'Soplo diastólico', sintomas: ['toracico'] },
  { id: 'rocePericardico', texto: 'Roce pericárdico', sintomas: ['toracico'] },
  // Tromboembolismo
  { id: 'signosTvp', texto: 'Signos clínicos de TVP (pierna hinchada y dolorosa)', sintomas: ['toracico', 'disnea'] },
  { id: 'inmovilizacion', texto: 'Inmovilización o cirugía en las últimas 4 semanas', sintomas: ['toracico', 'disnea', 'edema'] },
  { id: 'tvpPrevia', texto: 'TVP o TEP previo', sintomas: ['toracico', 'disnea', 'edema'] },
  { id: 'hemoptisis', texto: 'Hemoptisis', sintomas: ['toracico', 'disnea', 'tos', 'hemoptisis'] },
  { id: 'cancer', texto: 'Cáncer activo', sintomas: ['toracico', 'disnea', 'edema'] },
  { id: 'edemaUnilateral', texto: 'Edema de una sola pierna', sintomas: ['edema'] },
  { id: 'dolorVenoso', texto: 'Dolor a lo largo del trayecto venoso profundo', sintomas: ['edema'] },
  // Disnea
  { id: 'iccPrevia', texto: 'Antecedente de insuficiencia cardiaca', sintomas: ['disnea', 'edema'] },
  { id: 'dpn', texto: 'Disnea paroxística nocturna', sintomas: ['disnea'] },
  { id: 'disneaEsfuerzo', texto: 'Disnea de esfuerzo', sintomas: ['disnea'] },
  { id: 's3', texto: 'Tercer ruido (galope S3)', sintomas: ['disnea'] },
  { id: 'crepitantes', texto: 'Crepitantes o alteración en la auscultación pulmonar', sintomas: ['disnea', 'tos', 'fiebre'] },
  // Fiebre y cefalea
  { id: 'rigidezNuca', texto: 'Rigidez de nuca', sintomas: ['fiebre', 'cefalea', 'confusion'] },
  { id: 'alteracionMental', texto: 'Alteración del estado mental', sintomas: ['fiebre', 'cefalea', 'confusion'] },
  { id: 'jolt', texto: 'El dolor de cabeza aumenta al girar la cabeza rápido (jolt)', sintomas: ['fiebre', 'cefalea'] },
  { id: 'viajeEndemico', texto: 'Viaje o residencia reciente en la Costa o la Amazonía', sintomas: ['fiebre'] },
  { id: 'vomitoFiebre', texto: 'Vómito', sintomas: ['fiebre'] },
  { id: 'dolorAbdFiebre', texto: 'Dolor abdominal o a la palpación', sintomas: ['fiebre'] },
  { id: 'sangradoMucosas', texto: 'Sangrado espontáneo o de mucosas', sintomas: ['fiebre'] },
  { id: 'acumuloLiquido', texto: 'Acumulación de líquido (ascitis, derrame pleural)', sintomas: ['fiebre'] },
  { id: 'cuelloDolor', texto: 'Dolor o rigidez de cuello', sintomas: ['cefalea'] },
  { id: 'perdidaConciencia', texto: 'Pérdida de conciencia presenciada', sintomas: ['cefalea'] },
  { id: 'cefaleaEsfuerzo', texto: 'Inicio durante un esfuerzo', sintomas: ['cefalea'] },
  { id: 'enTrueno', texto: 'Dolor que llega a su máximo al instante (en trueno)', sintomas: ['cefalea'] },
  { id: 'flexionLimitada', texto: 'Flexión del cuello limitada al examen', sintomas: ['cefalea'] },
  // Urinario
  { id: 'disuria', texto: 'Disuria (ardor al orinar)', sintomas: ['urinario'] },
  { id: 'polaquiuria', texto: 'Orina con frecuencia', sintomas: ['urinario'] },
  { id: 'hematuria', texto: 'Hematuria', sintomas: ['urinario', 'hematuria'] },
  { id: 'dolorLumbar', texto: 'Dolor de espalda o lumbar', sintomas: ['urinario'] },
  { id: 'punoPercusion', texto: 'Puño percusión positiva', sintomas: ['urinario', 'fiebre'] },
  { id: 'flujoVaginal', texto: 'Flujo vaginal', sintomas: ['urinario'] },
  { id: 'irritacionVaginal', texto: 'Irritación vaginal', sintomas: ['urinario'] },
  // Abdomen
  { id: 'migracionFid', texto: 'Dolor que migró a la fosa ilíaca derecha', sintomas: ['abdominal'] },
  { id: 'dolorFid', texto: 'Dolor en la fosa ilíaca derecha', sintomas: ['abdominal'] },
  { id: 'psoas', texto: 'Signo del psoas positivo', sintomas: ['abdominal'] },
  { id: 'defensa', texto: 'Defensa abdominal', sintomas: ['abdominal'] },
  { id: 'vomitoAntesDolor', texto: 'El vómito empezó antes que el dolor', sintomas: ['abdominal'] },
  { id: 'murphy', texto: 'Signo de Murphy positivo', sintomas: ['abdominal'] },
  { id: 'dolorHcd', texto: 'Dolor a la palpación en el hipocondrio derecho', sintomas: ['abdominal'] },
  // Cefalea: migraña (POUND) y signos de lesión intracraneal
  { id: 'pulsatil', texto: 'Dolor pulsátil', sintomas: ['cefalea'] },
  { id: 'dura4a72', texto: 'Cada crisis dura de 4 a 72 horas', sintomas: ['cefalea'] },
  { id: 'unilateral', texto: 'Dolor de un solo lado', sintomas: ['cefalea'] },
  { id: 'nauseaCefalea', texto: 'Náusea con el dolor de cabeza', sintomas: ['cefalea'] },
  { id: 'incapacitante', texto: 'Dolor incapacitante (no puede hacer sus actividades)', sintomas: ['cefalea'] },
  { id: 'tipoRacimos', texto: 'Cefalea tipo racimos (en salvas, periocular, con lagrimeo)', sintomas: ['cefalea'] },
  { id: 'neuroAnormal', texto: 'Examen neurológico anormal', sintomas: ['cefalea'] },
  { id: 'cefaleaIndefinida', texto: 'Cefalea que no encaja en migraña, tensional ni racimos', sintomas: ['cefalea'] },
  { id: 'aura', texto: 'Aura antes del dolor', sintomas: ['cefalea'] },
  { id: 'agravaValsalva', texto: 'Empeora con el esfuerzo, la tos o al pujar', sintomas: ['cefalea'] },
  { id: 'vomitoCefalea', texto: 'Vómito con el dolor de cabeza', sintomas: ['cefalea'] },
  // Déficit neurológico: ACV
  { id: 'paresiaFacial', texto: 'Paresia facial aguda', sintomas: ['deficit', 'mareo', 'confusion'] },
  { id: 'caidaBrazo', texto: 'Caída del brazo (pronador)', sintomas: ['deficit', 'mareo', 'confusion'] },
  { id: 'hablaAnormal', texto: 'Alteración del habla', sintomas: ['deficit', 'mareo', 'confusion'] },
  // Embarazo ectópico (mujer con posible embarazo)
  { id: 'embarazoPosible', texto: 'Posibilidad de embarazo', sintomas: ['abdominal'], automatico: 'Se toma de antecedentes gineco-obstétricos' },
  { id: 'movilizacionCervical', texto: 'Dolor a la movilización cervical', sintomas: ['abdominal'] },
  { id: 'masaAnexial', texto: 'Masa anexial al examen', sintomas: ['abdominal'] },
  { id: 'dolorAnexial', texto: 'Dolor anexial a la palpación', sintomas: ['abdominal'] },
  // Sangrado digestivo
  { id: 'melenaReferida', texto: 'Refiere heces negras (melena)', sintomas: ['sangradoDigestivo'] },
  { id: 'coagulosHeces', texto: 'Coágulos de sangre en las heces', sintomas: ['sangradoDigestivo'] },
  { id: 'bunCr30', texto: 'Relación BUN/creatinina mayor de 30', sintomas: ['sangradoDigestivo'] },
  { id: 'taquicardiaSangrado', texto: 'Frecuencia cardiaca mayor de 100', sintomas: ['sangradoDigestivo'], automatico: 'Se calcula de la frecuencia cardiaca' },
  { id: 'hb8', texto: 'Hemoglobina menor de 8 g/dL', sintomas: ['sangradoDigestivo'] },
  // Bacteriemia
  { id: 'escalofriosIntensos', texto: 'Escalofríos intensos con temblor (tiritona)', sintomas: ['fiebre'] },
  { id: 'sirs', texto: 'Cumple 2 o más criterios de SIRS (T > 38 o < 36 °C, FC > 90, FR > 20, leucocitos alterados)', sintomas: ['fiebre'] },
  // Hipovolemia
  { id: 'pulsoPostural', texto: 'Al ponerse de pie, el pulso sube 30 lpm o más, o mareo intenso que impide pararse', sintomas: ['vomito', 'diarrea', 'sangradoDigestivo'] },
  { id: 'axilaSeca', texto: 'Axila seca', sintomas: ['vomito', 'diarrea'] },
  { id: 'mucosasHumedas', texto: 'Mucosas húmedas y lengua sin surcos', sintomas: ['vomito', 'diarrea'] },
  // Síncope
  { id: 'sincope35', texto: 'Primer síncope a los 35 años o más', sintomas: ['sincope'] },
  { id: 'fibrilacion', texto: 'Antecedente de fibrilación o flutter auricular', sintomas: ['sincope', 'palpitaciones'] },
  { id: 'cardiopatia', texto: 'Cardiopatía estructural grave conocida', sintomas: ['sincope', 'palpitaciones'] },
  { id: 'cianosisEpisodio', texto: 'Cianosis vista durante el episodio', sintomas: ['sincope'] },
  { id: 'frioAntes', texto: 'Sensación de frío antes del episodio', sintomas: ['sincope'] },
  { id: 'cefaleaAntes', texto: 'Dolor de cabeza antes del episodio', sintomas: ['sincope'] },
  // Monoartritis: gota y artritis séptica
  { id: 'sexoMasculino', texto: 'Sexo masculino', sintomas: ['articular'], automatico: 'Se toma del sexo en la filiación' },
  { id: 'ataquePrevio', texto: 'Ataques de artritis antes (referidos por el paciente)', sintomas: ['articular'] },
  { id: 'inicio1dia', texto: 'El dolor llegó a su máximo en menos de 1 día', sintomas: ['articular'] },
  { id: 'articulacionRoja', texto: 'Articulación roja', sintomas: ['articular'] },
  { id: 'mtp1', texto: 'Afecta la base del dedo gordo del pie (primera metatarsofalángica)', sintomas: ['articular', 'extremidad'] },
  { id: 'htaOCardio', texto: 'Hipertensión o una enfermedad cardiovascular', sintomas: ['articular'], automatico: 'Se toma de antecedentes patológicos' },
  { id: 'uricoAlto', texto: 'Ácido úrico en sangre mayor de 5,88 mg/dL', sintomas: ['articular'] },
  { id: 'protesisArticular', texto: 'Prótesis de cadera o rodilla, o cirugía de esa articulación', sintomas: ['articular'] },
  { id: 'infeccionPiel', texto: 'Infección de piel (sobre todo cerca de la articulación)', sintomas: ['articular'] },
  { id: 'diabetes', texto: 'Diabetes', sintomas: ['articular'], automatico: 'Se toma de antecedentes patológicos' },
  { id: 'artritisReumatoide', texto: 'Artritis reumatoide', sintomas: ['articular'] },
  { id: 'vih', texto: 'Infección por VIH', sintomas: ['articular'], automatico: 'Se toma de antecedentes patológicos' },
  { id: 'wbc25', texto: 'Leucocitos en líquido sinovial de 25 000/µL o más', sintomas: ['articular'] },
  { id: 'wbc50', texto: 'Leucocitos en líquido sinovial de más de 50 000/µL', sintomas: ['articular'] },
  { id: 'wbc100', texto: 'Leucocitos en líquido sinovial de más de 100 000/µL', sintomas: ['articular'] },
  // Faringitis estreptocócica
  { id: 'exudadoAmigdalar', texto: 'Exudado (placas) en las amígdalas', sintomas: ['garganta'] },
  { id: 'exudadoFaringeo', texto: 'Exudado en la faringe', sintomas: ['garganta'] },
  { id: 'contactoStrep', texto: 'Contacto con faringitis estreptocócica en las últimas 2 semanas', sintomas: ['garganta'] },
  { id: 'ganglioCervical', texto: 'Ganglios cervicales anteriores dolorosos', sintomas: ['garganta'] },
  { id: 'amigdalasGrandes', texto: 'Amígdalas aumentadas de tamaño', sintomas: ['garganta'] },
  // Aneurisma de aorta abdominal
  { id: 'aortaAncha', texto: 'A la palpación, pulsación aórtica ensanchada', sintomas: ['abdominal', 'lumbar'] },
  { id: 'pmn90', texto: 'Polimorfonucleares del 90 % o más en líquido sinovial', sintomas: ['articular'] },
]

/**
 * Hallazgos escalonados: «sí» en uno implica «sí» en los menores; «no» implica «no» en los
 * mayores (p. ej. más de 100 000 leucocitos implica más de 50 000). Solo llena lo no marcado.
 */
export const IMPLICA: { si: Record<string, string[]>; no: Record<string, string[]> } = {
  si: { wbc100: ['wbc50', 'wbc25'], wbc50: ['wbc25'] },
  no: { wbc25: ['wbc50', 'wbc100'], wbc50: ['wbc100'] },
}

export interface Regla {
  hallazgo: string
  fuente: string
  lrPos?: number
  lrNeg?: number
  cualitativo?: 'sube' | 'baja'
  /** Cuando el hallazgo ausente también cuenta en forma cualitativa (opuesto). */
  ausenteCuenta?: boolean
  /** Solo cuenta cuando está ausente (el artículo lo valida para descartar, no para confirmar). */
  soloAusente?: boolean
  nota?: string
}

/**
 * Regla por conteo: el artículo da una razón de verosimilitud según cuántos hallazgos de un
 * grupo están presentes (por ejemplo, POUND para migraña). Se aplica solo cuando los hallazgos
 * sin responder ya no pueden cambiar el tramo.
 */
export interface ReglaConteo {
  hallazgos: string[]
  tramos: { min: number; lr: number }[]
  texto: string
  fuente: string
  nota?: string
}

export interface Diagnostico {
  id: string
  nombre: string
  /** «No te lo pierdas»: grave, siempre visible hasta que el médico lo descarte. */
  grave: boolean
  sintomas: string[]
  soloSexo?: 'Mujer' | 'Hombre'
  /** Solo se muestra desde esta edad (filtro de presentación, no de puntaje; pendiente de revisión médica). */
  edadMin?: number
  /** Solo se muestra si este hallazgo está marcado como presente. */
  requiere?: string
  /** Estudios que menciona el resumen del artículo citado (no es una orden médica). */
  estudios?: string
  nota?: string
  reglas: Regla[]
  conteo?: ReglaConteo
}

export const DIAGNOSTICOS: Diagnostico[] = [
  { id: 'sca', nombre: 'Síndrome coronario agudo', grave: true, sintomas: ['toracico'], reglas: [
    { hallazgo: 'irradiaBrazos', lrPos: 2.3, fuente: 'swap2005', nota: 'LR 2,3–4,7 según la revisión; se usa el valor menor' },
    { hallazgo: 'dolorEsfuerzo', lrPos: 2.3, fuente: 'swap2005', nota: 'LR 2,3–4,7 según la revisión; se usa el valor menor' },
    { hallazgo: 'dolorPleuritico', lrPos: 0.3, fuente: 'swap2005', nota: 'LR 0,2–0,3 según la revisión; se usa el valor más prudente' },
  ] },
  { id: 'diseccion', nombre: 'Disección aórtica aguda', grave: true, sintomas: ['toracico'], reglas: [
    { hallazgo: 'inicioSubito', lrNeg: 0.3, fuente: 'klompas2002' },
    { hallazgo: 'deficitPulso', lrPos: 5.7, fuente: 'klompas2002' },
    { hallazgo: 'deficitFocal', lrPos: 6.6, fuente: 'klompas2002', nota: 'LR 6,6–33; se usa el valor menor' },
    { hallazgo: 'soploDiastolico', lrPos: 1.4, fuente: 'klompas2002' },
  ] },
  { id: 'tep', nombre: 'Tromboembolismo pulmonar', estudios: 'Puntaje de Wells completo y dímero D (en probabilidad baja, un dímero D negativo ayuda a descartar).', grave: true, sintomas: ['toracico', 'disnea'],
    nota: 'Reglas cualitativas basadas en las variables del modelo de Wells; calcule el puntaje completo de Wells.', reglas: [
    { hallazgo: 'signosTvp', cualitativo: 'sube', fuente: 'wells2000' },
    { hallazgo: 'taquicardia', cualitativo: 'sube', fuente: 'wells2000' },
    { hallazgo: 'inmovilizacion', cualitativo: 'sube', fuente: 'wells2000' },
    { hallazgo: 'tvpPrevia', cualitativo: 'sube', fuente: 'wells2000' },
    { hallazgo: 'hemoptisis', cualitativo: 'sube', fuente: 'wells2000' },
    { hallazgo: 'cancer', cualitativo: 'sube', fuente: 'wells2000' },
  ] },
  { id: 'pericarditis', nombre: 'Pericarditis aguda', grave: false, sintomas: ['toracico'], reglas: [
    { hallazgo: 'dolorPleuritico', cualitativo: 'sube', fuente: 'adler2015', nota: 'Criterio diagnóstico de la guía ESC' },
    { hallazgo: 'rocePericardico', cualitativo: 'sube', fuente: 'adler2015', nota: 'Criterio diagnóstico de la guía ESC' },
  ] },
  { id: 'icc', nombre: 'Insuficiencia cardiaca', estudios: 'Péptido natriurético tipo B: un BNP menor de 100 pg/mL ayuda a descartar.', grave: false, sintomas: ['disnea', 'edema'], reglas: [
    { hallazgo: 'iccPrevia', lrPos: 5.8, lrNeg: 0.45, fuente: 'wang2005' },
    { hallazgo: 'dpn', lrPos: 2.6, fuente: 'wang2005' },
    { hallazgo: 's3', lrPos: 11, fuente: 'wang2005' },
    { hallazgo: 'disneaEsfuerzo', lrNeg: 0.48, fuente: 'wang2005' },
    { hallazgo: 'crepitantes', lrNeg: 0.51, fuente: 'wang2005' },
  ] },
  { id: 'neumonia', nombre: 'Neumonía adquirida en la comunidad', grave: false, sintomas: ['tos', 'fiebre', 'disnea'],
    nota: 'Ningún hallazgo aislado confirma neumonía; signos vitales y auscultación normales la hacen poco probable.', reglas: [
    { hallazgo: 'fiebreMedida', cualitativo: 'sube', ausenteCuenta: true, soloAusente: true, fuente: 'metlay1997' },
    { hallazgo: 'taquipnea', cualitativo: 'sube', ausenteCuenta: true, soloAusente: true, fuente: 'metlay1997' },
    { hallazgo: 'crepitantes', cualitativo: 'sube', ausenteCuenta: true, soloAusente: true, fuente: 'metlay1997' },
  ] },
  { id: 'meningitis', nombre: 'Meningitis aguda', grave: true, sintomas: ['fiebre', 'cefalea', 'confusion'],
    nota: 'La ausencia de fiebre, rigidez de nuca y alteración mental prácticamente la descarta (sensibilidad 99–100 % de tener al menos uno).', reglas: [
    { hallazgo: 'fiebreMedida', cualitativo: 'sube', ausenteCuenta: true, soloAusente: true, fuente: 'attia1999' },
    { hallazgo: 'rigidezNuca', cualitativo: 'sube', ausenteCuenta: true, soloAusente: true, fuente: 'attia1999' },
    { hallazgo: 'alteracionMental', cualitativo: 'sube', ausenteCuenta: true, soloAusente: true, fuente: 'attia1999' },
    { hallazgo: 'jolt', lrPos: 2.2, lrNeg: 0, fuente: 'attia1999', nota: 'En pacientes con fiebre y cefalea' },
  ] },
  { id: 'dengueAlarma', nombre: 'Dengue con signos de alarma', grave: true, sintomas: ['fiebre'], requiere: 'viajeEndemico',
    nota: 'Se muestra solo con exposición en zona endémica. Los pesos vienen de odds ratios de progresión a dengue grave, no de razones de verosimilitud.', reglas: [
    { hallazgo: 'vomitoFiebre', cualitativo: 'sube', fuente: 'sangkaew2021', nota: 'OR 2,25' },
    { hallazgo: 'dolorAbdFiebre', cualitativo: 'sube', fuente: 'sangkaew2021', nota: 'OR 1,92' },
    { hallazgo: 'sangradoMucosas', cualitativo: 'sube', fuente: 'sangkaew2021', nota: 'OR 1,57' },
    { hallazgo: 'acumuloLiquido', cualitativo: 'sube', fuente: 'sangkaew2021', nota: 'OR 4,61' },
  ] },
  { id: 'itu', nombre: 'Infección urinaria baja no complicada', grave: false, sintomas: ['urinario'], soloSexo: 'Mujer', reglas: [
    { hallazgo: 'disuria', lrPos: 1.5, lrNeg: 0.5, fuente: 'bent2002' },
    { hallazgo: 'polaquiuria', lrPos: 1.8, fuente: 'bent2002' },
    { hallazgo: 'hematuria', lrPos: 2.0, fuente: 'bent2002' },
    { hallazgo: 'dolorLumbar', lrPos: 1.6, lrNeg: 0.8, fuente: 'bent2002' },
    { hallazgo: 'punoPercusion', lrPos: 1.7, fuente: 'bent2002' },
    { hallazgo: 'flujoVaginal', lrPos: 0.3, fuente: 'bent2002' },
    { hallazgo: 'irritacionVaginal', lrPos: 0.2, fuente: 'bent2002' },
  ] },
  { id: 'apendicitis', nombre: 'Apendicitis aguda', grave: true, sintomas: ['abdominal'], reglas: [
    { hallazgo: 'migracionFid', cualitativo: 'sube', ausenteCuenta: true, fuente: 'wagner1996' },
    { hallazgo: 'psoas', cualitativo: 'sube', fuente: 'wagner1996' },
    { hallazgo: 'fiebreMedida', cualitativo: 'sube', ausenteCuenta: true, fuente: 'wagner1996' },
    { hallazgo: 'vomitoAntesDolor', cualitativo: 'baja', fuente: 'wagner1996' },
    { hallazgo: 'dolorFid', cualitativo: 'sube', ausenteCuenta: true, fuente: 'wagner1996', nota: 'Su ausencia la hace menos probable' },
    { hallazgo: 'defensa', cualitativo: 'sube', ausenteCuenta: true, fuente: 'wagner1996', nota: 'Su ausencia la hace menos probable' },
  ] },
  { id: 'colecistitis', nombre: 'Colecistitis aguda', estudios: 'Ecografía de hipocondrio derecho.', grave: false, sintomas: ['abdominal'],
    nota: 'Ningún hallazgo aislado la confirma ni la descarta; requiere ecografía.', reglas: [
    { hallazgo: 'murphy', lrPos: 2.8, fuente: 'trowbridge2003', nota: 'IC 95 % incluye 1' },
    { hallazgo: 'dolorHcd', lrNeg: 0.4, fuente: 'trowbridge2003', nota: 'IC 95 % incluye 1' },
  ] },
  { id: 'hsa', nombre: 'Hemorragia subaracnoidea', grave: true, sintomas: ['cefalea'],
    nota: 'Regla de Ottawa: solo para cefalea no traumática que alcanzó su máximo en 1 h, sin déficit neurológico. Con todos los criterios ausentes tuvo 100 % de sensibilidad. Es una regla para descartar: un criterio presente indica estudiar, no confirma.', reglas: [
    { hallazgo: 'edad40', cualitativo: 'sube', ausenteCuenta: true, soloAusente: true, fuente: 'perry2013' },
    { hallazgo: 'cuelloDolor', cualitativo: 'sube', ausenteCuenta: true, soloAusente: true, fuente: 'perry2013' },
    { hallazgo: 'perdidaConciencia', cualitativo: 'sube', ausenteCuenta: true, soloAusente: true, fuente: 'perry2013' },
    { hallazgo: 'cefaleaEsfuerzo', cualitativo: 'sube', ausenteCuenta: true, soloAusente: true, fuente: 'perry2013' },
    { hallazgo: 'enTrueno', cualitativo: 'sube', ausenteCuenta: true, soloAusente: true, fuente: 'perry2013' },
    { hallazgo: 'flexionLimitada', cualitativo: 'sube', ausenteCuenta: true, soloAusente: true, fuente: 'perry2013' },
  ] },
  { id: 'migrana', nombre: 'Migraña', grave: false, sintomas: ['cefalea'], reglas: [],
    conteo: { hallazgos: ['pulsatil', 'dura4a72', 'unilateral', 'nauseaCefalea', 'incapacitante'], texto: 'Criterios POUND',
      tramos: [{ min: 4, lr: 24 }, { min: 3, lr: 3.5 }, { min: 0, lr: 0.41 }], fuente: 'detsky2006',
      nota: '4 o 5 criterios: LR 24 (IC 95 % 1,5–388); 3: LR 3,5; 2 o menos: LR 0,41' } },
  { id: 'lesionIntracraneal', nombre: 'Lesión intracraneal significativa (indica neuroimagen)', estudios: 'Neuroimagen ante cualquiera de estos hallazgos.', grave: true, sintomas: ['cefalea'],
    nota: 'Ningún hallazgo clínico permitió descartar una lesión intracraneal.', reglas: [
    { hallazgo: 'tipoRacimos', lrPos: 10.7, fuente: 'detsky2006' },
    { hallazgo: 'neuroAnormal', lrPos: 5.3, fuente: 'detsky2006' },
    { hallazgo: 'cefaleaIndefinida', lrPos: 3.8, fuente: 'detsky2006' },
    { hallazgo: 'aura', lrPos: 3.2, fuente: 'detsky2006' },
    { hallazgo: 'agravaValsalva', lrPos: 2.3, fuente: 'detsky2006' },
    { hallazgo: 'vomitoCefalea', lrPos: 1.8, fuente: 'detsky2006' },
  ] },
  { id: 'acv', nombre: 'Accidente cerebrovascular', grave: true, sintomas: ['deficit', 'mareo', 'confusion'],
    nota: 'Paresia facial, caída del brazo o habla alterada. La neuroimagen distingue isquémico de hemorrágico; registra la hora de inicio.', reglas: [],
    conteo: { hallazgos: ['paresiaFacial', 'caidaBrazo', 'hablaAnormal'], texto: 'Paresia facial, caída del brazo o habla alterada',
      tramos: [{ min: 1, lr: 5.5 }, { min: 0, lr: 0.39 }], fuente: 'goldstein2005', nota: '1 o más hallazgos: LR 5,5; ninguno: LR 0,39' } },
  { id: 'ectopico', nombre: 'Embarazo ectópico', estudios: 'Ecografía transvaginal y hCG cuantitativa.', grave: true, sintomas: ['abdominal'], soloSexo: 'Mujer', requiere: 'embarazoPosible',
    nota: 'Ningún dato de la historia tuvo LR mayor de 1,5. Ante dolor abdominal o sangrado en embarazo temprano: ecografía transvaginal y hCG cuantitativa.', reglas: [
    { hallazgo: 'movilizacionCervical', lrPos: 4.9, fuente: 'crochet2013' },
    { hallazgo: 'masaAnexial', lrPos: 2.4, fuente: 'crochet2013' },
    { hallazgo: 'dolorAnexial', lrPos: 1.9, fuente: 'crochet2013' },
  ] },
  { id: 'sangradoAlto', nombre: 'Sangrado digestivo de origen alto', grave: false, sintomas: ['sangradoDigestivo'], reglas: [
    { hallazgo: 'melenaReferida', lrPos: 5.1, fuente: 'srygley2012', nota: 'LR 5,1–5,9; se usa el valor menor' },
    { hallazgo: 'bunCr30', lrPos: 7.5, fuente: 'srygley2012' },
    { hallazgo: 'coagulosHeces', lrPos: 0.05, fuente: 'srygley2012' },
  ] },
  { id: 'sangradoAltoGrave', nombre: 'Sangrado digestivo alto que requiere intervención urgente', estudios: 'Puntaje de Blatchford (0 = baja probabilidad de necesitar intervención urgente).', grave: true, sintomas: ['sangradoDigestivo'],
    nota: 'Un puntaje de Blatchford de 0 tuvo LR 0,02 para necesitar intervención urgente.', reglas: [
    { hallazgo: 'taquicardiaSangrado', lrPos: 4.9, fuente: 'srygley2012' },
    { hallazgo: 'hb8', lrPos: 4.5, fuente: 'srygley2012', nota: 'LR 4,5–6,2; se usa el valor menor' },
  ] },
  { id: 'bacteriemia', nombre: 'Bacteriemia (indica hemocultivos)', estudios: 'Hemocultivos solo si la probabilidad previa lo justifica; la fiebre o la leucocitosis aisladas no bastan.', grave: true, sintomas: ['fiebre'],
    nota: 'No aplica a pacientes inmunocomprometidos ni con sospecha de endocarditis. La fiebre o la leucocitosis aisladas no bastan para pedir hemocultivos.', reglas: [
    { hallazgo: 'fiebreMedida', lrPos: 1.9, fuente: 'coburn2012', nota: 'Temperatura de 38 °C o más' },
    { hallazgo: 'escalofriosIntensos', lrPos: 4.7, fuente: 'coburn2012' },
    { hallazgo: 'sirs', lrNeg: 0.09, fuente: 'coburn2012' },
  ] },
  { id: 'hipovolemia', nombre: 'Hipovolemia', estudios: 'Electrolitos, urea (BUN) y creatinina cuando se necesite certeza.', grave: true, sintomas: ['vomito', 'diarrea', 'sangradoDigestivo'],
    nota: 'La hipotensión y la taquicardia en decúbito suelen faltar aun con pérdidas de hasta 1150 ml. El llenado capilar y la turgencia de la piel no tienen valor probado en adultos.', reglas: [
    { hallazgo: 'pulsoPostural', cualitativo: 'sube', fuente: 'mcgee1999', nota: 'Sensibilidad 97 % y especificidad 98 % para pérdida grande de sangre' },
    { hallazgo: 'axilaSeca', lrPos: 2.8, fuente: 'mcgee1999', nota: 'En vómito, diarrea o poca ingesta' },
    { hallazgo: 'mucosasHumedas', lrPos: 0.3, fuente: 'mcgee1999' },
  ] },
  { id: 'sincopeCardiaco', nombre: 'Síncope de causa cardiaca', grave: true, sintomas: ['sincope'], reglas: [
    { hallazgo: 'sincope35', lrPos: 3.3, lrNeg: 0.13, fuente: 'albassam2019' },
    { hallazgo: 'fibrilacion', lrPos: 7.3, fuente: 'albassam2019' },
    { hallazgo: 'cardiopatia', lrPos: 3.3, fuente: 'albassam2019', nota: 'LR 3,3–4,8; se usa el valor menor' },
    { hallazgo: 'cianosisEpisodio', lrPos: 6.2, fuente: 'albassam2019' },
    { hallazgo: 'frioAntes', lrPos: 0.16, fuente: 'albassam2019' },
    { hallazgo: 'cefaleaAntes', lrPos: 0.17, fuente: 'albassam2019' },
  ] },
  { id: 'tvp', nombre: 'Trombosis venosa profunda', estudios: 'Dímero D si la probabilidad clínica es baja; ecografía si es alta o el dímero D es positivo.', grave: true, sintomas: ['edema'],
    nota: 'Reglas cualitativas basadas en el modelo clínico de Wells; con probabilidad baja y dímero D negativo se puede descartar. El resumen del artículo no enumera las variables: revisar contra el texto completo.', reglas: [
    { hallazgo: 'edemaUnilateral', cualitativo: 'sube', fuente: 'wells2003' },
    { hallazgo: 'dolorVenoso', cualitativo: 'sube', fuente: 'wells2003' },
    { hallazgo: 'inmovilizacion', cualitativo: 'sube', fuente: 'wells2003' },
    { hallazgo: 'tvpPrevia', cualitativo: 'sube', fuente: 'wells2003' },
    { hallazgo: 'cancer', cualitativo: 'sube', fuente: 'wells2003' },
  ] },
  { id: 'gota', nombre: 'Gota (artritis gotosa aguda)', grave: false, sintomas: ['articular', 'extremidad'],
    estudios: 'Ácido úrico en sangre; la confirmación es ver cristales de urato en el líquido sinovial.',
    nota: 'Regla de Janssens (monoartritis en atención primaria, sin líquido sinovial): sexo masculino, ataque previo, inicio en menos de 1 día, enrojecimiento, primera metatarsofalángica, hipertensión o enfermedad cardiovascular y ácido úrico mayor de 5,88 mg/dL. El resumen no da los puntos de cada variable: se usan como cualitativos. Si hay fiebre, descarta artritis séptica antes.',
    reglas: [
    { hallazgo: 'sexoMasculino', cualitativo: 'sube', fuente: 'janssens2010' },
    { hallazgo: 'ataquePrevio', cualitativo: 'sube', fuente: 'janssens2010' },
    { hallazgo: 'inicio1dia', cualitativo: 'sube', fuente: 'janssens2010' },
    { hallazgo: 'articulacionRoja', cualitativo: 'sube', fuente: 'janssens2010' },
    { hallazgo: 'mtp1', cualitativo: 'sube', fuente: 'janssens2010' },
    { hallazgo: 'htaOCardio', cualitativo: 'sube', fuente: 'janssens2010' },
    { hallazgo: 'uricoAlto', cualitativo: 'sube', fuente: 'janssens2010' },
  ] },
  { id: 'artritisSeptica', nombre: 'Artritis séptica', grave: true, sintomas: ['articular'],
    estudios: 'Artrocentesis: recuento de leucocitos y porcentaje de polimorfonucleares en líquido sinovial, antes del Gram y el cultivo.',
    nota: 'Dolor articular (85 %), hinchazón (78 %) y fiebre (57 %) son frecuentes pero no la distinguen; la ausencia de fiebre no la descarta. Lo que más cambia la probabilidad es el líquido sinovial. Factores de riesgo (edad, diabetes, artritis reumatoide, cirugía o prótesis, infección de piel, VIH) sin número en el resumen: cualitativos.',
    reglas: [
    { hallazgo: 'pmn90', lrPos: 3.4, lrNeg: 0.34, fuente: 'margaretten2007' },
    { hallazgo: 'protesisArticular', cualitativo: 'sube', fuente: 'margaretten2007' },
    { hallazgo: 'infeccionPiel', cualitativo: 'sube', fuente: 'margaretten2007' },
    { hallazgo: 'diabetes', cualitativo: 'sube', fuente: 'margaretten2007' },
    { hallazgo: 'artritisReumatoide', cualitativo: 'sube', fuente: 'margaretten2007' },
    { hallazgo: 'vih', cualitativo: 'sube', fuente: 'margaretten2007' },
  ],
    conteo: { hallazgos: ['wbc25', 'wbc50', 'wbc100'], texto: 'Leucocitos en líquido sinovial',
      tramos: [{ min: 3, lr: 28 }, { min: 2, lr: 7.7 }, { min: 1, lr: 2.9 }, { min: 0, lr: 0.32 }], fuente: 'margaretten2007',
      nota: 'Menos de 25 000/µL: LR 0,32; 25 000 o más: LR 2,9; más de 50 000: LR 7,7; más de 100 000: LR 28' } },
  { id: 'faringitisStrep', nombre: 'Faringitis estreptocócica', grave: false, sintomas: ['garganta'],
    estudios: 'Regla clínica validada y, según ella, prueba rápida de antígeno o cultivo de garganta.',
    nota: 'Ningún dato aislado de la historia o el examen basta para confirmarla o descartarla; usa una regla clínica validada.',
    reglas: [
    { hallazgo: 'exudadoAmigdalar', lrPos: 3.4, fuente: 'ebell2000' },
    { hallazgo: 'exudadoFaringeo', lrPos: 2.1, fuente: 'ebell2000' },
    { hallazgo: 'contactoStrep', lrPos: 1.9, fuente: 'ebell2000' },
    { hallazgo: 'ganglioCervical', lrNeg: 0.6, fuente: 'ebell2000' },
    { hallazgo: 'amigdalasGrandes', lrNeg: 0.63, fuente: 'ebell2000' },
  ] },
  { id: 'aneurismaAorta', nombre: 'Aneurisma de aorta abdominal', grave: true, edadMin: 50, sintomas: ['abdominal', 'lumbar'],
    estudios: 'Ecografía abdominal (estudio de referencia en los trabajos del artículo).',
    nota: 'La palpación es la única maniobra con valor demostrado (aneurisma de 3 cm o más). No sirve para descartarlo, sobre todo si se sospecha rotura; la obesidad abdominal la hace menos sensible.',
    reglas: [
    { hallazgo: 'aortaAncha', lrPos: 12, lrNeg: 0.72, fuente: 'lederle1999', nota: 'Aneurisma de 3 cm o más' },
  ] },
]

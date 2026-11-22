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
  pmid: string
  doi?: string
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
  wells2003: { id: 'wells2003', pmid: '14507948', doi: '10.1056/NEJMoa023153',
    cita: 'Wells PS, et al. N Engl J Med. 2003;349(13):1227-35',
    titulo: 'Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis' },
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
  // Síncope
  { id: 'sincope35', texto: 'Primer síncope a los 35 años o más', sintomas: ['sincope'] },
  { id: 'fibrilacion', texto: 'Antecedente de fibrilación o flutter auricular', sintomas: ['sincope', 'palpitaciones'] },
  { id: 'cardiopatia', texto: 'Cardiopatía estructural grave conocida', sintomas: ['sincope', 'palpitaciones'] },
  { id: 'cianosisEpisodio', texto: 'Cianosis vista durante el episodio', sintomas: ['sincope'] },
  { id: 'frioAntes', texto: 'Sensación de frío antes del episodio', sintomas: ['sincope'] },
  { id: 'cefaleaAntes', texto: 'Dolor de cabeza antes del episodio', sintomas: ['sincope'] },
]

export interface Regla {
  hallazgo: string
  fuente: string
  lrPos?: number
  lrNeg?: number
  cualitativo?: 'sube' | 'baja'
  /** Cuando el hallazgo ausente también cuenta en forma cualitativa (opuesto). */
  ausenteCuenta?: boolean
  nota?: string
}

export interface Diagnostico {
  id: string
  nombre: string
  /** «No te lo pierdas»: grave, siempre visible hasta que el médico lo descarte. */
  grave: boolean
  sintomas: string[]
  soloSexo?: 'Mujer' | 'Hombre'
  /** Solo se muestra si este hallazgo está marcado como presente. */
  requiere?: string
  nota?: string
  reglas: Regla[]
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
  { id: 'tep', nombre: 'Tromboembolismo pulmonar', grave: true, sintomas: ['toracico', 'disnea'],
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
  { id: 'icc', nombre: 'Insuficiencia cardiaca', grave: false, sintomas: ['disnea', 'edema'], reglas: [
    { hallazgo: 'iccPrevia', lrPos: 5.8, lrNeg: 0.45, fuente: 'wang2005' },
    { hallazgo: 'dpn', lrPos: 2.6, fuente: 'wang2005' },
    { hallazgo: 's3', lrPos: 11, fuente: 'wang2005' },
    { hallazgo: 'disneaEsfuerzo', lrNeg: 0.48, fuente: 'wang2005' },
    { hallazgo: 'crepitantes', lrNeg: 0.51, fuente: 'wang2005' },
  ] },
  { id: 'neumonia', nombre: 'Neumonía adquirida en la comunidad', grave: false, sintomas: ['tos', 'fiebre', 'disnea'],
    nota: 'Ningún hallazgo aislado confirma neumonía; signos vitales y auscultación normales la hacen poco probable.', reglas: [
    { hallazgo: 'fiebreMedida', cualitativo: 'sube', ausenteCuenta: true, fuente: 'metlay1997' },
    { hallazgo: 'taquipnea', cualitativo: 'sube', ausenteCuenta: true, fuente: 'metlay1997' },
    { hallazgo: 'crepitantes', cualitativo: 'sube', ausenteCuenta: true, fuente: 'metlay1997' },
  ] },
  { id: 'meningitis', nombre: 'Meningitis aguda', grave: true, sintomas: ['fiebre', 'cefalea', 'confusion'],
    nota: 'La ausencia de fiebre, rigidez de nuca y alteración mental prácticamente la descarta (sensibilidad 99–100 % de tener al menos uno).', reglas: [
    { hallazgo: 'fiebreMedida', cualitativo: 'sube', ausenteCuenta: true, fuente: 'attia1999' },
    { hallazgo: 'rigidezNuca', cualitativo: 'sube', ausenteCuenta: true, fuente: 'attia1999' },
    { hallazgo: 'alteracionMental', cualitativo: 'sube', ausenteCuenta: true, fuente: 'attia1999' },
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
  { id: 'colecistitis', nombre: 'Colecistitis aguda', grave: false, sintomas: ['abdominal'],
    nota: 'Ningún hallazgo aislado la confirma ni la descarta; requiere ecografía.', reglas: [
    { hallazgo: 'murphy', lrPos: 2.8, fuente: 'trowbridge2003', nota: 'IC 95 % incluye 1' },
    { hallazgo: 'dolorHcd', lrNeg: 0.4, fuente: 'trowbridge2003', nota: 'IC 95 % incluye 1' },
  ] },
  { id: 'hsa', nombre: 'Hemorragia subaracnoidea', grave: true, sintomas: ['cefalea'],
    nota: 'Regla de Ottawa: solo para cefalea no traumática que alcanzó su máximo en 1 h, sin déficit neurológico. Con todos los criterios ausentes tuvo 100 % de sensibilidad.', reglas: [
    { hallazgo: 'edad40', cualitativo: 'sube', ausenteCuenta: true, fuente: 'perry2013' },
    { hallazgo: 'cuelloDolor', cualitativo: 'sube', ausenteCuenta: true, fuente: 'perry2013' },
    { hallazgo: 'perdidaConciencia', cualitativo: 'sube', ausenteCuenta: true, fuente: 'perry2013' },
    { hallazgo: 'cefaleaEsfuerzo', cualitativo: 'sube', ausenteCuenta: true, fuente: 'perry2013' },
    { hallazgo: 'enTrueno', cualitativo: 'sube', ausenteCuenta: true, fuente: 'perry2013' },
    { hallazgo: 'flexionLimitada', cualitativo: 'sube', ausenteCuenta: true, fuente: 'perry2013' },
  ] },
  { id: 'sincopeCardiaco', nombre: 'Síncope de causa cardiaca', grave: true, sintomas: ['sincope'], reglas: [
    { hallazgo: 'sincope35', lrPos: 3.3, lrNeg: 0.13, fuente: 'albassam2019' },
    { hallazgo: 'fibrilacion', lrPos: 7.3, fuente: 'albassam2019' },
    { hallazgo: 'cardiopatia', lrPos: 3.3, fuente: 'albassam2019', nota: 'LR 3,3–4,8; se usa el valor menor' },
    { hallazgo: 'cianosisEpisodio', lrPos: 6.2, fuente: 'albassam2019' },
    { hallazgo: 'frioAntes', lrPos: 0.16, fuente: 'albassam2019' },
    { hallazgo: 'cefaleaAntes', lrPos: 0.17, fuente: 'albassam2019' },
  ] },
  { id: 'tvp', nombre: 'Trombosis venosa profunda', grave: true, sintomas: ['edema'],
    nota: 'Reglas cualitativas basadas en el modelo clínico de Wells; con probabilidad baja y dímero D negativo se puede descartar. El resumen del artículo no enumera las variables: revisar contra el texto completo.', reglas: [
    { hallazgo: 'edemaUnilateral', cualitativo: 'sube', fuente: 'wells2003' },
    { hallazgo: 'dolorVenoso', cualitativo: 'sube', fuente: 'wells2003' },
    { hallazgo: 'inmovilizacion', cualitativo: 'sube', fuente: 'wells2003' },
    { hallazgo: 'tvpPrevia', cualitativo: 'sube', fuente: 'wells2003' },
    { hallazgo: 'cancer', cualitativo: 'sube', fuente: 'wells2003' },
  ] },
]

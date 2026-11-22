// Pestañas dinámicas: 41 síntomas guía (Fase 1, medicina interna).
// Fuente: documento «Fase 1: Estructura…», sección 3. Pendiente de revisión médica.
// `claves` se comparan sin tildes ni mayúsculas contra lo que se escribe en el motivo
// de consulta y en la enfermedad actual.

export interface Sintoma {
  id: string
  sistema: string
  nombre: string
  claves: string[]
  preguntas: string[]
  alarmas: string[]
}

export const SINTOMAS: Sintoma[] = [
  // General
  { id: 'fiebre', sistema: 'General', nombre: 'Fiebre', claves: ['fiebre', 'escalofrio', 'calentura', 'febril'],
    preguntas: ['¿Temperatura medida? ¿Cuánto?', 'Patrón: continua, intermitente, por las tardes', 'Foco: tos, orina, diarrea, piel, dolor', 'Viajes a la Costa o la Amazonía (dengue, malaria, leptospirosis)', 'Contactos enfermos, animales, agua no tratada'],
    alarmas: ['Hipotensión', 'Confusión', 'Rigidez de nuca', 'Petequias o sangrado', 'Inmunosupresión'] },
  { id: 'peso', sistema: 'General', nombre: 'Pérdida de peso', claves: ['baje de peso', 'perdida de peso', 'adelgac', 'bajado de peso'],
    preguntas: ['¿Cuántos kg y en cuánto tiempo?', '¿Con o sin apetito?', 'Fiebre, sudor nocturno, tos', 'Cambios en las deposiciones'],
    alarmas: ['Más del 5 % en 6 meses sin causa', 'Con sudor nocturno o ganglios', 'Mayor de 50 años'] },
  { id: 'cansancio', sistema: 'General', nombre: 'Cansancio', claves: ['cansancio', 'decaimiento', 'astenia', 'fatiga', 'debilidad general'],
    preguntas: ['¿Desde cuándo?', '¿Empeora con el esfuerzo?', 'Sueño y ánimo', 'Sangrados, sed, intolerancia al frío'],
    alarmas: ['Con disnea o dolor torácico', 'Con palidez marcada', 'Con pérdida de peso'] },
  { id: 'ganglios', sistema: 'General', nombre: 'Ganglios', claves: ['ganglio', 'bolita', 'adenopatia'],
    preguntas: ['Localización, tamaño, dolor, tiempo', 'Fiebre, sudor nocturno, pérdida de peso', 'Contacto con TB o con gatos'],
    alarmas: ['Mayor de 2 cm', 'Duros o pegados', 'Supraclaviculares', 'Más de 4 semanas'] },
  { id: 'sudor', sistema: 'General', nombre: 'Sudoración nocturna', claves: ['sudo de noche', 'sudores', 'sudoracion nocturna', 'sudor nocturno'],
    preguntas: ['¿Moja la ropa o las sábanas?', 'Fiebre, tos, pérdida de peso', 'Contacto con TB'],
    alarmas: ['Con pérdida de peso o ganglios'] },
  // Cardiovascular
  { id: 'toracico', sistema: 'Cardiovascular', nombre: 'Dolor torácico', claves: ['dolor de pecho', 'dolor en el pecho', 'dolor toracico', 'opresion', 'angina', 'me duele el pecho'],
    preguntas: ['¿En reposo o con esfuerzo?', '¿Opresivo, punzante o desgarrante?', '¿Irradia a brazo, mandíbula o espalda?', '¿Cambia con la respiración, la postura o al presionar?', 'Sudoración, náusea', 'Inmovilización, viaje largo o cirugía reciente'],
    alarmas: ['Dolor de más de 20 min en reposo', 'Dolor desgarrante hacia la espalda', 'Síncope', 'Hipotensión', 'Disnea súbita'] },
  { id: 'palpitaciones', sistema: 'Cardiovascular', nombre: 'Palpitaciones', claves: ['palpitacion', 'se acelera el corazon', 'corazon acelerado', 'taquicardia'],
    preguntas: ['¿Rápidas o irregulares?', '¿Inicio y fin súbitos?', 'Café, alcohol, fármacos', 'Tiroides', 'Origen en zona de Chagas'],
    alarmas: ['Con síncope, dolor torácico o disnea', 'Cardiopatía conocida', 'Muerte súbita en la familia'] },
  { id: 'sincope', sistema: 'Cardiovascular', nombre: 'Síncope', claves: ['desmay', 'perdi el conocimiento', 'sincope', 'perdida de conciencia', 'perdida del conocimiento'],
    preguntas: ['¿Qué hacía: de pie, esfuerzo, al orinar?', 'Pródromos (calor, náusea, visión borrosa)', '¿Palpitaciones antes?', 'Movimientos, mordedura de lengua', '¿Recuperación rápida o lenta?'],
    alarmas: ['Durante el esfuerzo o acostado', 'Sin aviso', 'Cardiopatía conocida', 'Trauma por la caída', 'Mayor de 65 años'] },
  { id: 'edema', sistema: 'Cardiovascular', nombre: 'Edema', claves: ['hinchazon', 'piernas hinchadas', 'pierna hinchada', 'edema', 'pies hinchados'],
    preguntas: ['¿Una o las dos piernas?', 'Dolor o enrojecimiento', 'Disnea, orina espumosa, ictericia', 'Fármacos (amlodipino, AINE)'],
    alarmas: ['Unilateral y doloroso', 'Con disnea', 'Anasarca', 'Orina muy escasa'] },
  { id: 'hta', sistema: 'Cardiovascular', nombre: 'Presión alta', claves: ['presion alta', 'hipertension', 'tension alta'],
    preguntas: ['Cifras medidas', 'Tratamiento y adherencia', 'Cefalea, visión borrosa', 'Dolor torácico, disnea'],
    alarmas: ['Sistólica 180 o más o diastólica 120 o más con síntomas', 'Déficit neurológico', 'Embarazo'] },
  { id: 'claudicacion', sistema: 'Cardiovascular', nombre: 'Dolor en pierna al caminar', claves: ['claudicacion', 'duele la pierna al caminar', 'dolor de pierna al caminar'],
    preguntas: ['Distancia que camina', '¿Se alivia al parar?', 'Frialdad, heridas que no sanan', 'Tabaco, diabetes'],
    alarmas: ['Dolor en reposo', 'Pierna fría y pálida de inicio súbito', 'Gangrena'] },
  // Respiratorio
  { id: 'disnea', sistema: 'Respiratorio', nombre: 'Disnea', claves: ['falta de aire', 'ahogo', 'disnea', 'me ahogo', 'no puedo respirar', 'dificultad para respirar'],
    preguntas: ['¿Súbita o progresiva?', '¿Con qué esfuerzo aparece?', 'Ortopnea, disnea paroxística nocturna', 'Tos, fiebre, sibilancias', 'Edema de piernas'],
    alarmas: ['Habla entrecortada', 'Saturación baja para la altura de Cuenca', 'Uso de músculos accesorios', 'Cianosis', 'Confusión'] },
  { id: 'tos', sistema: 'Respiratorio', nombre: 'Tos', claves: ['tos', 'flema', 'expectoracion'],
    preguntas: ['Tiempo: aguda, subaguda o crónica', 'Seca o con flema (color)', 'Fiebre', 'Tabaco, humo de leña', 'Contacto con TB', 'Uso de IECA (enalapril)'],
    alarmas: ['Más de 2 semanas (descartar TB)', 'Con sangre', 'Pérdida de peso', 'Disnea'] },
  { id: 'hemoptisis', sistema: 'Respiratorio', nombre: 'Hemoptisis', claves: ['toso sangre', 'sangre al toser', 'hemoptisis', 'esputo con sangre'],
    preguntas: ['Cantidad (cucharadas, vasos)', '¿Con flema o pura?', 'Fiebre, pérdida de peso', 'Anticoagulantes', 'TB previa'],
    alarmas: ['Más de 100 ml en 24 h', 'Disnea', 'Hipotensión', 'Anticoagulado'] },
  { id: 'sibilancias', sistema: 'Respiratorio', nombre: 'Sibilancias', claves: ['silbido', 'sibilancia', 'asma', 'pecho apretado'],
    preguntas: ['Desencadenantes', 'Uso de inhaladores y cuántas veces', 'Crisis previas, intubaciones'],
    alarmas: ['No puede hablar', 'Tórax silente', 'Inhalador sin alivio'] },
  // Digestivo
  { id: 'abdominal', sistema: 'Digestivo', nombre: 'Dolor abdominal', claves: ['dolor de barriga', 'dolor de estomago', 'dolor abdominal', 'me duele la barriga', 'me duele el estomago', 'dolor de abdomen', 'colico'],
    preguntas: ['Cuadrante y si migró', 'Relación con comidas', 'Vómito, diarrea, estreñimiento', 'Ictericia', 'Última menstruación y posible embarazo'],
    alarmas: ['Abdomen en tabla', 'Dolor desproporcionado al examen', 'Sangrado digestivo', 'Hipotensión', 'Embarazo posible con dolor'] },
  { id: 'vomito', sistema: 'Digestivo', nombre: 'Náusea y vómito', claves: ['vomit', 'nausea', 'devuelvo', 'arcada'],
    preguntas: ['Frecuencia', 'Contenido: alimento, bilis, sangre, fecaloide', 'Tolerancia oral', 'Dolor, cefalea', 'Embarazo', 'Fármacos'],
    alarmas: ['Con sangre o fecaloide', 'Deshidratación', 'Cefalea intensa', 'Dolor abdominal fuerte'] },
  { id: 'diarrea', sistema: 'Digestivo', nombre: 'Diarrea', claves: ['diarrea', 'deposiciones liquidas', 'heces liquidas', 'suelto del estomago'],
    preguntas: ['Número al día', 'Con sangre o moco', 'Fiebre', 'Agua y alimentos', 'Antibióticos recientes', '¿Aguda o crónica?'],
    alarmas: ['Con sangre', 'Deshidratación', 'Fiebre alta', 'Mayor de 65 años o inmunosuprimido'] },
  { id: 'estrenimiento', sistema: 'Digestivo', nombre: 'Estreñimiento', claves: ['estreñ', 'estren', 'no puedo hacer', 'no hago deposicion'],
    preguntas: ['Frecuencia', 'Cambio reciente del hábito', 'Dolor, sangre', 'Fármacos (opioides, hierro)'],
    alarmas: ['Sin gases ni deposiciones con distensión', 'Sangre', 'Mayor de 50 años con cambio reciente'] },
  { id: 'sangradoDigestivo', sistema: 'Digestivo', nombre: 'Sangrado digestivo', claves: ['vomite sangre', 'heces negras', 'sangre en las heces', 'melena', 'hematemesis', 'rectorragia', 'popo negro'],
    preguntas: ['Hematemesis, melena o rectorragia', 'Cantidad', 'AINE, anticoagulantes, alcohol', 'Cirrosis'],
    alarmas: ['Hipotensión o taquicardia', 'Síncope', 'Sangrado activo', 'Cirrosis'] },
  { id: 'disfagia', sistema: 'Digestivo', nombre: 'Disfagia', claves: ['se me atora', 'dificultad para tragar', 'disfagia', 'no puedo tragar'],
    preguntas: ['¿Sólidos, líquidos o ambos?', '¿Progresiva?', '¿Dónde se atora?', 'Pérdida de peso', 'Tos al tragar'],
    alarmas: ['Progresiva con pérdida de peso', 'No pasa ni la saliva'] },
  { id: 'ictericia', sistema: 'Digestivo', nombre: 'Ictericia', claves: ['ojos amarillos', 'piel amarilla', 'ictericia', 'amarillo'],
    preguntas: ['Orina oscura, heces claras', 'Dolor, fiebre', 'Alcohol, fármacos, hierbas', 'Transfusiones, relaciones de riesgo'],
    alarmas: ['Fiebre con dolor en hipocondrio derecho', 'Confusión', 'Sangrado'] },
  { id: 'distension', sistema: 'Digestivo', nombre: 'Distensión abdominal', claves: ['barriga hinchada', 'ascitis', 'distension', 'abdomen hinchado', 'estomago hinchado'],
    preguntas: ['Desde cuándo', 'Aumento de peso', 'Ictericia, edema', 'Alcohol'],
    alarmas: ['Fiebre con dolor abdominal (peritonitis)', 'Confusión'] },
  { id: 'acidez', sistema: 'Digestivo', nombre: 'Acidez', claves: ['agrura', 'acidez', 'reflujo', 'ardor de estomago'],
    preguntas: ['Relación con comidas y posición', 'AINE', 'Disfagia', 'Pérdida de peso'],
    alarmas: ['Disfagia', 'Pérdida de peso', 'Anemia', 'Sangrado', 'Mayor de 60 años con inicio reciente'] },
  // Renal y urinario
  { id: 'urinario', sistema: 'Renal y urinario', nombre: 'Síntomas urinarios bajos', claves: ['ardor al orinar', 'orino seguido', 'disuria', 'dolor al orinar', 'polaquiuria', 'infeccion urinaria'],
    preguntas: ['Frecuencia, urgencia', 'Fiebre, dolor lumbar', 'Flujo o secreción', 'Embarazo posible'],
    alarmas: ['Fiebre con dolor lumbar', 'Hipotensión', 'Embarazo con fiebre'] },
  { id: 'hematuria', sistema: 'Renal y urinario', nombre: 'Hematuria', claves: ['orina con sangre', 'hematuria', 'sangre en la orina', 'orino sangre'],
    preguntas: ['¿Al inicio, al final o toda?', 'Coágulos', 'Dolor (cólico)', 'Tabaco', 'Anticoagulantes'],
    alarmas: ['Con coágulos y no puede orinar', 'Mayor de 40 años sin dolor'] },
  { id: 'diuresis', sistema: 'Renal y urinario', nombre: 'Cambios en la cantidad de orina', claves: ['orino poco', 'no orino', 'orino mucho', 'oliguria', 'anuria'],
    preguntas: ['Cantidad aproximada', 'Sed', 'Vómito o diarrea', 'Fármacos (AINE, diuréticos)', 'Próstata'],
    alarmas: ['Menos de 400 ml al día', 'No orina', 'Globo vesical'] },
  { id: 'colicoRenal', sistema: 'Renal y urinario', nombre: 'Cólico renal', claves: ['dolor de rinon', 'calculo', 'piedra en el rinon', 'colico renal'],
    preguntas: ['Dolor lumbar que baja a la ingle', 'Hematuria', 'Fiebre', 'Cálculos previos'],
    alarmas: ['Fiebre (riesgo de sepsis)', 'Riñón único', 'No orina'] },
  // Neurológico
  { id: 'cefalea', sistema: 'Neurológico', nombre: 'Cefalea', claves: ['dolor de cabeza', 'cefalea', 'migrana', 'me duele la cabeza'],
    preguntas: ['¿Súbita o progresiva?', '¿Distinta a las de siempre?', '¿Despierta de noche?', 'Náusea, fotofobia', 'Trauma reciente', 'Anticoagulantes'],
    alarmas: ['«El peor dolor de mi vida» de inicio súbito', 'Fiebre con rigidez de nuca', 'Déficit neurológico', 'Inicio después de los 50 años', 'Embarazo o puerperio'] },
  { id: 'mareo', sistema: 'Neurológico', nombre: 'Mareo y vértigo', claves: ['mareo', 'vertigo', 'me da vueltas', 'da vueltas', 'inestabilidad'],
    preguntas: ['¿Gira todo o es inestabilidad?', '¿Con movimientos de cabeza?', 'Oído: hipoacusia, tinnitus', 'Fármacos'],
    alarmas: ['Con visión doble, dificultad para hablar o caminar', 'Inicio súbito con cefalea'] },
  { id: 'deficit', sistema: 'Neurológico', nombre: 'Debilidad o adormecimiento', claves: ['no puedo mover', 'se me durmio', 'boca torcida', 'hemiparesia', 'adormecimiento', 'no puede hablar', 'perdida de fuerza'],
    preguntas: ['Hora exacta de inicio o última vez visto bien', '¿Qué lado?', 'Habla, visión', 'Episodios previos'],
    alarmas: ['Menos de 24 h de inicio (código ACV: registrar la hora)', 'Progresiva', 'Con cefalea o convulsión'] },
  { id: 'confusion', sistema: 'Neurológico', nombre: 'Confusión', claves: ['confundid', 'no reconoce', 'somnolient', 'desorientad', 'confusion'],
    preguntas: ['(Al familiar) ¿Desde cuándo?', 'Fiebre', 'Fármacos y alcohol', 'Glucosa', 'Trauma', 'Enfermedad renal o hepática'],
    alarmas: ['Glasgow bajo', 'Fiebre con rigidez de nuca', 'Hipoglucemia', 'Déficit focal'] },
  { id: 'convulsion', sistema: 'Neurológico', nombre: 'Convulsiones', claves: ['convulsion', 'ataque epileptico', 'epilepsia', 'convulsiono', 'crisis convulsiva'],
    preguntas: ['Descripción del testigo', 'Duración', 'Mordedura, relajación de esfínteres', '¿Primera vez o epilepsia conocida?', 'Adherencia, alcohol'],
    alarmas: ['Más de 5 min o repetidas sin despertar', 'Primera convulsión en adulto', 'Fiebre', 'Trauma'] },
  // Musculoesquelético
  { id: 'articular', sistema: 'Musculoesquelético', nombre: 'Dolor articular', claves: ['dolor de rodilla', 'articulacion', 'dolor de huesos', 'artritis', 'coyuntura'],
    preguntas: ['¿Una o varias?', 'Grandes o pequeñas', 'Rigidez matutina', 'Fiebre', 'Lesiones en piel'],
    alarmas: ['Articulación caliente y roja con fiebre', 'Trauma con deformidad'] },
  { id: 'lumbar', sistema: 'Musculoesquelético', nombre: 'Dolor lumbar', claves: ['dolor de espalda', 'dolor de cintura', 'lumbago', 'lumbalgia', 'dolor lumbar'],
    preguntas: ['Esfuerzo previo', 'Irradiación a la pierna', 'Debilidad, adormecimiento', 'Fiebre, pérdida de peso'],
    alarmas: ['Retención o incontinencia de orina', 'Anestesia en silla de montar', 'Fiebre', 'Cáncer previo', 'Mayor de 50 años con trauma'] },
  // Endocrino
  { id: 'poliuria', sistema: 'Endocrino', nombre: 'Sed y orina abundante', claves: ['mucha sed', 'orino mucho', 'polidipsia', 'poliuria', 'azucar alta', 'glucosa alta'],
    preguntas: ['Desde cuándo', 'Pérdida de peso', 'Visión borrosa', 'Glucosa conocida'],
    alarmas: ['Glucosa muy alta', 'Vómito', 'Dolor abdominal', 'Respiración rápida', 'Confusión'] },
  { id: 'tiroides', sistema: 'Endocrino', nombre: 'Síntomas de tiroides', claves: ['tiroides', 'bocio', 'intolerancia al calor', 'intolerancia al frio'],
    preguntas: ['Cambios de peso', 'Temblor, palpitaciones', 'Piel y cabello', 'Cuello'],
    alarmas: ['Fiebre con taquicardia y agitación', 'Somnolencia con hipotermia'] },
  // Hematológico
  { id: 'sangrados', sistema: 'Hematológico', nombre: 'Sangrados y moretones', claves: ['moreton', 'sangran las encias', 'equimosis', 'sangrado', 'petequia'],
    preguntas: ['Desde cuándo', 'Dónde', 'Anticoagulantes, AINE', 'Menstruaciones abundantes', 'Familia'],
    alarmas: ['Sangrado activo', 'Petequias con fiebre', 'Confusión'] },
  { id: 'palidez', sistema: 'Hematológico', nombre: 'Palidez', claves: ['palido', 'palida', 'anemia', 'palidez'],
    preguntas: ['Cansancio, disnea', 'Sangrados (digestivo, menstrual)', 'Dieta', 'Pérdida de peso'],
    alarmas: ['Con disnea en reposo, dolor torácico o síncope', 'Sangrado activo'] },
  // Piel
  { id: 'piel', sistema: 'Piel', nombre: 'Lesiones o erupción', claves: ['ronchas', 'manchas', 'granos', 'picazon', 'erupcion', 'sarpullido', 'comezon'],
    preguntas: ['Inicio y distribución', 'Picazón', 'Fármacos nuevos', 'Fiebre', 'Mucosas'],
    alarmas: ['Ampollas o piel que se desprende', 'Afecta boca u ojos', 'Petequias con fiebre', 'Hinchazón de labios o lengua'] },
  // Mental
  { id: 'animo', sistema: 'Mental', nombre: 'Estado de ánimo y ansiedad', claves: ['triste', 'ansios', 'nervios', 'no duermo', 'depresion', 'insomnio', 'angustia'],
    preguntas: ['Tiempo de evolución', 'Sueño, apetito', 'Consumo de sustancias', 'Pregunta directa por ideas de hacerse daño'],
    alarmas: ['Ideas o plan suicida', 'Agitación', 'Síntomas psicóticos'] },
]

export const normalizar = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// Negación fuerte: «niega fiebre, vómito ni diarrea» niega toda la lista hasta el punto,
// salvo que empiece otra frase: tras una coma («…, de inicio súbito», «…, presenta tos»)
// o con «pero», «aunque», «sin embargo». «Sin embargo» no es negación.
const NEGADOR = /\b(niega|sin(?! embargo)|no refiere|no presenta|no tiene|descarta|ausencia de|tampoco)\b/g
const CORTE = /,\s*(?=(de|del|que|con|pero|aunque|luego|posteriormente|ademas|asociad\w*|acompanad\w*|irradiad\w*|localizad\w*|tipo|refiere|presenta|manifiesta|se|el|la|los|las|en)\b)|\b(pero|aunque|sin embargo)\b/g

/** Tramos negados [inicio, fin) de una oración ya normalizada (sin tildes, en minúsculas). */
export function tramosNegados(oracion: string): [number, number][] {
  const cortes = [...oracion.matchAll(CORTE)].map((m) => m.index!)
  return [...oracion.matchAll(NEGADOR)].map((m) => {
    const ini = m.index!
    return [ini, cortes.find((c) => c > ini) ?? oracion.length] as [number, number]
  })
}

/** El texto (normalizado) con lo negado borrado, oración por oración. */
export function quitarNegado(texto: string): string {
  return normalizar(texto).split(/([.\n])/).map((o) => {
    let r = o
    for (const [a, b] of tramosNegados(o)) r = r.slice(0, a) + ' '.repeat(b - a) + r.slice(b)
    return r
  }).join('')
}

/** Devuelve los ids de los síntomas cuyas palabras clave aparecen en el texto. */
export function detectarSintomas(texto: string): string[] {
  // Lo negado no abre pestañas: «niega síncope», «sin fiebre», «no refiere disnea».
  const afirmado = quitarNegado(texto)
  const t = ' ' + afirmado.replace(/[^a-zñ0-9]+/g, ' ') + ' '
  return SINTOMAS.filter((s) =>
    s.claves.some((k) => {
      const nk = normalizar(k)
      // Claves muy cortas (tos) deben ser palabra completa; las demás pueden ser raíz.
      return nk.length <= 4 && !nk.includes(' ') ? new RegExp(`\\b${nk}\\b`).test(t) : t.includes(nk)
    }),
  ).map((s) => s.id)
}

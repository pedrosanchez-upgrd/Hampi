// Pestañas dinámicas: 73 síntomas guía (medicina interna, emergencia, cirugía, gineco-obstetricia, pediatría y salud mental).
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
  { id: 'fiebre', sistema: 'General', nombre: 'Fiebre', claves: ['fiebre', 'escalofrio', 'calentura', 'febril', 'temperatura alta', 'alza termica', 'hipertermia'],
    preguntas: ['¿Temperatura medida? ¿Cuánto?', 'Patrón: continua, intermitente, por las tardes', 'Foco: tos, orina, diarrea, piel, dolor', 'Viajes a la Costa o la Amazonía (dengue, malaria, leptospirosis)', 'Contactos enfermos, animales, agua no tratada'],
    alarmas: ['Hipotensión', 'Confusión', 'Rigidez de nuca', 'Petequias o sangrado', 'Inmunosupresión'] },
  { id: 'peso', sistema: 'General', nombre: 'Pérdida de peso', claves: ['baje de peso', 'perdida de peso', 'adelgac', 'bajado de peso'],
    preguntas: ['¿Cuántos kg y en cuánto tiempo?', '¿Con o sin apetito?', 'Fiebre, sudor nocturno, tos', 'Cambios en las deposiciones'],
    alarmas: ['Más del 5 % en 6 meses sin causa', 'Con sudor nocturno o ganglios', 'Mayor de 50 años'] },
  { id: 'cansancio', sistema: 'General', nombre: 'Cansancio', claves: ['cansancio', 'decaimiento', 'astenia', 'fatiga', 'debilidad general', 'sin fuerzas', 'agotad', 'no tengo fuerzas'],
    preguntas: ['¿Desde cuándo?', '¿Empeora con el esfuerzo?', 'Sueño y ánimo', 'Sangrados, sed, intolerancia al frío'],
    alarmas: ['Con disnea o dolor torácico', 'Con palidez marcada', 'Con pérdida de peso'] },
  { id: 'ganglios', sistema: 'General', nombre: 'Ganglios', claves: ['ganglio', 'bolita', 'adenopatia'],
    preguntas: ['Localización, tamaño, dolor, tiempo', 'Fiebre, sudor nocturno, pérdida de peso', 'Contacto con TB o con gatos'],
    alarmas: ['Mayor de 2 cm', 'Duros o pegados', 'Supraclaviculares', 'Más de 4 semanas'] },
  { id: 'sudor', sistema: 'General', nombre: 'Sudoración nocturna', claves: ['sudo de noche', 'sudores', 'sudoracion nocturna', 'sudor nocturno'],
    preguntas: ['¿Moja la ropa o las sábanas?', 'Fiebre, tos, pérdida de peso', 'Contacto con TB'],
    alarmas: ['Con pérdida de peso o ganglios'] },
  // Cardiovascular
  { id: 'toracico', sistema: 'Cardiovascular', nombre: 'Dolor torácico', claves: ['dolor de pecho', 'dolor en el pecho', 'dolor toracico', 'opresion', 'angina', 'me duele el pecho', 'dolor precordial', 'precordialgia', 'duele el pecho', 'puntada en el pecho', 'dolor retroesternal'],
    preguntas: ['¿En reposo o con esfuerzo?', '¿Opresivo, punzante o desgarrante?', '¿Irradia a brazo, mandíbula o espalda?', '¿Cambia con la respiración, la postura o al presionar?', 'Sudoración, náusea', 'Inmovilización, viaje largo o cirugía reciente'],
    alarmas: ['Dolor de más de 20 min en reposo', 'Dolor desgarrante hacia la espalda', 'Síncope', 'Hipotensión', 'Disnea súbita'] },
  { id: 'palpitaciones', sistema: 'Cardiovascular', nombre: 'Palpitaciones', claves: ['palpitacion', 'se acelera el corazon', 'corazon acelerado', 'taquicardia', 'latidos fuertes', 'arritmia', 'corazon late rapido'],
    preguntas: ['¿Rápidas o irregulares?', '¿Inicio y fin súbitos?', 'Café, alcohol, fármacos', 'Tiroides', 'Origen en zona de Chagas'],
    alarmas: ['Con síncope, dolor torácico o disnea', 'Cardiopatía conocida', 'Muerte súbita en la familia'] },
  { id: 'sincope', sistema: 'Cardiovascular', nombre: 'Síncope', claves: ['desmay', 'perdi el conocimiento', 'sincope', 'perdida de conciencia', 'perdida del conocimiento', 'desvanec', 'se desvanecio'],
    preguntas: ['¿Qué hacía: de pie, esfuerzo, al orinar?', 'Pródromos (calor, náusea, visión borrosa)', '¿Palpitaciones antes?', 'Movimientos, mordedura de lengua', '¿Recuperación rápida o lenta?'],
    alarmas: ['Durante el esfuerzo o acostado', 'Sin aviso', 'Cardiopatía conocida', 'Trauma por la caída', 'Mayor de 65 años'] },
  { id: 'edema', sistema: 'Cardiovascular', nombre: 'Edema', claves: ['hinchazon de piernas', 'hinchazon de las piernas', 'hinchazon de los pies', 'piernas hinchadas', 'pierna hinchada', 'edema', 'pies hinchados', 'tobillos hinchados'],
    preguntas: ['¿Una o las dos piernas?', 'Dolor o enrojecimiento', 'Disnea, orina espumosa, ictericia', 'Fármacos (amlodipino, AINE)'],
    alarmas: ['Unilateral y doloroso', 'Con disnea', 'Anasarca', 'Orina muy escasa'] },
  { id: 'hta', sistema: 'Cardiovascular', nombre: 'Presión alta', claves: ['presion alta', 'hipertension', 'tension alta', 'presion elevada', 'crisis hipertensiva'],
    preguntas: ['Cifras medidas', 'Tratamiento y adherencia', 'Cefalea, visión borrosa', 'Dolor torácico, disnea'],
    alarmas: ['Sistólica 180 o más o diastólica 120 o más con síntomas', 'Déficit neurológico', 'Embarazo'] },
  { id: 'claudicacion', sistema: 'Cardiovascular', nombre: 'Dolor en pierna al caminar', claves: ['claudicacion', 'duele la pierna al caminar', 'dolor de pierna al caminar'],
    preguntas: ['Distancia que camina', '¿Se alivia al parar?', 'Frialdad, heridas que no sanan', 'Tabaco, diabetes'],
    alarmas: ['Dolor en reposo', 'Pierna fría y pálida de inicio súbito', 'Gangrena'] },
  // Respiratorio
  { id: 'disnea', sistema: 'Respiratorio', nombre: 'Disnea', claves: ['falta de aire', 'ahogo', 'disnea', 'me ahogo', 'no puedo respirar', 'dificultad para respirar', 'cuesta respirar', 'respira rapido', 'no le alcanza el aire'],
    preguntas: ['¿Súbita o progresiva?', '¿Con qué esfuerzo aparece?', 'Ortopnea, disnea paroxística nocturna', 'Tos, fiebre, sibilancias', 'Edema de piernas'],
    alarmas: ['Habla entrecortada', 'Saturación baja para la altura de Cuenca', 'Uso de músculos accesorios', 'Cianosis', 'Confusión'] },
  { id: 'tos', sistema: 'Respiratorio', nombre: 'Tos', claves: ['tos', 'flema', 'expectoracion', 'toser'],
    preguntas: ['Tiempo: aguda, subaguda o crónica', 'Seca o con flema (color)', 'Fiebre', 'Tabaco, humo de leña', 'Contacto con TB', 'Uso de IECA (enalapril)'],
    alarmas: ['Más de 2 semanas (descartar TB)', 'Con sangre', 'Pérdida de peso', 'Disnea'] },
  { id: 'hemoptisis', sistema: 'Respiratorio', nombre: 'Hemoptisis', claves: ['toso sangre', 'sangre al toser', 'hemoptisis', 'esputo con sangre'],
    preguntas: ['Cantidad (cucharadas, vasos)', '¿Con flema o pura?', 'Fiebre, pérdida de peso', 'Anticoagulantes', 'TB previa'],
    alarmas: ['Más de 100 ml en 24 h', 'Disnea', 'Hipotensión', 'Anticoagulado'] },
  { id: 'sibilancias', sistema: 'Respiratorio', nombre: 'Sibilancias', claves: ['silbido', 'sibilancia', 'asma', 'pecho apretado'],
    preguntas: ['Desencadenantes', 'Uso de inhaladores y cuántas veces', 'Crisis previas, intubaciones'],
    alarmas: ['No puede hablar', 'Tórax silente', 'Inhalador sin alivio'] },
  // Digestivo
  { id: 'abdominal', sistema: 'Digestivo', nombre: 'Dolor abdominal', claves: ['dolor de barriga', 'dolor de estomago', 'dolor abdominal', 'me duele la barriga', 'me duele el estomago', 'dolor de abdomen', 'colico', 'dolor de panza', 'epigastralgia', 'dolor epigastrico', 'duele la barriga', 'duele el estomago', 'abdomen agudo', 'dolor en el abdomen'],
    preguntas: ['Cuadrante y si migró', 'Relación con comidas', 'Vómito, diarrea, estreñimiento', 'Ictericia', 'Última menstruación y posible embarazo'],
    alarmas: ['Abdomen en tabla', 'Dolor desproporcionado al examen', 'Sangrado digestivo', 'Hipotensión', 'Embarazo posible con dolor'] },
  { id: 'vomito', sistema: 'Digestivo', nombre: 'Náusea y vómito', claves: ['vomit', 'nausea', 'devuelvo', 'arcada', 'emesis'],
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
  { id: 'urinario', sistema: 'Renal y urinario', nombre: 'Síntomas urinarios bajos', claves: ['ardor al orinar', 'orino seguido', 'disuria', 'dolor al orinar', 'polaquiuria', 'infeccion urinaria', 'cistitis', 'molestia al orinar'],
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
  { id: 'cefalea', sistema: 'Neurológico', nombre: 'Cefalea', claves: ['dolor de cabeza', 'cefalea', 'migrana', 'me duele la cabeza', 'duele la cabeza', 'jaqueca'],
    preguntas: ['¿Súbita o progresiva?', '¿Distinta a las de siempre?', '¿Despierta de noche?', 'Náusea, fotofobia', 'Trauma reciente', 'Anticoagulantes'],
    alarmas: ['«El peor dolor de mi vida» de inicio súbito', 'Fiebre con rigidez de nuca', 'Déficit neurológico', 'Inicio después de los 50 años', 'Embarazo o puerperio'] },
  { id: 'mareo', sistema: 'Neurológico', nombre: 'Mareo y vértigo', claves: ['mareo', 'vertigo', 'me da vueltas', 'da vueltas', 'inestabilidad', 'vahido'],
    preguntas: ['¿Gira todo o es inestabilidad?', '¿Con movimientos de cabeza?', 'Oído: hipoacusia, tinnitus', 'Fármacos'],
    alarmas: ['Con visión doble, dificultad para hablar o caminar', 'Inicio súbito con cefalea'] },
  { id: 'deficit', sistema: 'Neurológico', nombre: 'Debilidad o adormecimiento', claves: ['no puedo mover', 'se me durmio', 'boca torcida', 'hemiparesia', 'adormecimiento', 'no puede hablar', 'perdida de fuerza', 'paralisis', 'hormigueo', 'parestesia', 'debilidad en el brazo', 'debilidad en la pierna', 'debilidad de un lado'],
    preguntas: ['Hora exacta de inicio o última vez visto bien', '¿Qué lado?', 'Habla, visión', 'Episodios previos'],
    alarmas: ['Menos de 24 h de inicio (código ACV: registrar la hora)', 'Progresiva', 'Con cefalea o convulsión'] },
  { id: 'confusion', sistema: 'Neurológico', nombre: 'Confusión', claves: ['confundid', 'no reconoce', 'somnolient', 'desorientad', 'confusion', 'delirio', 'no responde', 'inconsciente', 'alteracion de la conciencia'],
    preguntas: ['(Al familiar) ¿Desde cuándo?', 'Fiebre', 'Fármacos y alcohol', 'Glucosa', 'Trauma', 'Enfermedad renal o hepática'],
    alarmas: ['Glasgow bajo', 'Fiebre con rigidez de nuca', 'Hipoglucemia', 'Déficit focal'] },
  { id: 'convulsion', sistema: 'Neurológico', nombre: 'Convulsiones', claves: ['convulsion', 'ataque epileptico', 'epilepsia', 'convulsiono', 'crisis convulsiva'],
    preguntas: ['Descripción del testigo', 'Duración', 'Mordedura, relajación de esfínteres', '¿Primera vez o epilepsia conocida?', 'Adherencia, alcohol'],
    alarmas: ['Más de 5 min o repetidas sin despertar', 'Primera convulsión en adulto', 'Fiebre', 'Trauma'] },
  // Musculoesquelético
  { id: 'articular', sistema: 'Musculoesquelético', nombre: 'Dolor articular', claves: ['dolor de rodilla', 'articulacion', 'dolor de huesos', 'artritis', 'coyuntura', 'gota', 'podagra', 'dedo gordo', 'rodilla', 'tobillo', 'muneca', 'codo', 'artralgia', 'monoartritis', 'poliartritis', 'articular', 'acido urico', 'hinchazon de la rodilla'],
    preguntas: ['¿Una o varias?', 'Grandes o pequeñas', 'Rigidez matutina', 'Fiebre', 'Lesiones en piel'],
    alarmas: ['Articulación caliente y roja con fiebre', 'Trauma con deformidad'] },
  { id: 'lumbar', sistema: 'Musculoesquelético', nombre: 'Dolor lumbar', claves: ['dolor de espalda', 'dolor de cintura', 'lumbago', 'lumbalgia', 'dolor lumbar', 'ciatica', 'dolor de la cintura'],
    preguntas: ['Esfuerzo previo', 'Irradiación a la pierna', 'Debilidad, adormecimiento', 'Fiebre, pérdida de peso'],
    alarmas: ['Retención o incontinencia de orina', 'Anestesia en silla de montar', 'Fiebre', 'Cáncer previo', 'Mayor de 50 años con trauma'] },
  // Endocrino
  { id: 'poliuria', sistema: 'Endocrino', nombre: 'Sed y orina abundante', claves: ['mucha sed', 'orino mucho', 'polidipsia', 'poliuria', 'azucar alta', 'glucosa alta', 'hiperglucemia', 'cetoacidosis', 'diabetes descompensada'],
    preguntas: ['Desde cuándo', 'Pérdida de peso', 'Visión borrosa', 'Glucosa conocida'],
    alarmas: ['Glucosa muy alta', 'Vómito', 'Dolor abdominal', 'Respiración rápida', 'Confusión'] },
  { id: 'tiroides', sistema: 'Endocrino', nombre: 'Síntomas de tiroides', claves: ['tiroides', 'bocio', 'intolerancia al calor', 'intolerancia al frio'],
    preguntas: ['Cambios de peso', 'Temblor, palpitaciones', 'Piel y cabello', 'Cuello'],
    alarmas: ['Fiebre con taquicardia y agitación', 'Somnolencia con hipotermia'] },
  // Hematológico
  { id: 'sangrados', sistema: 'Hematológico', nombre: 'Sangrados y moretones', claves: ['moreton', 'sangran las encias', 'equimosis', 'sangrado', 'petequia', 'hematoma'],
    preguntas: ['Desde cuándo', 'Dónde', 'Anticoagulantes, AINE', 'Menstruaciones abundantes', 'Familia'],
    alarmas: ['Sangrado activo', 'Petequias con fiebre', 'Confusión'] },
  { id: 'palidez', sistema: 'Hematológico', nombre: 'Palidez', claves: ['palido', 'palida', 'anemia', 'palidez'],
    preguntas: ['Cansancio, disnea', 'Sangrados (digestivo, menstrual)', 'Dieta', 'Pérdida de peso'],
    alarmas: ['Con disnea en reposo, dolor torácico o síncope', 'Sangrado activo'] },
  // Piel
  { id: 'piel', sistema: 'Piel', nombre: 'Lesiones o erupción', claves: ['ronchas', 'manchas', 'granos', 'picazon', 'erupcion', 'sarpullido', 'comezon', 'urticaria', 'celulitis', 'absceso', 'herpes', 'zoster', 'llaga', 'herida infectada'],
    preguntas: ['Inicio y distribución', 'Picazón', 'Fármacos nuevos', 'Fiebre', 'Mucosas'],
    alarmas: ['Ampollas o piel que se desprende', 'Afecta boca u ojos', 'Petequias con fiebre', 'Hinchazón de labios o lengua'] },
  // Cabeza, ojos, oídos, nariz y garganta
  { id: 'garganta', sistema: 'Cabeza y cuello', nombre: 'Dolor de garganta', claves: ['dolor de garganta', 'duele la garganta', 'odinofagia', 'amigdal', 'faringitis', 'ronquera', 'disfonia'],
    preguntas: ['¿Desde cuándo?', 'Fiebre, tos, secreción nasal', 'Placas o pus en las amígdalas', '¿Puede tragar la saliva y abrir la boca?', 'Ganglios en el cuello'],
    alarmas: ['No puede tragar la saliva o babea', 'No puede abrir la boca (trismus)', 'Estridor o dificultad para respirar', 'Voz apagada («de papa caliente»)', 'Hinchazón del cuello'] },
  { id: 'oido', sistema: 'Cabeza y cuello', nombre: 'Oído', claves: ['dolor de oido', 'otalgia', 'oido', 'supura el oido', 'hipoacusia', 'sordera', 'zumbido', 'tinnitus'],
    preguntas: ['¿Un oído o los dos?', 'Secreción', 'Fiebre', 'Pérdida de audición, zumbido, vértigo', 'Agua o trauma en el oído'],
    alarmas: ['Hinchazón o dolor detrás de la oreja', 'Parálisis facial', 'Pérdida súbita de la audición', 'Fiebre alta con dolor de cabeza'] },
  { id: 'ojo', sistema: 'Cabeza y cuello', nombre: 'Ojo y visión', claves: ['ojo rojo', 'ojos rojos', 'dolor de ojo', 'dolor en el ojo', 'vision borrosa', 'perdida de vision', 'no veo', 'vision doble', 'diplopia', 'conjuntivitis'],
    preguntas: ['¿Un ojo o los dos?', '¿Súbito o progresivo?', 'Dolor, secreción, picazón', 'Fotofobia, halos', 'Trauma o químico', 'Uso de lentes de contacto'],
    alarmas: ['Pérdida súbita de la visión', 'Ojo rojo con dolor intenso, halos y vómito', 'Trauma o químico en el ojo', 'Visión doble de inicio súbito'] },
  { id: 'epistaxis', sistema: 'Cabeza y cuello', nombre: 'Sangrado nasal', claves: ['epistaxis', 'sangrado nasal', 'sangra la nariz', 'sangre por la nariz', 'hemorragia nasal'],
    preguntas: ['¿Una o las dos fosas?', '¿Cuánto tiempo y cuánta sangre?', 'Presión arterial', 'Anticoagulantes, aspirina', 'Episodios previos, otros sangrados'],
    alarmas: ['No se detiene con 20 minutos de presión', 'Hipotensión o taquicardia', 'Anticoagulado', 'Sangre que baja a la garganta en gran cantidad'] },
  { id: 'cuello', sistema: 'Cabeza y cuello', nombre: 'Dolor de cuello', claves: ['dolor de cuello', 'dolor en el cuello', 'cervicalgia', 'torticolis'],
    preguntas: ['Trauma previo', 'Irradiación al brazo', 'Fiebre', 'Dolor de cabeza'],
    alarmas: ['Fiebre con rigidez de nuca', 'Trauma con dolor en la línea media', 'Debilidad o adormecimiento de brazos', 'Dolor torácico o de mandíbula asociado'] },
  // Urgencias
  { id: 'alergia', sistema: 'Urgencias', nombre: 'Reacción alérgica', claves: ['alergia', 'reaccion alergica', 'anafilaxia', 'labios hinchados', 'hincharon los labios', 'hinchazon de labios', 'hinchazon de los labios', 'lengua hinchada', 'ronchas en todo el cuerpo', 'hinchazon de la cara', 'cara hinchada', 'picadura'],
    preguntas: ['¿Qué comió, tomó o lo picó?', '¿Cuánto tiempo después empezó?', 'Ronchas, picazón', 'Dificultad para respirar o tragar', 'Vómito, dolor abdominal', 'Reacciones previas'],
    alarmas: ['Dificultad para respirar o estridor', 'Hinchazón de lengua o garganta', 'Hipotensión o desmayo', 'Síntomas en piel más vómito o dolor abdominal'] },
  { id: 'intoxicacion', sistema: 'Urgencias', nombre: 'Intoxicación', claves: ['intoxic', 'sobredosis', 'envenen', 'veneno', 'plaguicida', 'organofosforado', 'raticida', 'tomo muchas pastillas', 'ingesta de pastillas', 'ingesta voluntaria', 'ingesta intencional'],
    preguntas: ['¿Qué, cuánto y a qué hora?', '¿Fue intencional?', 'Envase o etiqueta', 'Vómito, somnolencia, convulsiones', 'Otras personas expuestas'],
    alarmas: ['Ingesta intencional (riesgo suicida)', 'Alteración de la conciencia', 'Convulsiones', 'Pupilas puntiformes, salivación o sudor profuso (organofosforados)', 'Dificultad para respirar'] },
  { id: 'trauma', sistema: 'Urgencias', nombre: 'Trauma o caída', claves: ['me cai', 'se cayo', 'sufrio una caida', 'tras una caida', 'caida desde', 'se golpeo', 'me golpee', 'accidente de transito', 'traumatismo', 'trauma', 'atropell', 'fractura', 'choque vehicular'],
    preguntas: ['Mecanismo: altura, velocidad, objeto', '¿Pérdida de conciencia?', 'Dónde duele', 'Anticoagulantes', '¿Por qué se cayó? (mareo, síncope)'],
    alarmas: ['Golpe en la cabeza con pérdida de conciencia o vómito', 'Anticoagulado con golpe en la cabeza', 'Dolor en la línea media del cuello', 'Deformidad o hueso expuesto', 'Mecanismo de alta energía', 'Hipotensión'] },
  { id: 'quemadura', sistema: 'Urgencias', nombre: 'Quemadura', claves: ['quemadura', 'me queme', 'se quemo', 'quemad'],
    preguntas: ['Agente: líquido, fuego, eléctrica, química', 'Extensión y zonas', '¿Espacio cerrado o humo?', 'Hora'],
    alarmas: ['Cara, cuello, manos, genitales o articulaciones', 'Extensa o profunda', 'Por electricidad o química', 'Inhalación de humo (voz ronca, hollín)'] },
  { id: 'mordedura', sistema: 'Urgencias', nombre: 'Mordedura o picadura', claves: ['mordedura', 'mordio', 'mordida', 'serpiente', 'culebra', 'alacran', 'escorpion'],
    preguntas: ['Animal: perro, gato, murciélago, serpiente, otro', 'Hora y lugar (Costa o Amazonía)', 'Vacuna antirrábica y antitetánica', 'Hinchazón, sangrado'],
    alarmas: ['Mordedura de serpiente', 'Hinchazón que avanza', 'Sangrado de encías u orina con sangre', 'Murciélago o animal sospechoso de rabia', 'Mordedura en cara, manos o genitales'] },
  { id: 'glucosaBaja', sistema: 'Urgencias', nombre: 'Glucosa baja', claves: ['hipoglucemia', 'glucosa baja', 'azucar baja'],
    preguntas: ['Glucosa medida', 'Insulina o glibenclamida', '¿Comió?', 'Alcohol', 'Episodios previos'],
    alarmas: ['Confusión o convulsión', 'Uso de sulfonilureas (puede repetir)', 'No puede comer'] },
  // Genitourinario y ginecológico
  { id: 'testicular', sistema: 'Renal y urinario', nombre: 'Dolor testicular', claves: ['testicul', 'escroto', 'escrotal'],
    preguntas: ['¿Súbito o progresivo?', '¿Hora de inicio?', 'Náusea o vómito', 'Fiebre, ardor al orinar', 'Trauma'],
    alarmas: ['Dolor súbito e intenso (torsión: cada hora cuenta)', 'Testículo alto o horizontal', 'Fiebre con enrojecimiento'] },
  { id: 'ginecologico', sistema: 'Ginecológico', nombre: 'Sangrado vaginal o dolor pélvico', claves: ['sangrado vaginal', 'sangrado por la vagina', 'metrorragia', 'menstruacion abundante', 'dolor pelvico', 'atraso menstrual'],
    preguntas: ['Fecha de la última menstruación', '¿Posible embarazo?', 'Cantidad (toallas al día), coágulos', 'Flujo, fiebre', 'Dolor y su lado'],
    alarmas: ['Embarazo con dolor o sangrado', 'Hipotensión o taquicardia', 'Fiebre con dolor pélvico', 'Más de una toalla por hora'] },
  // Extremidades
  { id: 'extremidad', sistema: 'Musculoesquelético', nombre: 'Dolor de brazo o pierna', claves: ['dolor de pierna', 'dolor en la pierna', 'pantorrilla', 'dolor de brazo', 'dolor en el brazo', 'pie diabetico', 'pierna fria', 'pie frio'],
    preguntas: ['¿Súbito o progresivo?', 'Hinchazón, enrojecimiento, calor', 'Color y temperatura', 'Trauma', 'Diabetes, heridas'],
    alarmas: ['Pierna fría, pálida y sin pulso', 'Hinchazón de una sola pierna con dolor', 'Herida que huele mal o se pone negra', 'Dolor desproporcionado (síndrome compartimental)'] },
  // Más urgencias
  { id: 'shock', sistema: 'Urgencias', nombre: 'Presión baja o shock', claves: ['presion baja', 'hipotension', 'shock', 'choque septico', 'choque hipovolemico'],
    preguntas: ['Cifras de presión', 'Sangrado, vómito o diarrea', 'Fiebre, foco de infección', 'Dolor torácico', 'Alergia reciente', 'Medicamentos'],
    alarmas: ['Presión sistólica menor de 90', 'Confusión', 'Piel fría y moteada', 'Orina escasa', 'Lactato alto'] },
  { id: 'paro', sistema: 'Urgencias', nombre: 'Paro o no responde', claves: ['paro cardiaco', 'paro cardiorrespiratorio', 'no tiene pulso', 'no respira', 'reanimacion'],
    preguntas: ['Hora del colapso', '¿Alguien hizo RCP? ¿Cuánto tiempo?', 'Ritmo inicial', 'Enfermedades y medicamentos previos', 'Causas reversibles (las 5 H y 5 T)'],
    alarmas: ['Sin pulso: iniciar RCP y pedir ayuda', 'No respira normalmente'] },
  { id: 'ambiental', sistema: 'Urgencias', nombre: 'Frío, calor, electricidad o agua', claves: ['hipotermia', 'golpe de calor', 'insolacion', 'electrocut', 'descarga electrica', 'ahogamiento', 'casi ahogado', 'rayo'],
    preguntas: ['Tiempo de exposición', 'Temperatura medida', 'Pérdida de conciencia', 'Quemaduras de entrada y salida', 'Trauma asociado'],
    alarmas: ['Temperatura menor de 32 °C o mayor de 40 °C', 'Confusión', 'Arritmia', 'Dificultad para respirar'] },
  { id: 'violencia', sistema: 'Urgencias', nombre: 'Violencia o abuso', claves: ['violacion', 'abuso sexual', 'agresion sexual', 'violencia intrafamiliar', 'maltrato', 'me pego', 'golpeada', 'golpeado por'],
    preguntas: ['Preguntar en privado y sin juzgar', 'Hora del hecho', 'Lesiones', 'Riesgo de que vuelva a pasar', 'Anticoncepción de emergencia y profilaxis (VIH, ITS) en violencia sexual'],
    alarmas: ['Riesgo para su vida o la de sus hijos', 'Ideas suicidas', 'Menor de edad (notificación obligatoria)', 'Agresión sexual en las últimas 72 h (profilaxis)'] },
  { id: 'sustancias', sistema: 'Mental', nombre: 'Alcohol o drogas', claves: ['borracho', 'ebrio', 'estado etilico', 'abstinencia', 'resaca', 'cocaina', 'marihuana', 'droga', 'consumo de alcohol', 'alcoholismo'],
    preguntas: ['Qué, cuánto y cuándo', 'Último consumo', 'Temblor, sudor, alucinaciones', 'Convulsiones previas por abstinencia', 'Trauma'],
    alarmas: ['Convulsiones o delirium tremens', 'Alteración de la conciencia', 'Trauma craneal asociado', 'Ideas suicidas'] },
  // Obstetricia
  { id: 'embarazo', sistema: 'Obstétrico', nombre: 'Embarazo o posparto', claves: ['embarazo', 'gestacion', 'semanas de gestacion', 'posparto', 'puerper', 'perdida de liquido', 'no siente al bebe', 'contracciones', 'sangrado en el embarazo'],
    preguntas: ['Semanas de gestación (fecha de la última menstruación)', 'Controles prenatales', 'Sangrado, pérdida de líquido', 'Contracciones', 'Movimientos fetales', 'Dolor de cabeza, visión, edema', 'Fiebre'],
    alarmas: ['Presión 140/90 o más con dolor de cabeza, visión borrosa o dolor en epigastrio', 'Sangrado vaginal', 'Pérdida de líquido', 'No siente moverse al bebé', 'Convulsión', 'Fiebre en el posparto', 'Sangrado posparto abundante'] },
  // Genital, mama y región anal
  { id: 'ets', sistema: 'Ginecológico', nombre: 'Secreción o llaga genital', claves: ['secrecion uretral', 'secrecion por el pene', 'llaga en el pene', 'llaga genital', 'ulcera genital', 'verruga genital', 'flujo vaginal', 'infeccion de transmision sexual'],
    preguntas: ['Parejas y uso de condón', 'Secreción: color, olor', 'Llagas: dolorosas o no', 'Ardor al orinar', 'Fiebre, dolor pélvico', 'Pruebas de VIH y sífilis'],
    alarmas: ['Fiebre con dolor pélvico', 'Embarazo', 'Menor de edad (posible abuso)'] },
  { id: 'mama', sistema: 'Ginecológico', nombre: 'Mama', claves: ['bulto en la mama', 'bulto en el seno', 'dolor de mama', 'dolor en el seno', 'mamaria', 'pezon', 'secrecion por el pezon', 'mastitis'],
    preguntas: ['¿Desde cuándo?', 'Relación con la menstruación', 'Lactancia', 'Secreción del pezón: color', 'Cambios de la piel', 'Familiares con cáncer de mama'],
    alarmas: ['Bulto duro, fijo o que crece', 'Piel de naranja o retracción del pezón', 'Secreción con sangre', 'Ganglio en la axila', 'Fiebre con mama roja (absceso)'] },
  { id: 'anal', sistema: 'Digestivo', nombre: 'Dolor o bulto anal', claves: ['dolor anal', 'hemorroide', 'almorrana', 'fisura', 'fistula', 'absceso perianal', 'picazon anal', 'bulto en el ano', 'sangrado al defecar'],
    preguntas: ['Dolor al defecar', 'Sangre: roja, en el papel', 'Bulto que sale', 'Fiebre', 'Estreñimiento'],
    alarmas: ['Fiebre con dolor intenso (absceso)', 'Sangrado abundante', 'Cambio del hábito en mayor de 50 años', 'Pérdida de peso'] },
  { id: 'hernia', sistema: 'Digestivo', nombre: 'Bulto en ingle o abdomen', claves: ['hernia inguinal', 'hernia umbilical', 'bulto en la ingle', 'bulto en el ombligo', 'bulto en el abdomen', 'eventracion'],
    preguntas: ['¿Desde cuándo?', '¿Se mete solo?', 'Dolor', 'Vómito, gases, deposiciones'],
    alarmas: ['No se mete y duele (encarcelada)', 'Piel roja sobre el bulto', 'Vómito y sin gases (obstrucción)'] },
  // Más síntomas comunes
  { id: 'nariz', sistema: 'Cabeza y cuello', nombre: 'Gripe, nariz tapada o sinusitis', claves: ['gripe', 'resfriado', 'resfrio', 'congestion nasal', 'nariz tapada', 'rinorrea', 'mocos', 'moco nasal', 'estornud', 'sinusitis', 'rinitis'],
    preguntas: ['¿Desde cuándo?', 'Fiebre', 'Dolor en la cara', 'Moco: color', 'Alergias', 'Contactos enfermos'],
    alarmas: ['Más de 10 días o empeora después de mejorar', 'Hinchazón alrededor del ojo', 'Dolor de cabeza intenso con fiebre', 'Dificultad para respirar'] },
  { id: 'boca', sistema: 'Cabeza y cuello', nombre: 'Boca y dientes', claves: ['dolor de muela', 'muela', 'dolor dental', 'llagas en la boca', 'aftas', 'encias hinchadas', 'boca seca'],
    preguntas: ['¿Desde cuándo?', 'Hinchazón de la cara', 'Fiebre', 'Dificultad para abrir la boca o tragar'],
    alarmas: ['Hinchazón del cuello o debajo de la lengua (angina de Ludwig)', 'Dificultad para respirar o tragar', 'Úlcera de más de 3 semanas'] },
  { id: 'orinar', sistema: 'Renal y urinario', nombre: 'No puede orinar o se le escapa', claves: ['no puedo orinar', 'retencion urinaria', 'retencion de orina', 'incontinencia', 'se me escapa la orina', 'chorro debil', 'goteo'],
    preguntas: ['¿Desde cuándo?', 'Dolor en el bajo vientre', 'Medicamentos (anticolinérgicos, opioides)', 'Próstata', 'Debilidad de piernas o dolor de espalda'],
    alarmas: ['Globo vesical doloroso', 'Con debilidad de piernas o anestesia en silla de montar', 'Fiebre'] },
  { id: 'muscular', sistema: 'Musculoesquelético', nombre: 'Dolor o debilidad muscular', claves: ['dolor muscular', 'mialgia', 'calambre', 'debilidad muscular', 'debilidad en las piernas', 'debilidad en ambas piernas', 'dolor de hombro', 'dolor en el hombro'],
    preguntas: ['Localizado o generalizado', 'Ejercicio o trauma', 'Orina oscura', 'Medicamentos (estatinas)', 'Fiebre', '¿Le cuesta levantarse de la silla o subir gradas?'],
    alarmas: ['Debilidad que sube desde las piernas', 'Dificultad para respirar o tragar', 'Orina oscura (rabdomiólisis)', 'Potasio muy alto o bajo'] },
  { id: 'temblor', sistema: 'Neurológico', nombre: 'Temblor o movimientos', claves: ['temblor', 'tiembla', 'movimientos involuntarios', 'tics', 'parkinson'],
    preguntas: ['¿En reposo o al moverse?', 'Desde cuándo', 'Café, alcohol, fármacos', 'Tiroides', 'Lentitud, rigidez'],
    alarmas: ['Con fiebre y rigidez (síndrome neuroléptico o serotoninérgico)', 'Abstinencia de alcohol con confusión'] },
  { id: 'memoria', sistema: 'Neurológico', nombre: 'Olvidos o memoria', claves: ['olvidos', 'olvida las cosas', 'se olvida de todo', 'perdida de memoria', 'demencia', 'se pierde'],
    preguntas: ['(Al familiar) ¿Desde cuándo? ¿Súbito o progresivo?', 'Actividades que ya no puede hacer', 'Ánimo', 'Fármacos', 'Caídas'],
    alarmas: ['Inicio súbito (delirium: buscar causa)', 'Con fiebre, caída o déficit focal', 'Riesgo en casa (cocina, se pierde)'] },
  { id: 'posoperatorio', sistema: 'Urgencias', nombre: 'Después de una cirugía', claves: ['postoperatorio', 'posoperatorio', 'herida quirurgica', 'despues de la cirugia', 'operado', 'recien operado'],
    preguntas: ['Qué cirugía y cuándo', 'Fiebre', 'Herida: roja, secreción, se abrió', 'Dolor, vómito, gases', 'Pierna hinchada, falta de aire'],
    alarmas: ['Fiebre con herida roja o con pus', 'Falta de aire súbita (embolia)', 'Abdomen duro o sin gases', 'Sangrado de la herida'] },
  // Pediatría
  { id: 'pediatrico', sistema: 'Pediatría', nombre: 'Niño o bebé enfermo', claves: ['recien nacido', 'lactante', 'no quiere lactar', 'no quiere comer', 'llanto inconsolable', 'mi bebe', 'paciente pediatric'],
    preguntas: ['Edad exacta (meses)', 'Fiebre: cuánto y cuántos días', 'Come, toma pecho, moja pañales', 'Vacunas al día', 'Peso y talla, crecimiento', 'Contactos enfermos, guardería'],
    alarmas: ['Menor de 3 meses con fiebre', 'No despierta o está muy decaído', 'Respira rápido, se hunden las costillas', 'No moja pañales (deshidratación)', 'Convulsión', 'Manchas que no desaparecen al presionar'] },
  // Mental
  { id: 'animo', sistema: 'Mental', nombre: 'Estado de ánimo y ansiedad', claves: ['triste', 'ansios', 'nervios', 'no duermo', 'depresion', 'insomnio', 'angustia', 'suicid', 'quiere morir', 'panico'],
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

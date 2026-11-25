// Estructura de la historia clínica de medicina interna (Fase 1).
// Fuente: documento «Fase 1: Estructura de la historia clínica de medicina interna».
// El contenido médico está pendiente de revisión por médicos antes de usarse con pacientes reales.

export type TipoCampo = 'texto' | 'parrafo' | 'numero' | 'opcion' | 'fecha'

export interface Campo {
  id: string
  etiqueta: string
  tipo: TipoCampo
  opciones?: string[]
  unidad?: string
  obligatorio?: boolean
  ayuda?: string
  /** Etiqueta corta para la redacción final. */
  corto?: string
  /** Subtítulo dentro del apartado (por ejemplo «Alérgicos»). */
  grupo?: string
  /** Respuestas rápidas de un toque (por ejemplo «Niega»). */
  rapido?: string[]
  /** Solo se muestra para este sexo (gineco-obstétricos). */
  soloSexo?: 'Mujer'
  /** Cómo preguntarlo al paciente (va arriba del campo, como en una conversación). */
  pregunta?: string
}

export interface Seccion {
  id: string
  numero: number
  titulo: string
  descripcion: string
  campos: Campo[]
  /** Preguntas guía para no olvidar nada durante la entrevista. */
  guia: string[]
}


export const SECCIONES: Seccion[] = [
  {
    id: 'filiacion',
    numero: 1,
    titulo: 'Datos de filiación',
    descripcion: 'Identificación del paciente, fuente de la información y confiabilidad.',
    campos: [
      { id: 'nombre', corto: 'Nombre', etiqueta: 'Nombre (ficticio en Fase 1)', tipo: 'texto' },
      { id: 'cedula', etiqueta: 'Cédula de identidad', tipo: 'texto', ayuda: '10 dígitos. Se valida el dígito verificador.' },
      { id: 'hcu', corto: 'HCU', etiqueta: 'N.º de historia clínica única (HCU)', tipo: 'texto' },
      { id: 'edad', etiqueta: 'Edad', tipo: 'numero', unidad: 'años', obligatorio: true },
      { id: 'sexo', etiqueta: 'Sexo', tipo: 'opcion', opciones: ['Mujer', 'Hombre', 'Intersexual'], obligatorio: true },
      { id: 'nacimiento', etiqueta: 'Fecha de nacimiento', tipo: 'fecha' },
      { id: 'lugarNacimiento', etiqueta: 'Lugar de nacimiento', tipo: 'texto' },
      { id: 'residencia', etiqueta: 'Lugar de residencia', tipo: 'texto' },
      { id: 'zona', etiqueta: 'Zona', tipo: 'opcion', opciones: ['Urbana', 'Rural'] },
      { id: 'etnia', etiqueta: 'Autoidentificación étnica', tipo: 'opcion', opciones: ['Mestizo/a', 'Indígena', 'Afroecuatoriano/a', 'Montubio/a', 'Blanco/a', 'Otro'] },
      { id: 'ocupacion', corto: 'Ocupación', etiqueta: 'Ocupación (actual y anteriores)', tipo: 'texto' },
      { id: 'escolaridad', etiqueta: 'Escolaridad', tipo: 'opcion', opciones: ['Ninguna', 'Primaria', 'Secundaria', 'Superior', 'Posgrado'] },
      { id: 'estadoCivil', etiqueta: 'Estado civil', tipo: 'opcion', opciones: ['Soltero/a', 'Casado/a', 'Unión libre', 'Divorciado/a', 'Viudo/a'] },
      { id: 'religion', etiqueta: 'Religión', tipo: 'texto' },
      { id: 'seguro', etiqueta: 'Seguro', tipo: 'opcion', opciones: ['IESS', 'MSP', 'ISSFA', 'ISSPOL', 'Privado', 'Ninguno'] },
      { id: 'acompanante', corto: 'Acompañante', etiqueta: 'Acompañante y teléfono de contacto', tipo: 'texto' },
      { id: 'fuente', etiqueta: 'Fuente de la historia', tipo: 'opcion', opciones: ['Paciente', 'Familiar', 'Remisión', 'Otro'], obligatorio: true },
      { id: 'confiabilidad', etiqueta: 'Confiabilidad', tipo: 'opcion', opciones: ['Buena', 'Regular', 'Mala'] },
    ],
    guia: [
      'Nombre, cédula, edad, sexo y fecha de nacimiento.',
      'Lugar de nacimiento y de residencia (urbana o rural).',
      'Ocupación actual y anteriores (exposiciones).',
      'Escolaridad, estado civil y religión (si influye en decisiones, p. ej. transfusiones).',
      'Seguro: IESS, MSP, ISSFA, ISSPOL o privado.',
      'Acompañante y teléfono de contacto.',
      '¿Quién da la información y qué tan confiable es?',
    ],
  },
  {
    id: 'motivo',
    numero: 2,
    titulo: 'Motivo de consulta',
    descripcion: 'Una frase, en palabras del paciente, con el tiempo de evolución.',
    campos: [
      { id: 'motivo', corto: 'Motivo', etiqueta: 'Motivo (entre comillas, como lo dice el paciente)', tipo: 'texto', obligatorio: true, pregunta: '¿Qué le trae hoy por aquí?' },
      { id: 'tiempo', etiqueta: 'Tiempo de evolución', tipo: 'texto', obligatorio: true, ayuda: 'Ej.: 3 días', pregunta: '¿Desde cuándo le pasa?' },
    ],
    guia: ['«¿Qué lo trae hoy?»', '«¿Desde cuándo?»'],
  },
  {
    id: 'enfermedad',
    numero: 3,
    titulo: 'Enfermedad actual',
    descripcion: 'Relato cronológico y análisis del síntoma principal (ALICIA).',
    campos: [
      { id: 'relato', etiqueta: 'Relato cronológico', tipo: 'parrafo', obligatorio: true, pregunta: 'Cuénteme cómo empezó todo, desde el principio.' },
      { id: 'sintoma', etiqueta: 'Síntoma principal', tipo: 'texto', grupo: 'Análisis del síntoma (ALICIA)' },
      { id: 'aparicion', corto: 'Aparición', etiqueta: 'Aparición (cuándo y cómo)', tipo: 'texto', grupo: 'Análisis del síntoma (ALICIA)', pregunta: '¿Cuándo empezó y qué estaba haciendo?' },
      { id: 'localizacion', etiqueta: 'Localización', tipo: 'texto', grupo: 'Análisis del síntoma (ALICIA)', pregunta: '¿Dónde exactamente? Señálemelo con un dedo.' },
      { id: 'intensidad', etiqueta: 'Intensidad', tipo: 'numero', unidad: '/10', grupo: 'Análisis del síntoma (ALICIA)', pregunta: 'Del 0 al 10, ¿qué tan fuerte es?' },
      { id: 'caracter', corto: 'Carácter', etiqueta: 'Carácter (cómo es)', tipo: 'texto', grupo: 'Análisis del síntoma (ALICIA)', pregunta: '¿Cómo es? ¿Aprieta, punza, quema?' },
      { id: 'irradiacion', etiqueta: 'Irradiación', tipo: 'texto', grupo: 'Análisis del síntoma (ALICIA)', pregunta: '¿Se le va hacia algún otro lado?' },
      { id: 'atenuantes', corto: 'Atenuantes y agravantes', etiqueta: 'Atenuantes y agravantes', tipo: 'texto', grupo: 'Análisis del síntoma (ALICIA)', pregunta: '¿Qué lo mejora y qué lo empeora?' },
      { id: 'evolucion', corto: 'Evolución', etiqueta: 'Duración, frecuencia y evolución', tipo: 'texto', grupo: 'Análisis del síntoma (ALICIA)', pregunta: '¿Va y viene o es continuo? ¿Está mejor, igual o peor?' },
      { id: 'acompanantes', etiqueta: 'Síntomas acompañantes', tipo: 'texto', grupo: 'Análisis del síntoma (ALICIA)', pregunta: '¿Qué más ha sentido junto con esto?' },
    ],
    guia: [
      '«Cuénteme cómo empezó todo» (relato libre, sin interrumpir).',
      'ALICIA: Aparición, Localización, Intensidad (0–10), Carácter, Irradiación, Atenuantes y agravantes.',
      'Duración de cada episodio, frecuencia y evolución (mejor, igual, peor).',
      'Síntomas acompañantes.',
      '¿Le había pasado antes?',
      '¿Qué ha tomado o hecho para mejorar? ¿Consultó antes? ¿Qué le dijeron?',
      '¿Cómo afecta su vida diaria (trabajo, sueño, comer)?',
      '¿Qué cree que tiene o qué le preocupa?',
    ],
  },
  {
    id: 'personales',
    numero: 4,
    titulo: 'Antecedentes personales',
    descripcion: 'Patológicos, quirúrgicos, alérgicos, farmacológicos, gineco-obstétricos y hábitos.',
    campos: [
      { id: 'patologicos', corto: 'Otras enfermedades', etiqueta: 'Otras enfermedades o detalles', tipo: 'parrafo', grupo: 'Patológicos' },
      { id: 'hospitalizaciones', etiqueta: 'Hospitalizaciones previas', tipo: 'texto', grupo: 'Patológicos', pregunta: '¿Ha estado hospitalizado antes? ¿Por qué?' },
      { id: 'quirurgicos', corto: 'Cirugías', etiqueta: 'Cirugías (año y complicaciones)', tipo: 'texto', grupo: 'Quirúrgicos y traumáticos', pregunta: '¿Le han operado alguna vez?' },
      { id: 'traumaticos', etiqueta: 'Traumatismos', tipo: 'texto', grupo: 'Quirúrgicos y traumáticos' },
      { id: 'transfusiones', etiqueta: 'Transfusiones', tipo: 'texto', grupo: 'Quirúrgicos y traumáticos' },
      { id: 'alergicos', corto: 'Alergias', etiqueta: 'Alergias (sustancia y reacción)', tipo: 'texto', obligatorio: true, ayuda: 'Sustancia y reacción.', rapido: ['Niega alergias'], grupo: 'Alérgicos', pregunta: '¿Es alérgico a algún medicamento o alimento? ¿Qué le pasó?' },
      { id: 'farmacologicos', corto: 'Medicamentos', etiqueta: 'Medicamentos (nombre, dosis, frecuencia, desde cuándo)', tipo: 'parrafo', obligatorio: true, ayuda: 'Incluir sin receta, naturales y anticonceptivos.', rapido: ['No toma medicamentos'], grupo: 'Farmacológicos', pregunta: '¿Qué medicamentos toma, incluso naturales o sin receta?' },
      { id: 'inmunizaciones', etiqueta: 'Vacunas', tipo: 'texto', grupo: 'Inmunizaciones' },
      { id: 'fum', corto: 'FUM', etiqueta: 'Fecha de última menstruación (FUM)', tipo: 'fecha', grupo: 'Gineco-obstétricos', soloSexo: 'Mujer', pregunta: '¿Cuándo fue su última menstruación?' },
      { id: 'embarazo', corto: 'Posibilidad de embarazo', etiqueta: '¿Posibilidad de embarazo?', tipo: 'opcion', opciones: ['No', 'Sí', 'No sabe'], grupo: 'Gineco-obstétricos', soloSexo: 'Mujer' },
      { id: 'menarquia', corto: 'Menarquia', etiqueta: 'Menarquia', tipo: 'numero', unidad: 'años', grupo: 'Gineco-obstétricos', soloSexo: 'Mujer' },
      { id: 'ciclos', corto: 'Ciclos', etiqueta: 'Ciclos (regularidad, duración)', tipo: 'texto', grupo: 'Gineco-obstétricos', soloSexo: 'Mujer' },
      { id: 'gpca', corto: 'G-P-C-A', etiqueta: 'Gestas, partos, cesáreas, abortos', tipo: 'texto', ayuda: 'Ej.: G3 P2 C1 A0', grupo: 'Gineco-obstétricos', soloSexo: 'Mujer' },
      { id: 'planificacion', corto: 'Planificación', etiqueta: 'Método de planificación familiar', tipo: 'texto', rapido: ['Ninguno'], grupo: 'Gineco-obstétricos', soloSexo: 'Mujer' },
      { id: 'tamizaje', corto: 'Tamizaje', etiqueta: 'Última citología y mamografía', tipo: 'texto', grupo: 'Gineco-obstétricos', soloSexo: 'Mujer' },
      { id: 'menopausia', corto: 'Menopausia', etiqueta: 'Menopausia (edad)', tipo: 'texto', grupo: 'Gineco-obstétricos', soloSexo: 'Mujer' },
      { id: 'tabaco', etiqueta: 'Tabaco', tipo: 'texto', rapido: ['Niega', 'Exfumador'], grupo: 'Hábitos', pregunta: '¿Fuma o ha fumado?' },
      { id: 'tabacoCig', corto: 'Cigarrillos al día', etiqueta: 'Cigarrillos al día', tipo: 'numero', unidad: 'cig/día', grupo: 'Hábitos' },
      { id: 'tabacoAnios', corto: 'Años fumando', etiqueta: 'Años fumando', tipo: 'numero', unidad: 'años', grupo: 'Hábitos' },
      { id: 'alcohol', etiqueta: 'Alcohol', tipo: 'texto', ayuda: 'Cantidad y frecuencia', rapido: ['Niega', 'Ocasional'], grupo: 'Hábitos', pregunta: '¿Toma bebidas alcohólicas? ¿Cuánto y cada cuánto?' },
      { id: 'sustancias', etiqueta: 'Otras sustancias', tipo: 'texto', rapido: ['Niega'], grupo: 'Hábitos' },
      { id: 'actividad', corto: 'Actividad, alimentación y sueño', etiqueta: 'Actividad física, alimentación y sueño', tipo: 'texto', grupo: 'Hábitos' },
    ],
    guia: [
      '¿Le han diagnosticado alguna enfermedad? Preguntar una por una: hipertensión, diabetes, corazón, pulmón, riñón, hígado, tiroides, cáncer, VIH, tuberculosis, enfermedad mental.',
      'Hospitalizaciones previas: cuándo y por qué.',
      'Cirugías: cuál, año, complicaciones.',
      'Alergias: medicamentos, alimentos, látex; qué reacción tuvo.',
      'Medicamentos: nombre, dosis, frecuencia, desde cuándo (incluir sin receta y naturales).',
      'Transfusiones y traumatismos.',
      'Vacunas: esquema, influenza, neumococo, COVID-19, tétanos, hepatitis B.',
      'Gineco-obstétricos: menarquia, ciclos, FUM, gestas, partos, cesáreas, abortos, planificación, citología, mamografía, menopausia.',
      'Hábitos: tabaco (paquetes/año), alcohol, otras sustancias, humo de leña, actividad física, alimentación, sueño.',
    ],
  },
  {
    id: 'familiares',
    numero: 5,
    titulo: 'Antecedentes familiares',
    descripcion: 'Enfermedades de padres, hermanos e hijos.',
    campos: [
      { id: 'familiares', corto: 'Otros', etiqueta: 'Otros antecedentes familiares o detalles (edad, causa de muerte)', tipo: 'parrafo' },
    ],
    guia: [
      '¿Sus padres, hermanos o hijos tienen o tuvieron alguna enfermedad? ¿De qué murieron y a qué edad?',
      'Preguntar directo: hipertensión, diabetes, infarto o muerte súbita antes de los 55 (hombres) o 65 (mujeres), ACV, cáncer (cuál), enfermedad renal, tiroides, enfermedad mental.',
    ],
  },
  {
    id: 'sistemas',
    numero: 6,
    titulo: 'Revisión por sistemas',
    descripcion: 'Una pregunta corta por sistema. Lo positivo relacionado pasa a la enfermedad actual.',
    campos: [
      { id: 'general', etiqueta: 'General', tipo: 'texto', rapido: ['Niega'], ayuda: 'Fiebre, pérdida de peso, sudoración nocturna, cansancio' },
      { id: 'piel', etiqueta: 'Piel', tipo: 'texto', rapido: ['Niega'], ayuda: 'Lesiones, picazón, cambios de color' },
      { id: 'cabeza', etiqueta: 'Cabeza y órganos de los sentidos', tipo: 'texto', rapido: ['Niega'], ayuda: 'Cefalea, visión, oído, nariz, garganta' },
      { id: 'cardio', etiqueta: 'Cardiovascular', tipo: 'texto', rapido: ['Niega'], ayuda: 'Dolor en el pecho, palpitaciones, edema, ortopnea' },
      { id: 'respiratorio', etiqueta: 'Respiratorio', tipo: 'texto', rapido: ['Niega'], ayuda: 'Tos, expectoración, hemoptisis, disnea' },
      { id: 'digestivo', etiqueta: 'Digestivo', tipo: 'texto', rapido: ['Niega'], ayuda: 'Apetito, náusea, vómito, dolor, deposiciones, sangrado' },
      { id: 'genitourinario', etiqueta: 'Genitourinario', tipo: 'texto', rapido: ['Niega'], ayuda: 'Disuria, frecuencia, hematuria, secreciones' },
      { id: 'musculo', etiqueta: 'Musculoesquelético', tipo: 'texto', rapido: ['Niega'], ayuda: 'Dolor o inflamación articular, debilidad' },
      { id: 'neuro', etiqueta: 'Neurológico', tipo: 'texto', rapido: ['Niega'], ayuda: 'Mareo, síncope, convulsiones, pérdida de fuerza o sensibilidad' },
      { id: 'endocrino', etiqueta: 'Endocrino', tipo: 'texto', rapido: ['Niega'], ayuda: 'Sed, poliuria, intolerancia al frío o al calor' },
      { id: 'hemato', etiqueta: 'Hematológico', tipo: 'texto', rapido: ['Niega'], ayuda: 'Moretones, sangrados, ganglios' },
      { id: 'mental', etiqueta: 'Mental', tipo: 'texto', rapido: ['Niega'], ayuda: 'Ánimo, ansiedad, sueño, ideas de hacerse daño' },
    ],
    guia: [
      'Hacer una pregunta corta por sistema y anotar «niega» cuando sea negativo.',
      'Si algo es positivo y se relaciona con el motivo, pasarlo a la enfermedad actual.',
      'Salud mental: preguntar directo por ideas de hacerse daño.',
    ],
  },
  {
    id: 'examen',
    numero: 7,
    titulo: 'Examen físico',
    descripcion: 'Signos vitales, examen general y regional.',
    campos: [
      { id: 'pas', etiqueta: 'Presión sistólica', tipo: 'numero', unidad: 'mmHg', obligatorio: true, grupo: 'Signos vitales' },
      { id: 'pad', etiqueta: 'Presión diastólica', tipo: 'numero', unidad: 'mmHg', obligatorio: true, grupo: 'Signos vitales' },
      { id: 'fc', etiqueta: 'Frecuencia cardiaca', tipo: 'numero', unidad: 'lpm', obligatorio: true, grupo: 'Signos vitales' },
      { id: 'fr', etiqueta: 'Frecuencia respiratoria', tipo: 'numero', unidad: 'rpm', obligatorio: true, grupo: 'Signos vitales' },
      { id: 'temp', etiqueta: 'Temperatura', tipo: 'numero', unidad: '°C', obligatorio: true, grupo: 'Signos vitales' },
      { id: 'sat', etiqueta: 'Saturación de O₂', tipo: 'numero', unidad: '%', obligatorio: true, grupo: 'Signos vitales' },
      { id: 'oxigeno', etiqueta: 'Con oxígeno', tipo: 'opcion', opciones: ['Aire ambiente', 'Con oxígeno'], grupo: 'Signos vitales' },
      { id: 'glucemia', etiqueta: 'Glucometría', tipo: 'numero', unidad: 'mg/dL', grupo: 'Signos vitales' },
      { id: 'peso', etiqueta: 'Peso', tipo: 'numero', unidad: 'kg', grupo: 'Signos vitales' },
      { id: 'talla', etiqueta: 'Talla', tipo: 'numero', unidad: 'cm', grupo: 'Signos vitales' },
      { id: 'aspecto', etiqueta: 'Aspecto general', tipo: 'parrafo', ayuda: 'Conciencia, hidratación, coloración, facies, actitud, dolor aparente', grupo: 'Examen general y regional' },
      { id: 'cabezaCuello', etiqueta: 'Cabeza y cuello', tipo: 'parrafo', ayuda: 'Pupilas, mucosas, ingurgitación yugular, tiroides, ganglios', grupo: 'Examen general y regional' },
      { id: 'torax', etiqueta: 'Tórax y pulmones', tipo: 'parrafo', ayuda: 'Inspección, expansión, percusión, murmullo vesicular, ruidos agregados', grupo: 'Examen general y regional' },
      { id: 'corazon', etiqueta: 'Corazón', tipo: 'parrafo', ayuda: 'Ritmo, ruidos, soplos (foco y grado), roce', grupo: 'Examen general y regional' },
      { id: 'abdomen', etiqueta: 'Abdomen', tipo: 'parrafo', ayuda: 'Ruidos, palpación, masas, visceromegalias, irritación peritoneal, puño percusión', grupo: 'Examen general y regional' },
      { id: 'extremidades', etiqueta: 'Extremidades', tipo: 'parrafo', ayuda: 'Edema (grado), pulsos, llenado capilar, signos de trombosis', grupo: 'Examen general y regional' },
      { id: 'pielExamen', etiqueta: 'Piel', tipo: 'parrafo', ayuda: 'Lesiones, ictericia, petequias', grupo: 'Examen general y regional' },
      { id: 'neurologico', etiqueta: 'Neurológico', tipo: 'parrafo', ayuda: 'Glasgow, orientación, pares craneales, fuerza, sensibilidad, reflejos, signos meníngeos', grupo: 'Examen general y regional' },
    ],
    guia: [
      'Tomar los signos vitales completos antes del examen.',
      'Examen general: conciencia, hidratación, coloración, facies, actitud.',
      'Examen regional en orden: inspección, palpación, percusión, auscultación.',
      'Registrar hallazgos negativos relevantes, no solo los positivos.',
    ],
  },
  {
    id: 'impresion',
    numero: 8,
    titulo: 'Impresión diagnóstica',
    descripcion: 'Síndromes y diagnósticos diferenciales elegidos por el médico.',
    campos: [
      { id: 'sindromes', corto: 'Síndromes', etiqueta: 'Síndromes identificados', tipo: 'parrafo' },
      { id: 'diagnosticos', corto: 'Diagnósticos', etiqueta: 'Diagnósticos (en orden de probabilidad; presuntivo, confirmado o descartado)', tipo: 'parrafo', obligatorio: true },
      { id: 'cronicos', corto: 'Crónicos', etiqueta: 'Diagnósticos crónicos conocidos', tipo: 'parrafo' },
    ],
    guia: [
      'Agrupar los hallazgos en síndromes (p. ej. síndrome febril, síndrome de dificultad respiratoria).',
      'Ordenar los diagnósticos de más a menos probable.',
      'No olvidar los diagnósticos graves que todavía no se pueden descartar.',
      'La decisión diagnóstica es del médico; la app solo sugiere.',
      'Control de sesgos: ¿este diagnóstico explica TODOS los hallazgos?',
      'Control de sesgos: ¿qué más podría ser? ¿Puede haber dos enfermedades a la vez?',
      'Control de sesgos: si viera al paciente por primera vez, sin la impresión del triaje o de la remisión, ¿pensaría lo mismo?',
      'Control de sesgos: ¿busqué datos que contradigan mi diagnóstico principal?',
      'Control de sesgos: ¿estoy juzgando por un caso reciente o por un estereotipo del paciente?',
    ],
  },
  {
    id: 'plan',
    numero: 9,
    titulo: 'Plan',
    descripcion: 'Exámenes, manejo inicial, interconsultas y educación.',
    campos: [
      { id: 'examenes', corto: 'Exámenes', etiqueta: 'Exámenes de laboratorio e imágenes (con su motivo)', tipo: 'parrafo' },
      { id: 'manejo', corto: 'Manejo inicial', etiqueta: 'Manejo inicial (medidas generales y medicamentos: nombre, dosis, vía, frecuencia)', tipo: 'parrafo', obligatorio: true },
      { id: 'interconsultas', etiqueta: 'Interconsultas', tipo: 'texto' },
      { id: 'criterios', corto: 'Criterios de hospitalización o alta', etiqueta: 'Criterios de hospitalización o de alta', tipo: 'texto' },
      { id: 'educacion', corto: 'Educación', etiqueta: 'Educación y signos de alarma explicados al paciente', tipo: 'parrafo' },
    ],
    guia: [
      'Cada examen con su motivo.',
      'Medicamentos con nombre, dosis, vía y frecuencia.',
      '¿Necesita interconsulta u hospitalización?',
      'Explicar al paciente los signos de alarma por los que debe volver.',
      '¿El plan está justificado por la evidencia o por la necesidad de «hacer algo»? A veces observar es lo indicado.',
    ],
  },
]

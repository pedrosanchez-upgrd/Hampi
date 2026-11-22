// Antecedentes estructurados (Fase 2). Pendiente de revisión médica.
// `hallazgo`: si el antecedente está presente, alimenta ese hallazgo de los diagnósticos en vivo
// (así la historia queda conectada: lo que se dice en antecedentes cuenta en el razonamiento).

export interface Antecedente {
  id: string
  nombre: string
  grupo: string
  hallazgo?: string
  /** Texto de ayuda para el detalle (año, tratamiento, control). */
  detalle?: string
}

export const PATOLOGICOS: Antecedente[] = [
  { id: 'hta', nombre: 'Hipertensión arterial', grupo: 'Cardiovascular', detalle: 'Año, medicamentos, control' },
  { id: 'cardiopatiaIsq', nombre: 'Cardiopatía isquémica (infarto, angina)', grupo: 'Cardiovascular', hallazgo: 'cardiopatia' },
  { id: 'ic', nombre: 'Insuficiencia cardiaca', grupo: 'Cardiovascular', hallazgo: 'iccPrevia', detalle: 'Fracción de eyección si se conoce' },
  { id: 'fa', nombre: 'Fibrilación o flutter auricular', grupo: 'Cardiovascular', hallazgo: 'fibrilacion', detalle: 'Anticoagulación' },
  { id: 'valvulopatia', nombre: 'Valvulopatía o cardiopatía estructural', grupo: 'Cardiovascular', hallazgo: 'cardiopatia' },
  { id: 'tvp', nombre: 'Trombosis venosa o embolia pulmonar', grupo: 'Cardiovascular', hallazgo: 'tvpPrevia' },
  { id: 'acv', nombre: 'Accidente cerebrovascular', grupo: 'Neurológico', detalle: 'Secuelas' },
  { id: 'epilepsia', nombre: 'Epilepsia', grupo: 'Neurológico' },
  { id: 'dm', nombre: 'Diabetes', grupo: 'Metabólico', detalle: 'Tipo, años, insulina, última HbA1c' },
  { id: 'dislipidemia', nombre: 'Dislipidemia', grupo: 'Metabólico' },
  { id: 'obesidad', nombre: 'Obesidad', grupo: 'Metabólico' },
  { id: 'tiroides', nombre: 'Enfermedad de tiroides', grupo: 'Metabólico', detalle: 'Hipo o hipertiroidismo, tratamiento' },
  { id: 'epoc', nombre: 'EPOC', grupo: 'Respiratorio' },
  { id: 'asma', nombre: 'Asma', grupo: 'Respiratorio' },
  { id: 'tb', nombre: 'Tuberculosis', grupo: 'Infeccioso', detalle: 'Año y tratamiento completo' },
  { id: 'vih', nombre: 'VIH', grupo: 'Infeccioso', detalle: 'CD4, carga viral, tratamiento' },
  { id: 'hepatitis', nombre: 'Hepatitis viral', grupo: 'Infeccioso' },
  { id: 'erc', nombre: 'Enfermedad renal crónica', grupo: 'Renal y digestivo', detalle: 'Estadio, diálisis' },
  { id: 'cirrosis', nombre: 'Cirrosis o hepatopatía crónica', grupo: 'Renal y digestivo' },
  { id: 'ulcera', nombre: 'Úlcera péptica o sangrado digestivo', grupo: 'Renal y digestivo' },
  { id: 'cancer', nombre: 'Cáncer', grupo: 'Otros', hallazgo: 'cancer', detalle: 'Tipo, año, tratamiento, si está activo' },
  { id: 'autoinmune', nombre: 'Enfermedad autoinmune', grupo: 'Otros', detalle: 'Lupus, artritis reumatoide…' },
  { id: 'anemia', nombre: 'Anemia', grupo: 'Otros' },
  { id: 'mental', nombre: 'Depresión, ansiedad u otra enfermedad mental', grupo: 'Otros' },
]

export const FAMILIARES: Antecedente[] = [
  { id: 'hta', nombre: 'Hipertensión arterial', grupo: 'Cardiovascular y metabólico' },
  { id: 'dm', nombre: 'Diabetes', grupo: 'Cardiovascular y metabólico' },
  { id: 'cardioPrecoz', nombre: 'Infarto o muerte súbita precoz (hombre < 55, mujer < 65 años)', grupo: 'Cardiovascular y metabólico' },
  { id: 'acv', nombre: 'Accidente cerebrovascular', grupo: 'Cardiovascular y metabólico' },
  { id: 'dislipidemia', nombre: 'Dislipidemia', grupo: 'Cardiovascular y metabólico' },
  { id: 'cancerMama', nombre: 'Cáncer de mama u ovario', grupo: 'Oncológico' },
  { id: 'cancerColon', nombre: 'Cáncer de colon', grupo: 'Oncológico' },
  { id: 'cancerGastrico', nombre: 'Cáncer gástrico', grupo: 'Oncológico' },
  { id: 'cancerProstata', nombre: 'Cáncer de próstata', grupo: 'Oncológico' },
  { id: 'cancerOtro', nombre: 'Otro cáncer', grupo: 'Oncológico' },
  { id: 'erc', nombre: 'Enfermedad renal', grupo: 'Otros' },
  { id: 'tiroides', nombre: 'Enfermedad de tiroides', grupo: 'Otros' },
  { id: 'mental', nombre: 'Enfermedad mental o suicidio', grupo: 'Otros' },
  { id: 'hereditaria', nombre: 'Enfermedad hereditaria (hemofilia, anemia falciforme, otras)', grupo: 'Otros' },
  { id: 'tb', nombre: 'Tuberculosis en convivientes', grupo: 'Otros' },
]

export const PARENTESCOS = ['Padre', 'Madre', 'Hermanos', 'Hijos', 'Abuelos', 'Tíos']

/** Factores epidemiológicos de Ecuador que cambian el diagnóstico. */
export const EPIDEMIOLOGICOS: Antecedente[] = [
  { id: 'viaje', nombre: 'Viaje o residencia reciente en la Costa o la Amazonía', grupo: 'Epidemiológicos', hallazgo: 'viajeEndemico', detalle: 'Lugar y fecha' },
  { id: 'contactoTb', nombre: 'Contacto con persona con tuberculosis', grupo: 'Epidemiológicos' },
  { id: 'animales', nombre: 'Contacto con animales (perros, gatos, ganado, roedores)', grupo: 'Epidemiológicos' },
  { id: 'agua', nombre: 'Agua no potable o alimentos de riesgo', grupo: 'Epidemiológicos' },
  { id: 'chagas', nombre: 'Origen o vivienda en zona de Chagas (Loja, El Oro, Manabí)', grupo: 'Epidemiológicos' },
  { id: 'humoLena', nombre: 'Exposición a humo de leña o biomasa', grupo: 'Epidemiológicos' },
]

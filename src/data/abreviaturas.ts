// Abreviaturas frecuentes en historias clínicas de Ecuador. La historia final se escribe
// completa: abreviar puede confundir (p. ej. «IC» = insuficiencia cardiaca o interconsulta).
// Solo se proponen las que tienen un único significado habitual (por eso no están IV, IM, AP). Pendiente de revisión médica.

export const ABREVIATURAS: Record<string, string> = {
  hta: 'hipertensión arterial',
  dm: 'diabetes mellitus',
  dm2: 'diabetes mellitus tipo 2',
  dm1: 'diabetes mellitus tipo 1',
  epoc: 'enfermedad pulmonar obstructiva crónica',
  erc: 'enfermedad renal crónica',
  iam: 'infarto agudo de miocardio',
  acv: 'accidente cerebrovascular',
  tep: 'tromboembolia pulmonar',
  tvp: 'trombosis venosa profunda',
  icc: 'insuficiencia cardiaca congestiva',
  fa: 'fibrilación auricular',
  itu: 'infección de vías urinarias',
  hda: 'hemorragia digestiva alta',
  hdb: 'hemorragia digestiva baja',
  tb: 'tuberculosis',
  vih: 'virus de la inmunodeficiencia humana',
  aine: 'antiinflamatorio no esteroideo',
  aines: 'antiinflamatorios no esteroideos',
  mv: 'murmullo vesicular',
  rha: 'ruidos hidroaéreos',
  rscs: 'ruidos cardiacos',
  rcr: 'ruidos cardiacos rítmicos',
  sv: 'signos vitales',
  lpm: 'latidos por minuto',
  rpm: 'respiraciones por minuto',
  vo: 'vía oral',
  sc: 'vía subcutánea',
  qd: 'una vez al día',
  bid: 'dos veces al día',
  tid: 'tres veces al día',
  prn: 'si es necesario',
  hc: 'historia clínica',
}

export interface Abreviatura { abrev: string; completo: string }

/** Abreviaturas encontradas en el texto (palabras completas, sin distinguir mayúsculas). */
export function abreviaturasEn(texto: string): Abreviatura[] {
  const vistos = new Set<string>()
  const out: Abreviatura[] = []
  for (const m of texto.matchAll(/[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]+/g)) {
    const k = m[0].toLowerCase()
    if (ABREVIATURAS[k] && !vistos.has(k) && m[0].length >= 2 && m[0] === m[0].toUpperCase()) {
      vistos.add(k)
      out.push({ abrev: m[0], completo: ABREVIATURAS[k] })
    }
  }
  return out
}

/** Reemplaza las abreviaturas por su forma completa. */
export function escribirCompleto(texto: string): string {
  return texto.replace(/[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]+/g, (w) =>
    w.length >= 2 && w === w.toUpperCase() && ABREVIATURAS[w.toLowerCase()] ? ABREVIATURAS[w.toLowerCase()] : w)
}

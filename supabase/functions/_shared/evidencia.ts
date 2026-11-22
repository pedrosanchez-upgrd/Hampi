// Lectura de las fuentes de evidencia y filtro de calidad de la revista.
// Sin dependencias de Deno ni de Node: lo usan la función «buscar-evidencia» y las pruebas.
// Formatos tomados de respuestas reales (ver ./ejemplos).

export type Base = 'pubmed' | 'scielo' | 'elsevier'
export type Calidad = 'Q1' | 'Q2' | 'A1' | 'A2' | 'Latindex'

export interface Articulo {
  base: Base
  identificador: string
  doi?: string
  titulo: string
  autores: string
  revista: string
  issn: string[]
  anio?: number
  resumen?: string
  url: string
  idioma?: string
}

export interface Revista {
  issn: string
  scimago_cuartil?: string | null
  latindex_catalogo?: boolean | null
  publindex?: string | null
}

const ENTIDADES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
export const decodificar = (t: string) =>
  t.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
    return ENTIDADES[e.toLowerCase()] ?? m
  })
const sinEtiquetas = (t: string) => decodificar(t.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
const etiqueta = (xml: string, nombre: string) => {
  const m = xml.match(new RegExp(`<${nombre}(?:\\s[^>]*)?>([\\s\\S]*?)</${nombre}>`))
  return m ? sinEtiquetas(m[1]) : ''
}
const todas = (xml: string, nombre: string) =>
  [...xml.matchAll(new RegExp(`<${nombre}(?:\\s[^>]*)?>([\\s\\S]*?)</${nombre}>`, 'g'))].map((m) => m[0])

/** «07400020» o «0740-0020» → «0740-0020». */
export function normalizarIssn(v?: string | null): string | null {
  const s = (v ?? '').replace(/[^0-9xX]/g, '').toUpperCase()
  return /^[0-9]{7}[0-9X]$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4)}` : null
}

/** efetch de PubMed (retmode=xml). */
export function leerPubmed(xml: string): Articulo[] {
  return todas(xml, 'PubmedArticle').map((a) => {
    const pmid = etiqueta(a, 'PMID')
    const resumen = todas(a, 'AbstractText').map((t) => {
      const label = t.match(/Label="([^"]+)"/)?.[1]
      const texto = sinEtiquetas(t)
      return label ? `${label}: ${texto}` : texto
    }).join(' ')
    const autores = todas(a, 'Author').map((x) => [etiqueta(x, 'LastName'), etiqueta(x, 'Initials')].filter(Boolean).join(' ')).filter(Boolean)
    const issn = [...new Set([...todas(a, 'ISSN').map(sinEtiquetas), etiqueta(a, 'ISSNLinking')].map(normalizarIssn).filter((x): x is string => !!x))]
    const doi = a.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/)?.[1] ?? a.match(/<ELocationID EIdType="doi"[^>]*>([^<]+)</)?.[1]
    const fecha = a.match(/<PubDate>([\s\S]*?)<\/PubDate>/)?.[1] ?? ''
    const anio = Number(etiqueta(fecha, 'Year')) || Number(etiqueta(fecha, 'MedlineDate').slice(0, 4)) || undefined
    return {
      base: 'pubmed' as const, identificador: pmid, doi, titulo: etiqueta(a, 'ArticleTitle'),
      autores: autores.length > 3 ? `${autores.slice(0, 3).join(', ')} y col.` : autores.join(', '),
      revista: etiqueta(a, 'Title'), issn, anio, resumen: resumen || undefined,
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, idioma: etiqueta(a, 'Language') || undefined,
    }
  })
}

/** Buscador de SciELO (output=rss). El código del artículo (PID) trae el ISSN y el año. */
export function leerScielo(rss: string): Articulo[] {
  const out: Articulo[] = []
  for (const it of todas(rss, 'item')) {
    const url = etiqueta(it, 'link')
    const pid = url.match(/\/(S[0-9]{4}-[0-9]{3}[0-9X][0-9]{4}[0-9]+)(?:-([a-z]+))?/)?.[1]
    if (!pid) continue
    const desc = etiqueta(it, 'description')
    const es = desc.match(/Resumen en español\s*(?:Resumen)?\s*([\s\S]*?)(?:Resumen en (?:inglés|portugués)|$)/)?.[1]?.trim()
    const en = desc.match(/Resumen en inglés\s*(?:Abstract)?\s*([\s\S]*?)(?:Resumen en|$)/)?.[1]?.trim()
    out.push({
      base: 'scielo', identificador: pid, titulo: etiqueta(it, 'title').split(' / ')[0].trim(),
      autores: etiqueta(it, 'author').split(';').map((x) => x.trim()).slice(0, 3).join('; ') + (etiqueta(it, 'author').split(';').length > 3 ? ' y col.' : ''),
      revista: '', issn: [normalizarIssn(pid.slice(1, 10))!], anio: Number(pid.slice(10, 14)) || undefined,
      resumen: es || en || undefined, url, idioma: es ? 'spa' : en ? 'eng' : undefined,
    })
  }
  return out
}

/** Scopus Search API de Elsevier (JSON). El resumen solo viene con acceso institucional (view=COMPLETE). */
export function leerElsevier(json: unknown): Articulo[] {
  const entradas = ((json as { 'search-results'?: { entry?: Record<string, unknown>[] } })?.['search-results']?.entry) ?? []
  return entradas.filter((e) => e['dc:identifier']).map((e) => {
    const link = (e.link as { '@ref': string; '@href': string }[] | undefined)?.find((l) => l['@ref'] === 'scopus')?.['@href']
    const doi = e['prism:doi'] as string | undefined
    return {
      base: 'elsevier' as const, identificador: String(e['dc:identifier']).replace('SCOPUS_ID:', ''), doi,
      titulo: String(e['dc:title'] ?? ''), autores: String(e['dc:creator'] ?? ''),
      revista: String(e['prism:publicationName'] ?? ''),
      issn: [normalizarIssn(e['prism:issn'] as string), normalizarIssn(e['prism:eIssn'] as string)].filter((x): x is string => !!x),
      anio: Number(String(e['prism:coverDate'] ?? '').slice(0, 4)) || undefined,
      resumen: (e['dc:description'] as string | undefined) || undefined,
      url: doi ? `https://doi.org/${doi}` : link ?? String(e['prism:url'] ?? ''),
    }
  })
}

/**
 * Calidad de la revista: la mejor que tenga entre sus ISSN.
 * Pasa el filtro si es Q1 o Q2 (Scimago), A1 o A2 (Publindex) o está en el catálogo Latindex.
 */
export function calidad(issns: string[], revistas: Map<string, Revista>): Calidad | null {
  const orden: Calidad[] = ['Q1', 'Q2', 'A1', 'A2', 'Latindex']
  let mejor: Calidad | null = null
  for (const i of issns) {
    const r = revistas.get(i)
    if (!r) continue
    const c: Calidad[] = []
    if (r.scimago_cuartil === 'Q1' || r.scimago_cuartil === 'Q2') c.push(r.scimago_cuartil)
    if (r.publindex === 'A1' || r.publindex === 'A2') c.push(r.publindex)
    if (r.latindex_catalogo) c.push('Latindex')
    for (const x of c) if (mejor === null || orden.indexOf(x) < orden.indexOf(mejor)) mejor = x
  }
  return mejor
}

/** Qué buscar para cada diagnóstico: en inglés (PubMed, Elsevier) y en español (SciELO). */
export const CONSULTAS: Record<string, { en: string; es: string }> = {
  sca: { en: 'acute coronary syndrome chest pain', es: 'síndrome coronario agudo dolor torácico' },
  diseccion: { en: 'acute aortic dissection', es: 'disección aórtica' },
  tep: { en: 'pulmonary embolism', es: 'tromboembolia pulmonar' },
  pericarditis: { en: 'acute pericarditis', es: 'pericarditis aguda' },
  icc: { en: 'heart failure dyspnea emergency', es: 'insuficiencia cardiaca disnea' },
  neumonia: { en: 'community-acquired pneumonia', es: 'neumonía adquirida en la comunidad' },
  meningitis: { en: 'meningitis adults', es: 'meningitis adultos' },
  dengueAlarma: { en: 'dengue warning signs severe dengue', es: 'dengue signos de alarma' },
  itu: { en: 'urinary tract infection women', es: 'infección urinaria' },
  apendicitis: { en: 'acute appendicitis', es: 'apendicitis aguda' },
  colecistitis: { en: 'acute cholecystitis', es: 'colecistitis aguda' },
  hsa: { en: 'subarachnoid hemorrhage headache', es: 'hemorragia subaracnoidea cefalea' },
  migrana: { en: 'migraine', es: 'migraña' },
  lesionIntracraneal: { en: 'headache intracranial lesion neuroimaging', es: 'cefalea neuroimagen' },
  acv: { en: 'stroke prehospital recognition', es: 'accidente cerebrovascular' },
  ectopico: { en: 'ectopic pregnancy', es: 'embarazo ectópico' },
  sangradoAlto: { en: 'upper gastrointestinal bleeding', es: 'hemorragia digestiva alta' },
  bacteriemia: { en: 'bacteremia', es: 'bacteriemia' },
  hipovolemia: { en: 'hypovolemia physical examination', es: 'hipovolemia deshidratación adultos' },
  sincopeCardiaco: { en: 'syncope cardiac cause', es: 'síncope' },
  tvp: { en: 'deep vein thrombosis', es: 'trombosis venosa profunda' },
}

/** Filtro de exactitud diagnóstica para PubMed (lo que sirve para el motor: sensibilidad, especificidad, LR). */
export const consultaPubmed = (termino: string) =>
  `(${termino}) AND (likelihood ratio OR "sensitivity and specificity"[MeSH Terms] OR "diagnostic accuracy")`

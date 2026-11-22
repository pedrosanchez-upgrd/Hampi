// Supabase Edge Function «buscar-evidencia» (Fase 3): busca artículos en PubMed, SciELO y Elsevier,
// deja solo los de revistas Q1/Q2 (Scimago), A1/A2 (Publindex) o del catálogo Latindex, y los guarda
// como «pendiente» para revisión médica. NADA de lo que guarda se usa en los diagnósticos hasta que
// dos revisores aprueben una regla (ver migración 20261123_01_evidencia.sql).
//
// ESTADO: escrita y probada en sus partes (supabase/test/fuentes.test.ts); NO desplegada.
// Para activarla hace falta autorización del dueño. Secretos (en Supabase, nunca en el repositorio):
//   ELSEVIER_API_KEY  (opcional; clave de dev.elsevier.com — sin ella se busca solo en PubMed y SciELO)
//   NCBI_API_KEY      (opcional; sube el límite de PubMed de 3 a 10 consultas por segundo)
// Quién puede llamarla: un revisor con sesión, o la tarea programada con la clave de servicio.
// Body: { "diagnostico": "tep" } o { "todos": true } (para la actualización semanal).

import { createClient } from 'npm:@supabase/supabase-js@2'
import { type Articulo, calidad, CONSULTAS, consultaPubmed, leerElsevier, leerPubmed, leerScielo, type Revista } from '../_shared/evidencia.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
}
const POR_FUENTE = 10

async function pubmed(termino: string): Promise<Articulo[]> {
  const clave = Deno.env.get('NCBI_API_KEY') ? `&api_key=${Deno.env.get('NCBI_API_KEY')}` : ''
  const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
  const b = await fetch(`${base}/esearch.fcgi?db=pubmed&retmode=json&sort=relevance&retmax=${POR_FUENTE}&term=${encodeURIComponent(consultaPubmed(termino))}${clave}&tool=hampi`)
  if (!b.ok) throw new Error(`respondió ${b.status}`)
  const ids: string[] = (await b.json())?.esearchresult?.idlist ?? []
  if (!ids.length) return []
  const r = await fetch(`${base}/efetch.fcgi?db=pubmed&retmode=xml&id=${ids.join(',')}${clave}&tool=hampi`)
  if (!r.ok) throw new Error(`respondió ${r.status}`)
  return leerPubmed(await r.text())
}

async function scielo(termino: string): Promise<Articulo[]> {
  const r = await fetch(`https://search.scielo.org/?q=${encodeURIComponent(termino)}&lang=es&count=${POR_FUENTE}&from=0&output=rss`)
  if (!r.ok) throw new Error(`respondió ${r.status}`)
  const texto = await r.text()
  if (!texto.includes('<rss')) throw new Error('no devolvió RSS (¿cambió el formato?)')
  return leerScielo(texto)
}

async function elsevier(termino: string): Promise<Articulo[]> {
  const clave = Deno.env.get('ELSEVIER_API_KEY')
  if (!clave) return []
  const q = `TITLE-ABS-KEY(${termino}) AND TITLE-ABS-KEY("likelihood ratio" OR "diagnostic accuracy" OR "sensitivity and specificity")`
  const r = await fetch(`https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(q)}&count=${POR_FUENTE}&sort=relevancy`, {
    headers: { 'X-ELS-APIKey': clave, Accept: 'application/json' },
  })
  if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? 'la clave no es válida o no tiene permiso' : `respondió ${r.status}`)
  return leerElsevier(await r.json())
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  const json = (cuerpo: unknown, status = 200) =>
    new Response(JSON.stringify(cuerpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

  const url = Deno.env.get('SUPABASE_URL')!
  const servicio = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const auth = req.headers.get('Authorization') ?? ''
  const esServicio = auth === `Bearer ${servicio}`
  if (!esServicio) {
    // Con sesión: solo revisores.
    const usuario = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } })
    const { data: ok } = await usuario.rpc('es_revisor')
    if (ok !== true) return json({ error: 'Solo los revisores médicos pueden buscar evidencia nueva.' }, 403)
  }

  const cuerpo = await req.json().catch(() => ({}))
  const ids: string[] = cuerpo.todos ? Object.keys(CONSULTAS) : [cuerpo.diagnostico].filter((x) => CONSULTAS[x])
  if (!ids.length) return json({ error: 'Indique un diagnóstico conocido o «todos».' }, 400)

  const admin = createClient(url, servicio) // escribe la evidencia (la app no puede)
  const resumen: Record<string, { encontrados: number; aceptados: number; sinCalidad: number; errores: string[] }> = {}

  for (const id of ids) {
    const c = CONSULTAS[id]
    const errores: string[] = []
    const lotes = await Promise.allSettled([pubmed(c.en), scielo(c.es), elsevier(c.en)])
    const articulos = lotes.flatMap((l, i) => {
      if (l.status === 'fulfilled') return l.value
      errores.push(`${['PubMed', 'SciELO', 'Elsevier'][i]}: ${String(l.reason).slice(0, 120)}`)
      return []
    })
    const issns = [...new Set(articulos.flatMap((a) => a.issn))]
    const { data: filas } = issns.length ? await admin.from('revistas').select('issn, nombre, scimago_cuartil, latindex_catalogo, publindex').in('issn', issns) : { data: [] }
    const revistas = new Map<string, Revista & { nombre?: string }>((filas ?? []).map((r: Revista & { nombre?: string }) => [r.issn, r]))
    // SciELO no da el nombre de la revista: se toma de la tabla de revistas.
    for (const a of articulos) if (!a.revista) a.revista = a.issn.map((i) => revistas.get(i)?.nombre).find(Boolean) ?? ''
    const aceptados = articulos.map((a) => ({ a, q: calidad(a.issn, revistas) })).filter((x) => x.q)
    if (aceptados.length) {
      const { error } = await admin.from('evidencia').upsert(aceptados.map(({ a, q }) => ({
        base: a.base, identificador: a.identificador, doi: a.doi ?? null, titulo: a.titulo, autores: a.autores,
        revista: a.revista || null, issn: a.issn[0] ?? null, anio: a.anio ?? null, resumen: a.resumen ?? null,
        url: a.url, idioma: a.idioma ?? null, consulta: id, calidad: q,
      })), { onConflict: 'base,identificador', ignoreDuplicates: true })
      if (error) errores.push(`Guardar: ${error.message}`)
    }
    resumen[id] = { encontrados: articulos.length, aceptados: aceptados.length, sinCalidad: articulos.length - aceptados.length, errores }
    await new Promise((r) => setTimeout(r, 400)) // respetar el límite de PubMed
  }
  return json({ resumen })
})

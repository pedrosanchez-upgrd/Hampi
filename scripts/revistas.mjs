// Arma el SQL para cargar la calidad de las revistas en la tabla «revistas».
// Uso (en una computadora con internet, con los archivos descargados de cada sitio):
//   node scripts/revistas.mjs --scimago scimagojr.csv --latindex latindex.csv --publindex publindex.csv > revistas.sql
// Luego un administrador ejecuta revistas.sql en Supabase (SQL Editor). No toca otras tablas.
// Las columnas se reconocen por su nombre (ISSN, título, cuartil o categoría): revisar con los
// archivos reales la primera vez, porque cada sitio puede cambiar sus encabezados.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export function leerCsv(texto) {
  const linea0 = texto.split(/\r?\n/)[0]
  const sep = (linea0.match(/;/g) ?? []).length > (linea0.match(/,/g) ?? []).length ? ';' : ','
  const filas = []; let fila = [], campo = '', comillas = false
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i]
    if (comillas) {
      if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++ } else if (ch === '"') comillas = false; else campo += ch
    } else if (ch === '"') comillas = true
    else if (ch === sep) { fila.push(campo); campo = '' }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && texto[i + 1] === '\n') i++; fila.push(campo); filas.push(fila); fila = []; campo = '' }
    else campo += ch
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila) }
  const [cab, ...resto] = filas.filter((f) => f.some((c) => c.trim()))
  return resto.map((f) => Object.fromEntries(cab.map((c, i) => [c.trim(), (f[i] ?? '').trim()])))
}

const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const col = (fila, ...claves) => Object.keys(fila).filter((k) => claves.some((c) => sinTildes(k).includes(c)))
export const issnDe = (v) => {
  const s = (v ?? '').replace(/[^0-9xX]/g, '').toUpperCase()
  return /^[0-9]{7}[0-9X]$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4)}` : null
}
// «15424863, 00079235» → dos ISSN.
const issns = (fila) => col(fila, 'issn').flatMap((k) => fila[k].split(/[,;\s]+/).map(issnDe)).filter(Boolean)
const titulo = (fila) => fila[col(fila, 'title', 'titulo', 'nombre', 'revista')[0]] ?? ''

/** Une las tres listas por ISSN. */
export function unir({ scimago = [], latindex = [], publindex = [] }, anioScimago = null) {
  const m = new Map()
  const tomar = (issn, nombre) => { if (!m.has(issn)) m.set(issn, { issn, nombre, scimago_cuartil: null, latindex_catalogo: false, publindex: null }); return m.get(issn) }
  for (const f of scimago) {
    const q = (f[col(f, 'quartile', 'cuartil')[0]] ?? '').toUpperCase()
    for (const i of issns(f)) { const r = tomar(i, titulo(f)); if (/^Q[1-4]$/.test(q)) r.scimago_cuartil = q }
  }
  for (const f of latindex) for (const i of issns(f)) tomar(i, titulo(f)).latindex_catalogo = true
  for (const f of publindex) {
    const c = (f[col(f, 'categ', 'clasif')[0]] ?? '').toUpperCase().replace(/\s/g, '')
    for (const i of issns(f)) { const r = tomar(i, titulo(f)); if (['A1', 'A2', 'B', 'C'].includes(c)) r.publindex = c }
  }
  return [...m.values()].map((r) => ({ ...r, scimago_anio: r.scimago_cuartil ? anioScimago : null }))
}

const lit = (v) => (v === null || v === undefined ? 'null' : typeof v === 'boolean' || typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`)
export function sql(revistas) {
  const filas = revistas.map((r) => `(${[r.issn, r.nombre || r.issn, r.scimago_cuartil, r.scimago_anio, r.latindex_catalogo, r.publindex].map(lit).join(', ')})`)
  return `insert into public.revistas (issn, nombre, scimago_cuartil, scimago_anio, latindex_catalogo, publindex) values\n${filas.join(',\n')}\n` +
    `on conflict (issn) do update set nombre = excluded.nombre, scimago_cuartil = excluded.scimago_cuartil, scimago_anio = excluded.scimago_anio,\n` +
    `  latindex_catalogo = excluded.latindex_catalogo, publindex = excluded.publindex, actualizada_en = now();\n`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : null }
  const leer = (n) => (arg(n) ? leerCsv(readFileSync(arg(n), 'utf8')) : [])
  const r = unir({ scimago: leer('scimago'), latindex: leer('latindex'), publindex: leer('publindex') }, Number(arg('anio')) || null)
  process.stdout.write(sql(r))
  console.error(`${r.length} revistas`)
}

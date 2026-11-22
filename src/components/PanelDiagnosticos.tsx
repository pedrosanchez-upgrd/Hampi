import { useState } from 'react'
import { diagnosticosEnVivo, formatoFactor, type Resultado } from '../lib/motor'
import type { Historia } from '../lib/historia'

interface Props {
  historia: Historia
  setHistoria: (f: (h: Historia) => Historia) => void
}

function alternarDescartado(h: Historia, id: string): Historia {
  const lista = (h.diagnosticosVivo?.descartados ?? '').split(',').filter(Boolean)
  const nueva = lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]
  return { ...h, diagnosticosVivo: { ...h.diagnosticosVivo, descartados: nueva.join(',') } }
}

function agregarADiagnosticos(h: Historia, nombre: string): Historia {
  const actual = (h.impresion?.diagnosticos ?? '').trim()
  if (actual.toLowerCase().includes(nombre.toLowerCase())) return h
  const linea = `${nombre} (presuntivo)`
  return { ...h, impresion: { ...h.impresion, diagnosticos: actual ? `${actual}\n${linea}` : linea } }
}

function Tarjeta({ r, historia, setHistoria }: { r: Resultado } & Props) {
  const [abierta, setAbierta] = useState(false)
  const yaAgregado = (historia.impresion?.diagnosticos ?? '').toLowerCase().includes(r.nombre.toLowerCase())
  const ancho = Math.max(4, Math.min(100, 50 + Math.log10(r.factor) * 35))
  return (
    <li className={`rounded-lg border p-3 ${r.descartado ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`font-medium ${r.descartado ? 'line-through' : ''}`}>{r.nombre}</p>
          {r.grave && !r.descartado && (
            <span className="mt-0.5 inline-block rounded bg-red-50 px-1.5 text-xs font-medium text-alarma">No te lo pierdas</span>
          )}
        </div>
        <span className="shrink-0 text-sm tabular-nums text-slate-600" title="Razón de verosimilitud combinada de los hallazgos registrados">
          {r.razones.length ? formatoFactor(r.factor) : 'sin datos'}
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded bg-slate-100" aria-hidden>
        <div className={`h-1.5 rounded ${r.factor >= 1 ? 'bg-marca' : 'bg-slate-400'}`} style={{ width: `${ancho}%` }} />
      </div>

      {r.razones.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-sm">
          {r.razones.map((x, i) => (
            <li key={i} className={x.factor > 1 ? 'text-teal-800' : 'text-slate-600'}>
              {x.factor > 1 ? '↑' : '↓'} {x.presente ? '' : 'Sin: '}{x.texto.charAt(0).toLowerCase() + x.texto.slice(1)}{' '}
              <span className="text-xs text-slate-500">
                ({x.tipo === 'lr' ? `LR ${String(x.factor).replace('.', ',')}` : 'cualitativo'})
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <button className="text-marca underline" onClick={() => setAbierta(!abierta)}>
          {abierta ? 'Ocultar fuentes' : 'Ver fuentes'}
        </button>
        {!r.descartado && (
          <button className="text-marca underline disabled:text-slate-400 disabled:no-underline" disabled={yaAgregado}
            onClick={() => setHistoria((h) => agregarADiagnosticos(h, r.nombre))}>
            {yaAgregado ? 'Ya está en mis diagnósticos' : 'Agregar a mis diagnósticos'}
          </button>
        )}
        <button className="text-slate-500 underline" onClick={() => setHistoria((h) => alternarDescartado(h, r.id))}>
          {r.descartado ? 'Volver a considerar' : 'Descartado'}
        </button>
      </div>

      {abierta && (
        <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-xs text-slate-600">
          {r.nota && <p>{r.nota}</p>}
          {r.razones.filter((x) => x.nota).map((x, i) => <p key={i}>{x.texto}: {x.nota}</p>)}
          {r.fuentes.map((f) => (
            <p key={f.id}>
              {f.cita}. «{f.titulo}». {' '}
              <a className="text-marca underline" href={`https://pubmed.ncbi.nlm.nih.gov/${f.pmid}/`} target="_blank" rel="noreferrer">PMID {f.pmid}</a>
              {f.doi && <> · <a className="text-marca underline" href={`https://doi.org/${f.doi}`} target="_blank" rel="noreferrer">DOI</a></>}
            </p>
          ))}
        </div>
      )}
    </li>
  )
}

export function ListaDiagnosticos({ historia, setHistoria }: Props) {
  const r = diagnosticosEnVivo(historia)
  return (
    <div>
      <p className="text-xs text-slate-500">
        Ayuda, no diagnóstico. El orden se basa en los hallazgos que registró y en estudios citados;
        el número es una razón de verosimilitud combinada, no una probabilidad. Contenido pendiente de revisión médica.
      </p>
      {r.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          Aparecerán cuando se abra una pestaña de síntoma con diagnósticos cargados (por ahora: dolor torácico, disnea, fiebre, tos,
          dolor abdominal, cefalea, síncope, síntomas urinarios, edema y confusión).
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {r.map((x) => <Tarjeta key={x.id} r={x} historia={historia} setHistoria={setHistoria} />)}
        </ul>
      )}
    </div>
  )
}

/** Botón flotante que abre la lista desde cualquier apartado. */
export function PanelDiagnosticos(props: Props) {
  const [abierto, setAbierto] = useState(false)
  const r = diagnosticosEnVivo(props.historia).filter((x) => !x.descartado)
  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="no-imprimir fixed bottom-4 right-4 z-20 rounded-full bg-marca px-4 py-3 font-medium text-white shadow-lg hover:bg-marca-oscuro"
      >
        Diagnósticos en vivo{r.length ? ` (${r.length})` : ''}
      </button>
      {abierto && (
        <div className="no-imprimir fixed inset-0 z-30 flex justify-end bg-black/30" onClick={() => setAbierto(false)}>
          <aside
            role="dialog"
            aria-label="Diagnósticos en vivo"
            className="h-full w-full max-w-md overflow-y-auto bg-slate-50 p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Diagnósticos en vivo</h2>
              <button className="rounded-lg border border-slate-300 px-3 py-1 text-sm" onClick={() => setAbierto(false)}>Cerrar</button>
            </div>
            <ListaDiagnosticos {...props} />
          </aside>
        </div>
      )}
    </>
  )
}

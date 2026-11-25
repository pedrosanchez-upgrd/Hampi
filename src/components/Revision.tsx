import { useEffect, useState } from 'react'
import { DIAGNOSTICOS, HALLAZGOS } from '../data/conocimiento'
import {
  buscarEvidencia, confirmarRegla, listarEvidencia, listarReglas, proponerRegla, revisarEvidencia, validarRegla,
  type Evidencia, type ReglaGuardada, type ReglaPropuesta,
} from '../lib/evidenciaNube'
import { mensajeError } from '../lib/nube'
import { Icono } from './Icono'

interface Props { abierto: boolean; usuarioId: string; onCerrar: () => void; onCambio: () => void }

const BASE: Record<Evidencia['base'], string> = { pubmed: 'PubMed', scielo: 'SciELO', elsevier: 'Elsevier' }
const nombreDx = (id: string) => DIAGNOSTICOS.find((d) => d.id === id)?.nombre ?? id
const textoHz = (id: string) => HALLAZGOS.find((h) => h.id === id)?.texto ?? id
const n = (v: string) => (v.trim() === '' ? null : Number(v.replace(',', '.')))

function Articulo({ e, children }: { e: Evidencia; children?: React.ReactNode }) {
  const [verTodo, setVerTodo] = useState(false)
  return (
    <li className="rounded-xl border border-line bg-surface p-3">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-ink-soft">{BASE[e.base]}</span>
        <span className="rounded-full bg-ok-soft px-2 py-0.5 text-ok">{e.calidad === 'Latindex' ? 'Catálogo Latindex' : e.calidad}</span>
        <span className="text-ink-faint">Búsqueda: {nombreDx(e.consulta)}</span>
      </div>
      <p className="mt-1.5 font-semibold leading-snug text-ink">{e.titulo}</p>
      <p className="text-xs text-ink-soft">{[e.autores, e.revista, e.anio].filter(Boolean).join(' · ')}</p>
      {e.resumen ? (
        <p className={`mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft ${verTodo ? '' : 'line-clamp-4'}`}>{e.resumen}</p>
      ) : <p className="mt-2 text-sm text-warn">Sin resumen disponible: revisa el artículo en su enlace.</p>}
      <div className="mt-1.5 flex flex-wrap gap-3 text-sm">
        {e.resumen && <button className="min-h-9 font-medium text-brand" onClick={() => setVerTodo(!verTodo)}>{verTodo ? 'Ver menos' : 'Leer el resumen completo'}</button>}
        <a className="inline-flex min-h-9 items-center font-medium text-brand underline underline-offset-2" href={e.url} target="_blank" rel="noreferrer">Abrir el artículo</a>
      </div>
      {children}
    </li>
  )
}

function Revisar({ e, usuarioId, onListo }: { e: Evidencia; usuarioId: string; onListo: () => void }) {
  const [nota, setNota] = useState('')
  const [error, setError] = useState<string | null>(null)
  const hacer = (estado: 'aprobada' | 'rechazada') =>
    revisarEvidencia(e.id, estado, nota, usuarioId).then(onListo).catch((x) => setError(mensajeError(x)))
  return (
    <div className="mt-2 grid gap-2 border-t border-line pt-2">
      <label className="text-sm font-medium text-ink" htmlFor={`nota-${e.id}`}>Nota (opcional): diseño del estudio, población, límites</label>
      <input id={`nota-${e.id}`} className="min-h-11 rounded-lg border border-line bg-surface px-3 text-[16px]" value={nota} onChange={(x) => setNota(x.target.value)} />
      <div className="flex flex-wrap gap-2">
        <button onClick={() => hacer('aprobada')} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-semibold text-on-brand hover:bg-brand-strong"><Icono nombre="check" className="h-4 w-4" /> Aprobar artículo</button>
        <button onClick={() => hacer('rechazada')} className="min-h-10 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:border-alarm/60">Rechazar</button>
      </div>
      {error && <p className="text-sm text-alarm">{error}</p>}
    </div>
  )
}

function Proponer({ e, usuarioId, onListo }: { e: Evidencia; usuarioId: string; onListo: () => void }) {
  const [abierto, setAbierto] = useState(false)
  const [dx, setDx] = useState(DIAGNOSTICOS.find((d) => d.id === e.consulta)?.id ?? DIAGNOSTICOS[0].id)
  const sintomas = DIAGNOSTICOS.find((d) => d.id === dx)?.sintomas ?? []
  const hallazgos = HALLAZGOS.filter((h) => h.sintomas.some((s) => sintomas.includes(s)))
  const [hz, setHz] = useState('')
  const [lrPos, setLrPos] = useState(''); const [lrNeg, setLrNeg] = useState('')
  const [cual, setCual] = useState<'' | 'sube' | 'baja'>('')
  const [soloAusente, setSoloAusente] = useState(false)
  const [cita, setCita] = useState('')
  const [error, setError] = useState<string | null>(null)
  if (!abierto)
    return <button className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-brand/50 px-3 text-sm font-semibold text-brand-strong hover:bg-brand-soft" onClick={() => setAbierto(true)}><Icono nombre="mas" className="h-4 w-4" /> Proponer una regla de este artículo</button>
  const enviar = () => {
    const p: ReglaPropuesta = { evidencia_id: e.id, diagnostico: dx, hallazgo: hz, lr_pos: n(lrPos), lr_neg: n(lrNeg), cualitativo: cual || null, solo_ausente: soloAusente, cita_textual: cita.trim() }
    const v = validarRegla(p, e.resumen)
    if (v) return setError(v)
    proponerRegla(p, usuarioId).then(() => { setAbierto(false); onListo() }).catch((x) => setError(mensajeError(x)))
  }
  const campo = 'min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-[16px]'
  return (
    <div className="mt-2 grid gap-2.5 border-t border-line pt-3 text-sm">
      <label className="grid gap-1 font-medium text-ink">Diagnóstico
        <select className={campo} value={dx} onChange={(x) => { setDx(x.target.value); setHz('') }}>{DIAGNOSTICOS.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select>
      </label>
      <label className="grid gap-1 font-medium text-ink">Hallazgo
        <select className={campo} value={hz} onChange={(x) => setHz(x.target.value)}>
          <option value="">Elegir hallazgo…</option>
          {hallazgos.map((h) => <option key={h.id} value={h.id}>{h.texto}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 font-medium text-ink">LR positivo<input inputMode="decimal" className={campo} value={lrPos} onChange={(x) => setLrPos(x.target.value)} /></label>
        <label className="grid gap-1 font-medium text-ink">LR negativo<input inputMode="decimal" className={campo} value={lrNeg} onChange={(x) => setLrNeg(x.target.value)} /></label>
      </div>
      <label className="grid gap-1 font-medium text-ink">Si el artículo no da número
        <select className={campo} value={cual} onChange={(x) => setCual(x.target.value as '' | 'sube' | 'baja')}>
          <option value="">— (usa los LR)</option><option value="sube">El hallazgo sube el diagnóstico</option><option value="baja">El hallazgo baja el diagnóstico</option>
        </select>
      </label>
      <label className="flex min-h-10 items-center gap-2 text-ink"><input type="checkbox" className="h-5 w-5" checked={soloAusente} onChange={(x) => setSoloAusente(x.target.checked)} /> Validado solo para descartar (cuenta solo si falta)</label>
      <label className="grid gap-1 font-medium text-ink">Frase del resumen con el dato (copiar tal cual)
        <textarea className={`${campo} min-h-24 py-2`} value={cita} onChange={(x) => setCita(x.target.value)} />
      </label>
      {error && <p className="flex items-start gap-1.5 text-alarm"><Icono nombre="alerta" className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
      <div className="flex gap-2">
        <button onClick={enviar} className="min-h-10 rounded-lg bg-brand px-3 font-semibold text-on-brand hover:bg-brand-strong">Proponer regla</button>
        <button onClick={() => setAbierto(false)} className="min-h-10 rounded-lg px-3 text-ink-soft hover:bg-surface-2">Cancelar</button>
      </div>
      <p className="text-xs text-ink-faint">La regla contará en los diagnósticos solo cuando otro revisor la confirme.</p>
    </div>
  )
}

/** Hoja lateral para revisores médicos: artículos por revisar, reglas por confirmar y búsqueda nueva. */
export function Revision({ abierto, usuarioId, onCerrar, onCambio }: Props) {
  const [pestana, setPestana] = useState<'pendiente' | 'aprobada' | 'reglas'>('pendiente')
  const [articulos, setArticulos] = useState<Evidencia[] | null>(null)
  const [reglas, setReglas] = useState<ReglaGuardada[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [buscarDx, setBuscarDx] = useState(DIAGNOSTICOS[0].id)
  const [buscando, setBuscando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const cargar = () => {
    setError(null)
    if (pestana === 'reglas') listarReglas().then(setReglas).catch((x) => setError(mensajeError(x)))
    else listarEvidencia(pestana).then(setArticulos).catch((x) => setError(mensajeError(x)))
  }
  useEffect(() => { if (abierto) cargar() }, [abierto, pestana]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!abierto) return
    const t = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar() }
    addEventListener('keydown', t)
    return () => removeEventListener('keydown', t)
  }, [abierto, onCerrar])
  if (!abierto) return null

  const buscar = () => {
    setBuscando(true); setAviso(null)
    buscarEvidencia(buscarDx)
      .then((r) => { const x = r.resumen[buscarDx]; setAviso(`Encontrados ${x.encontrados}; ${x.aceptados} de revistas que pasan el filtro de calidad.${x.errores.length ? ' Avisos: ' + x.errores.join('; ') : ''}`); setPestana('pendiente'); cargar() })
      .catch((x) => setAviso(mensajeError(x))).finally(() => setBuscando(false))
  }

  return (
    <div className="no-imprimir fixed inset-0 z-30 flex justify-end bg-ink/30 backdrop-blur-[2px]" onClick={onCerrar}>
      <aside role="dialog" aria-label="Revisión médica" onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-xl overflow-y-auto bg-bg p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-[calc(1rem+env(safe-area-inset-top,0px))] shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Revisión médica</h2>
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-2" onClick={onCerrar} aria-label="Cerrar revisión médica"><Icono nombre="cerrar" className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-ink-soft">Solo entra a Hampi lo que tú apruebas. Una regla cuenta en los diagnósticos cuando la confirma un segundo revisor.</p>

        <div className="mt-3 rounded-xl border border-line bg-surface p-3">
          <p className="text-sm font-semibold text-ink">Buscar evidencia nueva</p>
          <p className="text-xs text-ink-faint">PubMed, SciELO y Elsevier; solo revistas Q1/Q2, A1/A2 o del catálogo Latindex.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <select aria-label="Diagnóstico a buscar" className="min-h-11 min-w-0 flex-[1_1_12rem] rounded-lg border border-line bg-surface px-3 text-[16px]" value={buscarDx} onChange={(e) => setBuscarDx(e.target.value)}>
              {DIAGNOSTICOS.filter((d) => d.id !== 'sangradoAltoGrave').map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
            <button disabled={buscando} onClick={buscar} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-semibold text-on-brand hover:bg-brand-strong disabled:opacity-60">
              <Icono nombre="lupa" className="h-4 w-4" />{buscando ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
          {aviso && <p className="mt-2 text-sm text-ink-soft">{aviso}</p>}
        </div>

        <div role="tablist" className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1">
          {([['pendiente', 'Por revisar'], ['aprobada', 'Aprobados'], ['reglas', 'Reglas']] as const).map(([id, t]) => (
            <button key={id} role="tab" aria-selected={pestana === id} onClick={() => setPestana(id)}
              className={`min-h-10 rounded-lg text-sm font-semibold ${pestana === id ? 'bg-surface text-ink ring-1 ring-line' : 'text-ink-soft'}`}>{t}</button>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-alarm">{error}</p>}
        {pestana !== 'reglas' ? (
          articulos === null ? <p className="mt-4 text-sm text-ink-soft">Cargando…</p> : articulos.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-sm text-ink-soft">{pestana === 'pendiente' ? 'No hay artículos por revisar. Usa «Buscar evidencia nueva».' : 'Aún no hay artículos aprobados.'}</p>
          ) : (
            <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2.5">
              {articulos.map((e) => (
                <Articulo key={e.id} e={e}>
                  {pestana === 'pendiente'
                    ? <Revisar e={e} usuarioId={usuarioId} onListo={cargar} />
                    : <Proponer e={e} usuarioId={usuarioId} onListo={() => { setPestana('reglas') }} />}
                </Articulo>
              ))}
            </ul>
          )
        ) : reglas === null ? <p className="mt-4 text-sm text-ink-soft">Cargando…</p> : reglas.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-sm text-ink-soft">Aún no hay reglas propuestas.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2.5">
            {reglas.map((r) => {
              const propia = r.aprobada_por === usuarioId
              return (
                <li key={r.id} className="rounded-xl border border-line bg-surface p-3 text-sm">
                  <p className="font-semibold text-ink">{nombreDx(r.diagnostico)} · {textoHz(r.hallazgo)}</p>
                  <p className="cifra text-ink-soft">
                    {[r.lr_pos !== null && `LR+ ${String(r.lr_pos).replace('.', ',')}`, r.lr_neg !== null && `LR− ${String(r.lr_neg).replace('.', ',')}`, r.cualitativo && (r.cualitativo === 'sube' ? 'Sube' : 'Baja'), r.solo_ausente && 'solo para descartar'].filter(Boolean).join(' · ')}
                  </p>
                  <blockquote className="mt-1.5 border-l-2 border-brand/40 pl-2 text-ink-soft">«{r.cita_textual}»</blockquote>
                  {r.evidencia && <p className="mt-1 text-xs text-ink-faint">{r.evidencia.titulo} · <a className="text-brand underline" href={r.evidencia.url} target="_blank" rel="noreferrer">artículo</a></p>}
                  <div className="mt-2">
                    {r.confirmada_por ? (
                      <span className="inline-flex items-center gap-1 font-medium text-ok"><Icono nombre="check" className="h-4 w-4" /> Confirmada por dos revisores: ya cuenta en los diagnósticos</span>
                    ) : propia ? (
                      <span className="text-ink-faint">Propuesta por ti: falta que otro revisor la confirme.</span>
                    ) : (
                      <button onClick={() => confirmarRegla(r.id, usuarioId).then(() => { cargar(); onCambio() }).catch((x) => setError(mensajeError(x)))}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-brand px-3 font-semibold text-on-brand hover:bg-brand-strong">
                        <Icono nombre="check" className="h-4 w-4" /> Revisé la cita y el número: confirmar
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </aside>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { diagnosticosEnVivo, formatoFactor, preguntasClave, preguntasParaAfinar, type Resultado } from '../lib/motor'
import { CONSIDERAR } from '../data/considerar'
import { hallazgosEnLoEscrito } from '../data/detectarHallazgos'
import { alarmasMarcadas, avisos, faltantes, sintomasAbiertos, type Historia } from '../lib/historia'
import { Icono } from './Icono'

interface Props {
  historia: Historia
  setHistoria: (f: (h: Historia) => Historia) => void
  irA?: (seccionId: string) => void
}

function alternarDescartado(h: Historia, id: string): Historia {
  const lista = (h.diagnosticosVivo?.descartados ?? '').split(',').filter(Boolean)
  const nueva = lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]
  return { ...h, diagnosticosVivo: { ...h.diagnosticosVivo, descartados: nueva.join(',') } }
}

/** Nombres de los diagnósticos escritos (una línea por diagnóstico, sin «(presuntivo)»). */
export function nombresElegidos(h: Historia): Set<string> {
  return new Set((h.impresion?.diagnosticos ?? '').split('\n').map((l) => l.replace(/\s*\(.*\)\s*$/, '').trim().toLowerCase()).filter(Boolean))
}
const estaElegido = (h: Historia, nombre: string) => nombresElegidos(h).has(nombre.toLowerCase())

function agregarADiagnosticos(h: Historia, nombre: string): Historia {
  const actual = (h.impresion?.diagnosticos ?? '').trim()
  if (estaElegido(h, nombre)) return h
  const linea = `${nombre} (presuntivo)`
  return { ...h, impresion: { ...h.impresion, diagnosticos: actual ? `${actual}\n${linea}` : linea } }
}

const coma = (n: number) => String(n).replace('.', ',')

function Tarjeta({ r, historia, setHistoria }: { r: Resultado } & Props) {
  const [abierta, setAbierta] = useState(false)
  // Sin hallazgos registrados: tarjeta compacta, solo el nombre y su estado.
  if (!r.razones.length && !abierta)
    return (
      <li className={`flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 ${r.descartado ? 'border-line bg-surface-2 opacity-60' : 'border-line bg-surface'}`}>
        <div className="min-w-0">
          <p className={`font-medium leading-snug text-ink ${r.descartado ? 'line-through' : ''}`}>{r.nombre}</p>
          <p className="text-xs text-ink-faint">{r.grave && !r.descartado ? <span className="font-semibold text-alarm">No te lo pierdas · </span> : null}sin hallazgos que cambien el orden</p>
        </div>
        <button className="shrink-0 rounded-lg px-2 py-1.5 text-sm text-ink-soft hover:bg-surface-2" onClick={() => setAbierta(true)}>Ver</button>
      </li>
    )
  const yaAgregado = estaElegido(historia, r.nombre)
  // Barra centrada en ×1: a la derecha sube, a la izquierda baja (escala logarítmica).
  const log = Math.max(-1.5, Math.min(1.5, Math.log10(r.factor)))
  const sube = log >= 0
  return (
    <li className={`aparecer rounded-2xl border p-3.5 transition-colors ${r.descartado ? 'border-line bg-surface-2 opacity-60' : r.grave ? 'border-alarm/25 bg-surface' : 'border-line bg-surface'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-semibold leading-snug text-ink ${r.descartado ? 'line-through' : ''}`}>{r.nombre}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {r.grave && !r.descartado && <span className="rounded-full bg-alarm-soft px-2 py-0.5 text-[11px] font-semibold text-alarm">No te lo pierdas</span>}
            {r.descartado && <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-soft">Descartado</span>}
          </div>
        </div>
        <span className={`shrink-0 rounded-lg px-2 py-1 text-right text-sm font-semibold ${!r.razones.length ? 'text-ink-faint' : sube ? 'bg-brand-soft text-brand-strong' : 'bg-surface-2 text-ink-soft'}`}
          title="Número: razón de verosimilitud combinada de los estudios. Flechas: factores cualitativos (sin número publicado).">
          {r.factorLR !== 1 && <span className="cifra">{formatoFactor(r.factorLR)}</span>}
          {(r.cualitativos.suben > 0 || r.cualitativos.bajan > 0) && (
            <span className={`${r.factorLR !== 1 ? 'ml-1.5' : ''} cifra text-xs`}>{'▲'.repeat(Math.min(r.cualitativos.suben, 3))}{'▼'.repeat(Math.min(r.cualitativos.bajan, 3))}</span>
          )}
          {!r.razones.length && 'sin datos'}
        </span>
      </div>

      <div className="relative mt-3 h-1.5 rounded-full bg-surface-2" aria-hidden>
        <span className="absolute inset-y-[-3px] left-1/2 w-px bg-line" />
        <span className={`absolute inset-y-0 rounded-full ${sube ? 'left-1/2 bg-brand' : 'right-1/2 bg-ink-faint'}`} style={{ width: `${(Math.abs(log) / 1.5) * 50}%` }} />
      </div>

      {r.razones.length > 0 && (
        <ul className="mt-3 grid gap-1 text-sm">
          {r.razones.map((x, i) => (
            <li key={i} className="flex gap-2">
              <span className={`cifra mt-px font-semibold ${x.factor > 1 ? 'text-brand' : 'text-ink-faint'}`}>{x.factor > 1 ? '▲' : '▼'}</span>
              <span className="text-ink-soft">
                {x.presente ? '' : 'Sin '}{x.presente ? x.texto : x.texto.charAt(0).toLowerCase() + x.texto.slice(1)}
                <span className="cifra ml-1 text-xs text-ink-faint">{x.tipo === 'lr' ? `LR ${coma(x.factor)}` : 'cualitativo'}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {!r.descartado && (
          <button disabled={yaAgregado} onClick={() => setHistoria((h) => agregarADiagnosticos(h, r.nombre))}
            className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-brand-soft px-2.5 font-medium text-brand-strong hover:bg-brand/15 disabled:bg-transparent disabled:text-ink-faint">
            <Icono nombre={yaAgregado ? 'check' : 'mas'} className="h-4 w-4" /> {yaAgregado ? 'En mis diagnósticos' : 'Agregar a mis diagnósticos'}
          </button>
        )}
        <button className="inline-flex min-h-9 items-center rounded-lg px-2.5 text-ink-soft hover:bg-surface-2" onClick={() => setHistoria((h) => alternarDescartado(h, r.id))}>
          {r.descartado ? 'Volver a considerar' : 'Descartar'}
        </button>
        <button className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-ink-soft hover:bg-surface-2" onClick={() => setAbierta(!abierta)} aria-expanded={abierta}>
          <Icono nombre="libro" className="h-4 w-4" /> Fuentes
        </button>
      </div>

      {abierta && (
        <div className="mt-2 grid gap-2 border-t border-line pt-3 text-xs leading-relaxed text-ink-soft">
          {r.nota && <p>{r.nota}</p>}
          {r.razones.filter((x) => x.nota).map((x, i) => <p key={i}>{x.texto}: {x.nota}.</p>)}
          {r.fuentes.map((f) => (
            <p key={f.id} className="rounded-lg bg-surface-2 p-2">
              <span className="text-ink">{f.titulo}.</span> {f.cita}.{' '}
              <a className="font-medium text-brand underline underline-offset-2" href={f.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${f.pmid}/` : f.url} target="_blank" rel="noreferrer">{f.pmid ? `PubMed ${f.pmid}` : f.base === 'scielo' ? 'SciELO' : 'Elsevier'}</a>
              {f.calidad && <span className="ml-1 text-ink-faint">· {f.calidad === 'Latindex' ? 'catálogo Latindex' : f.calidad} · aprobada por 2 revisores</span>}
              {f.doi && <> · <a className="font-medium text-brand underline underline-offset-2" href={`https://doi.org/${f.doi}`} target="_blank" rel="noreferrer">DOI</a></>}
            </p>
          ))}
        </div>
      )}
    </li>
  )
}

export function ListaDiagnosticos({ historia, setHistoria }: Props) {
  const r = diagnosticosEnVivo(historia)
  if (r.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-line p-5 text-center">
        <Icono nombre="pulso" className="mx-auto h-7 w-7 text-ink-faint" />
        <p className="mt-2 font-medium text-ink">Aún sin diagnósticos</p>
        <p className="mt-1 text-sm text-ink-soft">
          Aparecen al abrir una pestaña de síntoma con diagnósticos cargados: dolor torácico, disnea, fiebre, tos, dolor abdominal,
          cefalea, síncope, síntomas urinarios, edema, confusión, debilidad o adormecimiento, mareo, vómito, diarrea y sangrado digestivo.
        </p>
      </div>
    )
  return <ul className="grid gap-2.5">{r.map((x) => <Tarjeta key={x.id} r={x} historia={historia} setHistoria={setHistoria} />)}</ul>
}

function Pendientes({ historia, irA }: Props) {
  const alarmas = alarmasMarcadas(historia)
  const falta = faltantes(historia)
  const av = avisos(historia)
  return (
    <div className="grid gap-4">
      {av.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-warn">Que no se te olvide</h4>
          <ul className="mt-2 grid gap-1">
            {av.map((a, i) => (
              <li key={i}>
                <button className="flex w-full min-h-10 items-start gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-warn-soft" onClick={() => irA?.(a.seccionId)}>
                  <Icono nombre={a.tipo === 'alarma' ? 'alerta' : 'info'} className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
                  <span className="text-ink">{a.texto}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-alarm">Signos de alarma marcados</h4>
        {alarmas.length === 0 ? <p className="mt-1.5 text-sm text-ink-soft">Ninguno por ahora.</p> : (
          <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-1.5">
            {alarmas.map((a, i) => (
              <li key={i} className="flex gap-2 rounded-xl bg-alarm-soft px-3 py-2 text-sm">
                <Icono nombre="alerta" className="mt-0.5 h-4 w-4 shrink-0 text-alarm" />
                <span><span className="font-semibold text-alarm">{a.alarma}</span><span className="text-ink-soft"> · {a.sintoma}</span></span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-warn">Datos obligatorios que faltan</h4>
        {falta.length === 0 ? <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ok"><Icono nombre="check" className="h-4 w-4" /> Todo lo obligatorio está completo.</p> : (
          <ul className="mt-2 grid gap-1">
            {falta.map((f) => (
              <li key={f.seccionId + f.campo}>
                <button className="flex w-full min-h-10 items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-warn-soft" onClick={() => irA?.(f.seccionId)}>
                  <span><span className="text-ink">{f.campo}</span><span className="text-ink-faint"> · {f.seccion}</span></span>
                  <Icono nombre="flecha" className="h-4 w-4 shrink-0 text-warn" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

/** Lo que Hampi encontró en el texto escrito: el médico confirma con un toque. */
export function LoQueEscribio({ historia, setHistoria, max }: Props & { max?: number }) {
  const [todos, setTodos] = useState(false)
  const lista = hallazgosEnLoEscrito(historia)
  const visibles = max && !todos ? lista.slice(0, max) : lista
  if (!lista.length) return null
  const confirmar = (items: typeof lista) =>
    setHistoria((h) => ({ ...h, hallazgos: { ...h.hallazgos, ...Object.fromEntries(items.map((d) => [d.hallazgo, d.estado])) } }))
  const ignorar = (id: string) => setHistoria((h) => {
    const prev = (h.diagnosticosVivo?.ignorados ?? '').split(',').filter(Boolean)
    return { ...h, diagnosticosVivo: { ...h.diagnosticosVivo, ignorados: [...prev, id].join(',') } }
  })
  return (
    <div className="min-w-0 rounded-xl border border-ok/40 bg-ok-soft/40 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Icono nombre="libro" className="h-4 w-4 text-ok" /> Encontré esto en lo que escribiste
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">Confírmalo para que cuente en los diagnósticos.</p>
        </div>
        {lista.length > 1 && (
          <button onClick={() => confirmar(lista)} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-brand px-3 text-sm font-semibold text-on-brand hover:bg-brand-strong">
            <Icono nombre="check" className="h-4 w-4" /> Confirmar los {lista.length}
          </button>
        )}
      </div>
      <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-1.5">
        {visibles.map((d) => (
          <li key={d.hallazgo} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface px-2.5 py-2">
            <div className="min-w-0 flex-[1_1_12rem]">
              <p className="break-words text-sm font-medium text-ink">
                <span className={`mr-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${d.estado === 'si' ? 'bg-brand-soft text-brand-strong' : 'bg-surface-2 text-ink-soft'}`}>{d.estado === 'si' ? 'Presente' : 'Ausente'}</span>
                {d.texto}
              </p>
              <p className="truncate text-xs text-ink-faint">{d.donde}: «{d.fragmento}»</p>
            </div>
            <span className="flex shrink-0 gap-1.5">
              <button onClick={() => confirmar([d])} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-brand/50 bg-surface px-3 text-sm font-semibold text-brand-strong hover:bg-brand-soft">
                <Icono nombre="check" className="h-4 w-4" /> Confirmar
              </button>
              <button onClick={() => ignorar(d.hallazgo)} className="min-h-10 rounded-lg px-2.5 text-sm text-ink-soft hover:bg-surface-2">No corresponde</button>
            </span>
          </li>
        ))}
      </ul>
      {max && lista.length > max && (
        <button className="mt-1 min-h-10 text-sm font-semibold text-brand" onClick={() => setTodos(!todos)}>{todos ? 'Ver menos' : `Ver ${lista.length - max} más`}</button>
      )}
    </div>
  )
}

/** Las 3 preguntas o maniobras que más moverían la lista ahora: se responden ahí mismo. */
export function PregunteAhora({ historia, setHistoria, max }: Props & { max?: number }) {
  const [todas, setTodas] = useState(false)
  const lista = preguntasClave(historia)
  const visibles = max && !todas ? lista.slice(0, max) : lista
  if (!lista.length) return null
  const responder = (id: string, v: string) => setHistoria((h) => ({ ...h, hallazgos: { ...h.hallazgos, [id]: v } }))
  return (
    <div className="min-w-0 rounded-xl border border-brand/30 bg-brand-soft/30 p-3">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-strong">
        <Icono nombre="mensaje" className="h-4 w-4" /> Pregunta o examina esto ahora
      </p>
      <p className="mt-0.5 text-xs text-ink-faint">Son los datos que más cambiarían el orden de la lista.</p>
      <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-1.5">
        {visibles.map((q) => (
          <li key={q.hallazgo} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface px-2.5 py-2">
            <div className="min-w-0 flex-[1_1_12rem]">
              <p className="text-sm font-medium text-ink">{q.texto}</p>
              <p className="text-xs text-ink-faint">
                Cambia: {q.diagnosticos.slice(0, 3).join(', ')}{q.diagnosticos.length > 3 ? ` y ${q.diagnosticos.length - 3} más` : ''}
              </p>
            </div>
            <span className="flex shrink-0 overflow-hidden rounded-lg border border-line text-sm" role="group" aria-label={q.texto}>
              <button className="min-h-10 min-w-12 px-2.5 font-medium text-ink-soft hover:bg-brand-soft" onClick={() => responder(q.hallazgo, 'si')}>Sí</button>
              <button className="min-h-10 min-w-12 border-l border-line px-2.5 font-medium text-ink-soft hover:bg-surface-2" onClick={() => responder(q.hallazgo, 'no')}>No</button>
            </span>
          </li>
        ))}
      </ul>
      {max && lista.length > max && (
        <button className="mt-1 min-h-10 text-sm font-semibold text-brand" onClick={() => setTodas(!todas)}>{todas ? 'Ver menos' : `Ver ${lista.length - max} más`}</button>
      )}
    </div>
  )
}

/** Contenido del asistente: diagnósticos en vivo y pendientes. */
export function Asistente(props: Props) {
  const [pestana, setPestana] = useState<'dx' | 'pend'>('dx')
  const n = diagnosticosEnVivo(props.historia).filter((x) => !x.descartado).length
  const p = alarmasMarcadas(props.historia).length + faltantes(props.historia).length + avisos(props.historia).length
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
        {([['dx', 'Diagnósticos', n], ['pend', 'Pendientes', p]] as const).map(([id, t, c]) => (
          <button key={id} role="tab" aria-selected={pestana === id} onClick={() => setPestana(id)}
            className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors ${pestana === id ? 'bg-surface text-ink ring-1 ring-line' : 'text-ink-soft'}`}>
            {t}{c > 0 && <span className={`cifra rounded-full px-1.5 text-xs ${id === 'pend' ? 'bg-warn-soft text-warn' : 'bg-brand-soft text-brand-strong'}`}>{c}</span>}
          </button>
        ))}
      </div>
      {pestana === 'dx' ? (
        <>
          <p className="text-xs leading-relaxed text-ink-faint">
            Ayuda, no diagnóstico. El número (×) combina razones de verosimilitud publicadas; las flechas ▲▼ son factores cualitativos sin número publicado. Pendiente de revisión médica.
          </p>
          <LoQueEscribio {...props} />
          <PregunteAhora {...props} />
          <ListaDiagnosticos {...props} />
        </>
      ) : <Pendientes {...props} />}
    </div>
  )
}

/** En pantallas medianas y pequeñas: botón flotante que abre el asistente en una hoja lateral. */
export function AsistenteFlotante(props: Props & { abierto?: boolean; setAbierto?: (v: boolean) => void }) {
  const [abiertoLocal, setAbiertoLocal] = useState(false)
  const abierto = props.abierto ?? abiertoLocal
  const setAbierto = props.setAbierto ?? setAbiertoLocal
  const n = diagnosticosEnVivo(props.historia).filter((x) => !x.descartado).length
  const alarmas = alarmasMarcadas(props.historia).length
  useEffect(() => {
    if (!abierto) return
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false) }
    addEventListener('keydown', tecla)
    return () => removeEventListener('keydown', tecla)
  }, [abierto])
  return (
    <>
      <button onClick={() => setAbierto(true)}
        className="no-imprimir fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] z-20 hidden min-h-12 items-center gap-2 rounded-full bg-brand pl-4 pr-3 font-semibold text-on-brand shadow-card hover:bg-brand-strong md:flex xl:hidden">
        <Icono nombre="pulso" className="h-5 w-5" /> Asistente
        {n > 0 && <span className="cifra rounded-full bg-on-brand/20 px-2 text-sm">{n}</span>}
        {alarmas > 0 && <span className="cifra rounded-full bg-alarm px-2 text-sm text-on-alarm">{alarmas}</span>}
      </button>
      {abierto && (
        <div className="no-imprimir fixed inset-0 z-30 flex justify-end bg-ink/30 backdrop-blur-[2px] xl:hidden" onClick={() => setAbierto(false)}>
          <aside role="dialog" aria-label="Asistente" onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-md overflow-y-auto bg-bg p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-[calc(1rem+env(safe-area-inset-top,0px))] shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">Asistente</h2>
              <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-2" onClick={() => setAbierto(false)} aria-label="Cerrar asistente">
                <Icono nombre="cerrar" className="h-5 w-5" />
              </button>
            </div>
            <Asistente {...props} irA={(id) => { setAbierto(false); props.irA?.(id) }} />
          </aside>
        </div>
      )}
    </>
  )
}

function quitarDeDiagnosticos(h: Historia, nombre: string): Historia {
  const lineas = (h.impresion?.diagnosticos ?? '').split('\n').filter((l) => l.replace(/\s*\(.*\)\s*$/, '').trim().toLowerCase() !== nombre.toLowerCase())
  return { ...h, impresion: { ...h.impresion, diagnosticos: lineas.join('\n').trim() } }
}

/** Una fila de la lista para elegir: nombre, motivo, Elegir y «Afinar» con preguntas Sí/No. */
function FilaDiagnostico({ r, i, historia, setHistoria }: { r: Resultado; i: number } & Props) {
  const [abierta, setAbierta] = useState(false)
  const elegido = estaElegido(historia, r.nombre)
  const motivo = r.razones.find((x) => x.factor > 1) ?? r.razones[0]
  const preguntas = preguntasParaAfinar(historia, r.id)
  const responder = (id: string, v: string) => setHistoria((h) => ({ ...h, hallazgos: { ...h.hallazgos, [id]: v } }))
  return (
    <li className={`min-w-0 rounded-xl border transition-colors ${elegido ? 'border-brand bg-brand-soft/50' : 'border-line'}`}>
      <div className="flex min-w-0 items-center gap-3 px-3 py-2.5">
        <span className={`cifra flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${i === 0 ? 'bg-brand text-on-brand' : 'bg-surface-2 text-ink-soft'}`}>{i + 1}</span>
        <div className="min-w-0 flex-[1_1_12rem]">
          <p className="font-semibold leading-snug text-ink">
            {r.nombre}
            {r.grave && <span className="ml-2 inline-block rounded-full bg-alarm-soft px-2 py-0.5 align-middle text-[11px] font-semibold text-alarm">No te lo pierdas</span>}
          </p>
          <p className="truncate text-xs text-ink-soft">
            {motivo ? `${motivo.factor > 1 ? '▲' : '▼'} ${motivo.presente ? motivo.texto : 'Sin ' + motivo.texto.charAt(0).toLowerCase() + motivo.texto.slice(1)}` : 'Sin hallazgos registrados todavía'}
            {r.factorLR !== 1 && <span className="cifra ml-1.5 text-ink-faint">{formatoFactor(r.factorLR)}</span>}
          </p>
        </div>
        <button aria-pressed={elegido}
          onClick={() => setHistoria((h) => (elegido ? quitarDeDiagnosticos(h, r.nombre) : agregarADiagnosticos(h, r.nombre)))}
          className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors ${
            elegido ? 'bg-brand text-on-brand' : 'border border-line bg-surface text-ink hover:border-brand/60'}`}>
          <Icono nombre={elegido ? 'check' : 'mas'} className="h-4 w-4" />{elegido ? 'Elegido' : 'Elegir'}
        </button>
      </div>
      {(preguntas.length > 0 || r.estudios) && (
        <div className="border-t border-line/70 px-3 py-1.5">
          <button className="flex min-h-9 w-full items-center justify-between gap-2 text-left text-sm font-medium text-brand" onClick={() => setAbierta(!abierta)} aria-expanded={abierta}>
            <span>{preguntas.length ? `Afinar: ${preguntas.length} ${preguntas.length === 1 ? 'dato' : 'datos'} por preguntar o examinar` : 'Exámenes que menciona la fuente'}</span>
            <Icono nombre="flecha" className={`h-4 w-4 transition-transform ${abierta ? 'rotate-90' : ''}`} />
          </button>
          {abierta && (
            <div className="grid gap-1.5 pb-2 pt-1">
              {preguntas.slice(0, 6).map((q) => (
                <div key={q.hallazgo} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface px-2.5 py-2">
                  <div className="min-w-0 flex-[1_1_12rem]">
                    <p className="text-sm text-ink">{q.texto}</p>
                    <p className="text-xs text-ink-faint">{q.efecto}</p>
                  </div>
                  <span className="flex shrink-0 overflow-hidden rounded-lg border border-line text-sm" role="group" aria-label={q.texto}>
                    <button className="min-h-9 min-w-11 px-2.5 font-medium text-ink-soft hover:bg-brand-soft" onClick={() => responder(q.hallazgo, 'si')}>Sí</button>
                    <button className="min-h-9 min-w-11 border-l border-line px-2.5 font-medium text-ink-soft hover:bg-surface-2" onClick={() => responder(q.hallazgo, 'no')}>No</button>
                  </span>
                </div>
              ))}
              {r.estudios && (
                <p className="rounded-lg bg-surface-2 px-2.5 py-2 text-sm text-ink-soft">
                  <span className="font-semibold text-ink">Estudios que menciona la fuente: </span>{r.estudios}
                  <span className="ml-1 text-xs text-ink-faint">({r.fuentes[0]?.cita.split('.')[0]})</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  )
}

/**
 * Elegir el diagnóstico más probable ahí mismo, debajo del formulario.
 * `compacto`: tarjeta corta al final de cada apartado (los 3 primeros).
 */
export function ElegirDiagnosticos({ historia, setHistoria, compacto, irA }: Props & { compacto?: boolean }) {
  const [verTodos, setVerTodos] = useState(false)
  const todos = diagnosticosEnVivo(historia).filter((x) => !x.descartado)
  const lista = compacto && !verTodos ? todos.slice(0, 3) : todos
  const nombresMotor = new Set(todos.map((x) => x.nombre.toLowerCase()))
  const otros = [...new Set(sintomasAbiertos(historia).flatMap((id) => CONSIDERAR[id] ?? []))].filter((n) => !nombresMotor.has(n.toLowerCase()))
  if (compacto && lista.length === 0) return null

  return (
    <section className="no-imprimir linea-margen min-w-0 rounded-xl border border-line bg-surface py-4 pl-6 pr-4 sm:py-5 sm:pl-8 sm:pr-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand"><Icono nombre="lupa" className="h-4 w-4" /></span>
            {compacto ? 'Lo más probable hasta ahora' : '¿Cuál es más probable? Elige tus diagnósticos'}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">Ordenados según lo que registraste. «Afinar» te dice qué preguntar. La decisión es tuya.</p>
        </div>
      </div>

      {lista.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-sm text-ink-soft">
          Aún no hay sugerencias. Escribe el motivo de consulta y marca los hallazgos clave en Enfermedad actual.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-2">
          {lista.map((r, i) => <FilaDiagnostico key={r.id} r={r} i={i} historia={historia} setHistoria={setHistoria} irA={irA} />)}
        </ul>
      )}

      {compacto && todos.length > 3 && (
        <button className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-brand hover:bg-brand-soft" onClick={() => setVerTodos(!verTodos)}>
          <Icono nombre={verTodos ? 'atras' : 'mas'} className="h-4 w-4" />{verTodos ? 'Ver menos' : `Ver ${todos.length - 3} diagnósticos más`}
        </button>
      )}

      {(!compacto || verTodos) && otros.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <h4 className="text-sm font-semibold text-ink">Otros a considerar</h4>
          <p className="mt-0.5 text-xs text-ink-faint">Lista orientativa según los síntomas, sin puntaje. Pendiente de revisión médica.</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {otros.map((n) => {
              const elegido = estaElegido(historia, n)
              return (
                <button key={n} aria-pressed={elegido}
                  onClick={() => setHistoria((h) => (elegido ? quitarDeDiagnosticos(h, n) : agregarADiagnosticos(h, n)))}
                  className={`inline-flex min-h-9 items-center gap-1 rounded-full border px-3 text-sm transition-colors ${elegido ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface text-ink hover:border-brand/60'}`}>
                  <Icono nombre={elegido ? 'check' : 'mas'} className="h-3.5 w-3.5" />{n}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

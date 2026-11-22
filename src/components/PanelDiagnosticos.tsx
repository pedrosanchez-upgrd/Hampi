import { useEffect, useState } from 'react'
import { diagnosticosEnVivo, formatoFactor, type Resultado } from '../lib/motor'
import { alarmasMarcadas, avisos, faltantes, type Historia } from '../lib/historia'
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

function agregarADiagnosticos(h: Historia, nombre: string): Historia {
  const actual = (h.impresion?.diagnosticos ?? '').trim()
  if (actual.toLowerCase().includes(nombre.toLowerCase())) return h
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
  const yaAgregado = (historia.impresion?.diagnosticos ?? '').toLowerCase().includes(r.nombre.toLowerCase())
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
              <a className="font-medium text-brand underline underline-offset-2" href={`https://pubmed.ncbi.nlm.nih.gov/${f.pmid}/`} target="_blank" rel="noreferrer">PubMed {f.pmid}</a>
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
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-warn">No se le olvide</h4>
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
          <ul className="mt-2 grid gap-1.5">
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

/** Contenido del asistente: diagnósticos en vivo y pendientes. */
export function Asistente(props: Props) {
  const [pestana, setPestana] = useState<'dx' | 'pend'>('dx')
  const n = diagnosticosEnVivo(props.historia).filter((x) => !x.descartado).length
  const p = alarmasMarcadas(props.historia).length + faltantes(props.historia).length + avisos(props.historia).length
  return (
    <div className="grid gap-3">
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
        {([['dx', 'Diagnósticos', n], ['pend', 'Pendientes', p]] as const).map(([id, t, c]) => (
          <button key={id} role="tab" aria-selected={pestana === id} onClick={() => setPestana(id)}
            className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors ${pestana === id ? 'bg-surface text-ink shadow-card' : 'text-ink-soft'}`}>
            {t}{c > 0 && <span className={`cifra rounded-full px-1.5 text-xs ${id === 'pend' ? 'bg-warn-soft text-warn' : 'bg-brand-soft text-brand-strong'}`}>{c}</span>}
          </button>
        ))}
      </div>
      {pestana === 'dx' ? (
        <>
          <p className="text-xs leading-relaxed text-ink-faint">
            Ayuda, no diagnóstico. El número (×) combina razones de verosimilitud publicadas; las flechas ▲▼ son factores cualitativos sin número publicado. Pendiente de revisión médica.
          </p>
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
              <h2 className="font-display text-xl font-bold text-ink">Asistente</h2>
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

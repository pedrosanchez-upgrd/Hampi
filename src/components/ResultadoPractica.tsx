import { useEffect } from 'react'
import { resultadoPractica } from '../data/casosPractica'
import type { Historia } from '../lib/historia'
import { Icono } from './Icono'

interface Props { historia: Historia; onCerrar: () => void; onOtro: () => void; onRedaccion: () => void }

/** Resultado del modo práctica: diagnóstico, preguntas clave y lo que se aprende. */
export function ResultadoPractica({ historia, onCerrar, onOtro, onRedaccion }: Props) {
  useEffect(() => {
    const t = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar() }
    addEventListener('keydown', t)
    return () => removeEventListener('keydown', t)
  }, [onCerrar])
  const r = resultadoPractica(historia)
  if (!r) return null
  const total = r.caso.clave.length
  return (
    <div className="no-imprimir fixed inset-0 z-40 flex items-end justify-center bg-ink/30 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onCerrar}>
      <section role="dialog" aria-modal="true" aria-labelledby="resultado-titulo" onClick={(e) => e.stopPropagation()}
        className="linea-margen max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-surface py-6 pl-8 pr-6 shadow-card sm:rounded-2xl sm:pl-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Tu resultado</p>
            <h2 id="resultado-titulo" className="mt-1 font-display text-[28px] font-semibold leading-tight text-ink">{r.caso.titulo}</h2>
          </div>
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-2" onClick={onCerrar} aria-label="Volver al caso"><Icono nombre="cerrar" className="h-5 w-5" /></button>
        </div>

        <div className={`mt-5 flex gap-3 rounded-xl px-4 py-3 ${r.acerto ? 'bg-ok-soft' : 'bg-warn-soft'}`}>
          <Icono nombre={r.acerto ? 'check' : 'info'} className={`mt-0.5 h-5 w-5 shrink-0 ${r.acerto ? 'text-ok' : 'text-warn'}`} />
          <p className="text-ink">
            {r.acerto
              ? <>Elegiste <strong>{r.diagnosticoNombre}</strong>{r.primero ? ' en primer lugar.' : ', pero no en primer lugar: revisa el orden.'}</>
              : <>El caso era <strong>{r.diagnosticoNombre}</strong>. No está entre tus diagnósticos de la impresión diagnóstica.</>}
          </p>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl font-semibold text-ink">Preguntas clave</h3>
            <p className="cifra text-ink-soft"><span className="text-2xl font-semibold text-ink">{r.claveHechas.length}</span> de {total}</p>
          </div>
          <div className="mt-2 flex gap-1" aria-hidden>
            {r.caso.clave.map((id) => <span key={id} className={`h-2 flex-1 rounded-full ${r.claveHechas.includes(id) ? 'bg-brand' : 'bg-surface-2'}`} />)}
          </div>
          {r.claveFaltaron.length > 0 ? (
            <ul className="mt-4 grid gap-3">
              {r.claveFaltaron.map((x) => (
                <li key={x.id} className="border-b border-rule pb-3 last:border-0">
                  <p className="font-medium text-ink">Te faltó: {x.texto}</p>
                  {x.dice && <p className="mt-0.5 font-display italic text-ink-soft">El paciente habría dicho: «{x.dice}»</p>}
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-ok">Preguntaste todo lo clave.</p>}
        </div>

        <div className="mt-6">
          <h3 className="font-display text-xl font-semibold text-ink">Si preguntabas todo, Hampi habría sugerido</h3>
          <ol className="mt-2 grid gap-1">
            {r.motorTop.map((n, i) => (
              <li key={n} className="flex items-baseline gap-3"><span className="w-5 font-display text-lg font-semibold text-brand">{i + 1}</span><span className="text-ink">{n}</span></li>
            ))}
          </ol>
        </div>

        <blockquote className="mt-6 rounded-xl bg-margen px-4 py-3 font-display text-[17px] italic leading-relaxed text-ink">{r.caso.ensenanza}</blockquote>
        <p className="mt-2 text-xs text-ink-faint">Caso ficticio, pendiente de revisión médica.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={onOtro} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 font-semibold text-on-brand hover:bg-brand-strong">Practicar otro caso</button>
          <button onClick={onRedaccion} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-4 font-medium text-ink hover:border-brand/60">Ver mi historia redactada</button>
          <button onClick={onCerrar} className="min-h-11 rounded-xl px-4 font-medium text-ink-soft hover:bg-surface-2">Volver al caso</button>
        </div>
      </section>
    </div>
  )
}

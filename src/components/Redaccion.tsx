import { useState } from 'react'
import { faltantes, presentacionOral, redactar, type Historia } from '../lib/historia'
import { Icono } from './Icono'

export function Redaccion({ historia, irA, onNueva, onInicio }: { historia: Historia; irA: (seccionId: string) => void; onNueva?: () => void; onInicio?: () => void }) {
  const [copiado, setCopiado] = useState<'no' | 'si' | 'manual'>('no')
  const [vista, setVista] = useState<'historia' | 'oral'>('historia')
  const oral = presentacionOral(historia)
  const texto = vista === 'historia' ? redactar(historia) : oral
  const falta = faltantes(historia)
  // Dentro de un marco (vista de prueba) el navegador no deja imprimir.
  const enMarco = (() => { try { return window.self !== window.top } catch { return true } })()

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado('si')
      setTimeout(() => setCopiado('no'), 2500)
    } catch {
      // Si el navegador no deja copiar, se selecciona el texto para copiarlo a mano.
      const pre = document.getElementById('texto-redactado')
      if (pre) { const r = document.createRange(); r.selectNodeContents(pre); const sel = getSelection(); sel?.removeAllRanges(); sel?.addRange(r) }
      setCopiado('manual')
    }
  }

  // Separa los bloques para darles formato (título en mayúsculas + contenido).
  const bloques = texto.split('\n\n').map((b) => { const [t, ...resto] = b.split('\n'); return { t, resto } })

  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <header className="no-imprimir flex items-start gap-4">
        <span aria-hidden className="font-display text-[56px] font-semibold leading-[0.9] text-brand/75 sm:text-[72px]">10</span>
        <div className="min-w-0 pt-1">
          <h2 className="font-display text-[30px] font-semibold leading-tight text-ink sm:text-[34px]">Redacción final</h2>
          <p className="mt-1 text-ink-soft">Revisa el texto antes de firmarlo. Hampi solo ordena y redacta lo que escribiste; no agrega datos.</p>
        </div>
      </header>

      {falta.length > 0 ? (
        <div className="no-imprimir rounded-xl border border-warn/30 bg-warn-soft p-4">
          <p className="flex items-center gap-2 font-semibold text-warn"><Icono nombre="alerta" className="h-5 w-5" /> {falta.length === 1 ? 'Falta 1 dato obligatorio' : `Faltan ${falta.length} datos obligatorios`}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {falta.map((f) => (
              <li key={f.seccionId + f.campo}>
                <button className="min-h-9 rounded-full border border-warn/30 bg-surface px-3 text-sm text-ink hover:border-warn" onClick={() => irA(f.seccionId)}>
                  {f.campo} <span className="text-ink-faint">· {f.seccion}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="no-imprimir flex items-center gap-2 rounded-xl border border-ok/30 bg-ok-soft p-4 font-semibold text-ok">
          <Icono nombre="check" className="h-5 w-5" /> Todos los datos obligatorios están completos.
        </p>
      )}

      <div role="tablist" aria-label="Tipo de texto" className="no-imprimir grid w-full max-w-md grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
        {([['historia', 'Historia completa'], ['oral', 'Presentación oral']] as const).map(([id, t]) => (
          <button key={id} role="tab" aria-selected={vista === id} onClick={() => { setVista(id); setCopiado('no') }}
            className={`min-h-10 rounded-lg text-sm font-semibold transition-colors ${vista === id ? 'bg-surface text-ink ring-1 ring-line' : 'text-ink-soft'}`}>{t}</button>
        ))}
      </div>

      <div className="no-imprimir flex flex-wrap gap-2">
        <button onClick={copiar} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 font-semibold text-on-brand hover:bg-brand-strong">
          <Icono nombre={copiado === 'si' ? 'check' : 'copiar'} className="h-5 w-5" />
          {copiado === 'si' ? 'Copiado' : copiado === 'manual' ? 'Texto seleccionado: usa Copiar' : 'Copiar texto'}
        </button>
        {!enMarco && (
          <button onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 font-semibold text-ink hover:bg-surface-2">
            <Icono nombre="documento" className="h-5 w-5" /> Imprimir o guardar PDF
          </button>
        )}
      </div>

      {vista === 'oral' ? (
        <article className="linea-margen rounded-xl border border-line bg-surface py-6 pl-8 pr-6 sm:py-8 sm:pl-12 sm:pr-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Para presentar en la visita · 1 a 2 minutos</p>
          <p id="texto-redactado" className="mt-3 max-w-[68ch] font-display text-[19px] leading-relaxed text-ink">{oral}</p>
          <p className="mt-5 text-xs text-ink-faint">Orden: identificación, motivo, enfermedad actual, antecedentes pertinentes, positivos y negativos, examen, impresión y plan. Léela en voz alta y ajústala a tu estilo.</p>
        </article>
      ) : (
      <article className="linea-margen rounded-xl border border-line bg-surface py-6 pl-8 pr-6 sm:py-8 sm:pl-12 sm:pr-10">
        <div className="mb-5 flex items-baseline justify-between gap-3 border-b border-line pb-4">
          <p className="font-display text-2xl font-semibold text-ink">Historia clínica · Medicina interna</p>
          <p className="cifra text-sm text-ink-faint">{new Date().toLocaleDateString('es-EC')}</p>
        </div>
        <div id="texto-redactado" className="grid gap-5 text-[15px] leading-relaxed">
          {bloques.map((b, i) => (
            <div key={i} className={b.t === 'SIGNOS DE ALARMA' ? 'rounded-lg bg-alarm-soft p-4' : b.t === 'RESUMEN' ? 'rounded-lg bg-margen p-4' : ''}>
              <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${b.t === 'SIGNOS DE ALARMA' ? 'text-alarm' : 'text-ink-soft'}`}>{b.t}</p>
              <div className="mt-1 whitespace-pre-wrap text-ink">{b.resto.join('\n')}</div>
            </div>
          ))}
        </div>
        <p className="mt-8 border-t border-line pt-4 text-xs text-ink-faint">Firma y sello del profesional: ________________________</p>
      </article>
      )}
      {(onNueva || onInicio) && (
        <div className="no-imprimir flex flex-wrap items-center gap-2 border-t border-line pt-5">
          <p className="mr-auto text-sm text-ink-soft">¿Terminaste? Copia el texto y revísalo antes de firmar.</p>
          {onInicio && <button onClick={onInicio} className="min-h-11 rounded-xl px-4 font-medium text-ink-soft hover:bg-surface-2">Volver al inicio</button>}
          {onNueva && <button onClick={onNueva} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 font-semibold text-ink hover:border-brand/60"><Icono nombre="mas" className="h-4 w-4" /> Empezar otra historia</button>}
        </div>
      )}
    </section>
  )
}

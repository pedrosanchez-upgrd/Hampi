import { useState } from 'react'
import { SINTOMAS } from '../data/sintomas'
import { abrirSintoma, cerrarSintoma, sintomasAbiertos, type Historia } from '../lib/historia'
import { hallazgosAutomaticos, hallazgosDeSintoma } from '../lib/motor'
import { preguntarEnPractica, respuestaDe } from '../data/casosPractica'
import { Icono } from './Icono'

interface Props {
  historia: Historia
  setHistoria: (f: (h: Historia) => Historia) => void
}

const SISTEMAS = [...new Set(SINTOMAS.map((s) => s.sistema))]

function Casilla({ marcada, onCambio, texto, tono }: { marcada: boolean; onCambio: (v: boolean) => void; texto: string; tono: 'brand' | 'alarm' }) {
  return (
    <label className={`flex min-h-11 cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 text-[15px] leading-snug transition-colors ${
      marcada && tono === 'alarm' ? 'bg-alarm-soft' : 'hover:bg-surface-2'}`}>
      <input type="checkbox" className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${tono === 'alarm' ? 'accent-[var(--alarm)]' : 'accent-[var(--brand)]'}`}
        checked={marcada} onChange={(e) => onCambio(e.target.checked)} />
      <span className={marcada ? (tono === 'alarm' ? 'font-semibold text-alarm' : 'text-ink-faint line-through decoration-ink-faint/50') : 'text-ink'}>{texto}</span>
    </label>
  )
}

export function PestanasSintomas({ historia, setHistoria }: Props) {
  const abiertos = sintomasAbiertos(historia)
  const [elegido, setElegido] = useState<string | null>(null)
  const activo = abiertos.includes(elegido ?? '') ? elegido! : abiertos[0]
  const s = SINTOMAS.find((x) => x.id === activo)
  const sx = historia.sintomas ?? {}
  const auto = hallazgosAutomaticos(historia)
  const poner = (clave: string, valor: string) =>
    setHistoria((h) => ({ ...h, sintomas: { ...h.sintomas, [clave]: valor } }))

  return (
    <section className="linea-margen rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">Pestañas de síntoma</h3>
          <p className="text-sm text-ink-soft">Se abren solas al escribir el síntoma en el motivo o en el relato.</p>
        </div>
        <label className="relative">
          <span className="sr-only">Agregar síntoma</span>
          <select id="agregar-sintoma" className="min-h-11 appearance-none rounded-xl border border-line bg-surface-2 py-2 pl-9 pr-4 text-[15px] font-medium text-ink focus:border-brand focus:outline-none"
            value="" onChange={(e) => { const id = e.target.value; if (!id) return; setHistoria((h) => abrirSintoma(h, id)); setElegido(id) }}>
            <option value="">Agregar síntoma</option>
            {SISTEMAS.map((sis) => (
              <optgroup key={sis} label={sis}>
                {SINTOMAS.filter((x) => x.sistema === sis && !abiertos.includes(x.id)).map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
              </optgroup>
            ))}
          </select>
          <Icono nombre="mas" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
        </label>
      </div>

      {abiertos.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <Icono nombre="pulso" className="mx-auto h-8 w-8 text-ink-faint" />
          <p className="mt-2 font-medium text-ink">Todavía no hay síntomas abiertos</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">Escribe por ejemplo «dolor en el pecho» o «fiebre» en el motivo de consulta, o agrégalo con el botón de arriba.</p>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Síntomas abiertos" className="flex gap-2 overflow-x-auto px-4 pt-4 sm:px-5">
            {abiertos.map((id) => {
              const x = SINTOMAS.find((y) => y.id === id)!
              const alarmas = x.alarmas.filter((_, i) => sx[`${id}.a${i}`] === '1').length
              const sel = id === activo
              return (
                <button key={id} role="tab" aria-selected={sel} onClick={() => setElegido(id)}
                  className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors ${
                    sel ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface text-ink hover:border-brand/60'}`}>
                  {x.nombre}
                  {alarmas > 0 && <span className="cifra rounded-full bg-alarm px-1.5 text-xs text-on-alarm">{alarmas}</span>}
                </button>
              )
            })}
          </div>

          {s && (
            <div role="tabpanel" className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Preguntas · {s.nombre}</h4>
                <ul className="mt-2 grid gap-0.5">
                  {s.preguntas.map((p, i) => (
                    <li key={p}><Casilla tono="brand" texto={p} marcada={sx[`${s.id}.p${i}`] === '1'} onCambio={(v) => poner(`${s.id}.p${i}`, v ? '1' : '')} /></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-alarm">
                  <Icono nombre="alerta" className="h-4 w-4" /> Signos de alarma · ¿presentes?
                </h4>
                <ul className="mt-2 grid gap-1">
                  {s.alarmas.map((a, i) => {
                    const v = sx[`${s.id}.a${i}`] ?? ''
                    return (
                      <li key={a} className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 ${v === '1' ? 'bg-alarm-soft' : ''}`}>
                        <span className={`text-[15px] leading-snug ${v === '1' ? 'font-semibold text-alarm' : v === '0' ? 'text-ink-soft' : 'text-ink'}`}>{a}</span>
                        <span className="flex shrink-0 overflow-hidden rounded-lg border border-line text-sm" role="group" aria-label={`Alarma: ${a}`}>
                          {([['1', 'Sí'], ['0', 'No']] as const).map(([val, t]) => (
                            <button key={val} aria-pressed={v === val} onClick={() => poner(`${s.id}.a${i}`, v === val ? '' : val)}
                              className={`min-h-10 min-w-11 px-2.5 font-medium transition-colors ${v === val
                                ? val === '1' ? 'bg-alarm text-on-alarm' : 'bg-surface-2 font-semibold text-ink' : 'bg-surface text-ink-faint hover:bg-surface-2/60'}`}>
                              {t}
                            </button>
                          ))}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                <p className="mt-1.5 px-2 text-xs text-ink-faint">Los que marques «No» salen en la redacción como negativos pertinentes.</p>
              </div>

              {hallazgosDeSintoma(s.id).length > 0 && (
                <div className="lg:col-span-2">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Hallazgos clave · alimentan los diagnósticos en vivo</h4>
                  <ul className="mt-2 divide-y divide-line overflow-hidden rounded-xl border border-line">
                    {hallazgosDeSintoma(s.id).map((hz) => {
                      const manual = historia.hallazgos?.[hz.id] ?? ''
                      const valor = manual || auto[hz.id] || ''
                      // Modo práctica: el paciente responde solo cuando se le pregunta (o se le examina).
                      if (historia.practica?.caso && !hz.automatico) {
                        const r = respuestaDe(historia, hz.id)
                        return (
                          <li key={hz.id} className="grid gap-1.5 px-3 py-2.5 sm:px-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="min-w-0 flex-[1_1_14rem] text-[15px] text-ink">{hz.texto}</span>
                              {r ? (
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${r.estado === 'si' ? 'bg-brand-soft text-brand-strong' : 'bg-surface-2 text-ink-soft'}`}>{r.estado === 'si' ? 'Sí' : 'No'}</span>
                              ) : (
                                <button className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-brand hover:bg-brand-soft"
                                  onClick={() => setHistoria((h) => preguntarEnPractica(h, hz.id))}>
                                  <Icono nombre="mensaje" className="h-4 w-4" /> Preguntar o examinar
                                </button>
                              )}
                            </div>
                            {r && <p className="font-display text-[16px] italic text-ink-soft">«{r.dice}»</p>}
                          </li>
                        )
                      }
                      return (
                        <li key={hz.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2.5 sm:px-4">
                          <span className="min-w-0 flex-1 text-[15px] text-ink">
                            {hz.texto}
                            {hz.automatico && !manual && (
                              <span className="ml-1.5 inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-soft">
                                {auto[hz.id] ? 'automático' : hz.automatico.toLowerCase()}
                              </span>
                            )}
                          </span>
                          <span className="flex shrink-0 overflow-hidden rounded-lg border border-line text-sm" role="group" aria-label={hz.texto}>
                            {([['si', 'Sí'], ['no', 'No'], ['', '?']] as const).map(([v, t]) => (
                              <button key={t} aria-pressed={valor === v}
                                className={`min-h-10 min-w-12 px-3 font-medium transition-colors ${valor === v
                                  ? v === 'si' ? 'bg-brand text-on-brand' : v === 'no' ? 'bg-surface-2 font-semibold text-ink' : 'bg-surface text-ink-soft'
                                  : 'bg-surface text-ink-faint hover:bg-surface-2/60'}`}
                                onClick={() => setHistoria((h) => ({ ...h, hallazgos: { ...h.hallazgos, [hz.id]: v } }))}>
                                {t}
                              </button>
                            ))}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              <div className="lg:col-span-2">
                <label htmlFor={`notas-${s.id}`} className="mb-1.5 block text-sm font-medium text-ink">Hallazgos de esta pestaña (texto libre)</label>
                <textarea id={`notas-${s.id}`} rows={3}
                  className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 leading-relaxed text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
                  value={sx[`${s.id}.notas`] ?? ''} onChange={(e) => poner(`${s.id}.notas`, e.target.value)} />
                <button className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-soft hover:text-alarm" onClick={() => setHistoria((h) => cerrarSintoma(h, s.id))}>
                  <Icono nombre="cerrar" className="h-4 w-4" /> Cerrar la pestaña «{s.nombre}»
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

import { EPIDEMIOLOGICOS, FAMILIARES, PARENTESCOS, PATOLOGICOS, type Antecedente } from '../data/antecedentes'
import type { Historia } from '../lib/historia'
import { Icono } from './Icono'

interface Props {
  historia: Historia
  setHistoria: (f: (h: Historia) => Historia) => void
}

const poner = (setHistoria: Props['setHistoria'], cambios: Record<string, string>) =>
  setHistoria((h) => ({ ...h, antecedentes: { ...h.antecedentes, ...cambios } }))

function SiNo({ valor, onCambio, etiqueta }: { valor: string; onCambio: (v: string) => void; etiqueta: string }) {
  return (
    <span className="flex shrink-0 overflow-hidden rounded-lg border border-line text-sm" role="group" aria-label={etiqueta}>
      {([['si', 'Sí'], ['no', 'No']] as const).map(([v, t]) => (
        <button key={v} aria-pressed={valor === v} onClick={() => onCambio(valor === v ? '' : v)}
          className={`min-h-10 min-w-12 px-3 font-medium transition-colors ${valor === v
            ? v === 'si' ? 'bg-brand text-on-brand' : 'bg-surface-2 font-semibold text-ink' : 'bg-surface text-ink-faint hover:bg-surface-2/60'}`}>
          {t}
        </button>
      ))}
    </span>
  )
}

/** Lista Sí/No con detalle cuando la respuesta es Sí. `prefijo` = «p» (patológicos) o «e» (epidemiológicos). */
function ListaSiNo({ items, prefijo, historia, setHistoria }: { items: Antecedente[]; prefijo: string } & Props) {
  const a = historia.antecedentes ?? {}
  const grupos = [...new Set(items.map((x) => x.grupo))]
  const sinResponder = items.filter((x) => !a[`${prefijo}.${x.id}`])
  return (
    <div className="grid gap-4">
      {grupos.map((g) => (
        <div key={g}>
          {grupos.length > 1 && <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">{g}</h4>}
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {items.filter((x) => x.grupo === g).map((x) => {
              const v = a[`${prefijo}.${x.id}`] ?? ''
              return (
                <li key={x.id} className={`px-3 py-2.5 sm:px-4 ${v === 'si' ? 'bg-brand-soft/40' : ''}`}>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <span className="min-w-0 flex-1 text-[15px] text-ink">
                      {x.nombre}
                      {x.hallazgo && <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-ink-soft" title="Este dato también cuenta en los diagnósticos en vivo"><Icono nombre="pulso" className="h-3 w-3" />diagnósticos</span>}
                    </span>
                    <SiNo etiqueta={x.nombre} valor={v} onCambio={(nv) => poner(setHistoria, { [`${prefijo}.${x.id}`]: nv })} />
                  </div>
                  {v === 'si' && (
                    <input aria-label={`Detalle: ${x.nombre}`} placeholder={x.detalle ?? 'Detalle (año, tratamiento)'}
                      className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
                      value={a[`${prefijo}.${x.id}.det`] ?? ''} onChange={(e) => poner(setHistoria, { [`${prefijo}.${x.id}.det`]: e.target.value })} />
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      {sinResponder.length > 0 && (
        <button className="inline-flex min-h-10 w-fit items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-brand hover:bg-brand-soft"
          onClick={() => poner(setHistoria, Object.fromEntries(sinResponder.map((x) => [`${prefijo}.${x.id}`, 'no'])))}>
          <Icono nombre="check" className="h-4 w-4" /> Marcar «No» en los {sinResponder.length} sin responder
        </button>
      )}
    </div>
  )
}

export function AntecedentesPersonales(props: Props) {
  return (
    <div className="grid gap-5">
      <section className="linea-margen rounded-xl border border-line bg-surface py-4 pl-6 pr-4 sm:py-5 sm:pl-8 sm:pr-6">
        <h3 className="font-display text-base font-semibold text-ink">Enfermedades previas</h3>
        <p className="mb-4 mt-0.5 text-sm text-ink-soft">Pregunta una por una. Las marcadas con <span className="font-medium">diagnósticos</span> también ordenan la lista en vivo.</p>
        <ListaSiNo items={PATOLOGICOS} prefijo="p" {...props} />
      </section>
      <section className="linea-margen rounded-xl border border-line bg-surface py-4 pl-6 pr-4 sm:py-5 sm:pl-8 sm:pr-6">
        <h3 className="font-display text-base font-semibold text-ink">Antecedentes epidemiológicos</h3>
        <p className="mb-4 mt-0.5 text-sm text-ink-soft">Factores de Ecuador que cambian el diagnóstico (dengue, malaria, tuberculosis, Chagas).</p>
        <ListaSiNo items={EPIDEMIOLOGICOS} prefijo="e" {...props} />
      </section>
    </div>
  )
}

export function AntecedentesFamiliares({ historia, setHistoria }: Props) {
  const a = historia.antecedentes ?? {}
  const ninguno = a['f.ninguno'] === 'si'
  const grupos = [...new Set(FAMILIARES.map((x) => x.grupo))]
  return (
    <section className="linea-margen rounded-xl border border-line bg-surface py-4 pl-6 pr-4 sm:py-5 sm:pl-8 sm:pr-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">Enfermedades en la familia</h3>
          <p className="mt-0.5 text-sm text-ink-soft">Toca el parentesco de quien la tuvo.</p>
        </div>
        <button aria-pressed={ninguno} onClick={() => poner(setHistoria, { 'f.ninguno': ninguno ? '' : 'si' })}
          className={`min-h-10 rounded-full border px-3.5 text-sm font-medium ${ninguno ? 'border-brand bg-brand text-on-brand' : 'border-line text-ink-soft hover:border-brand/60'}`}>
          Niega antecedentes familiares
        </button>
      </div>
      <div className={`mt-4 grid gap-4 ${ninguno ? 'pointer-events-none opacity-40' : ''}`}>
        {grupos.map((g) => (
          <div key={g}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">{g}</h4>
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {FAMILIARES.filter((x) => x.grupo === g).map((x) => {
                const elegidos = (a[`f.${x.id}`] ?? '').split(',').filter(Boolean)
                return (
                  <li key={x.id} className={`px-3 py-2.5 sm:px-4 ${elegidos.length ? 'bg-brand-soft/40' : ''}`}>
                    <p className="text-[15px] text-ink">{x.nombre}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={x.nombre}>
                      {PARENTESCOS.map((p) => {
                        const sel = elegidos.includes(p)
                        return (
                          <button key={p} aria-pressed={sel}
                            onClick={() => poner(setHistoria, { [`f.${x.id}`]: (sel ? elegidos.filter((y) => y !== p) : [...elegidos, p]).join(','), 'f.ninguno': '' })}
                            className={`min-h-9 rounded-full border px-3 text-sm transition-colors ${sel ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface text-ink-soft hover:border-brand/60'}`}>
                            {p}
                          </button>
                        )
                      })}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

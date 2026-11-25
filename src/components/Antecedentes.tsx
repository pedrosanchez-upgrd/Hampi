import { useState } from 'react'
import { EPIDEMIOLOGICOS, FAMILIARES, PARENTESCOS, PATOLOGICOS, type Antecedente } from '../data/antecedentes'
import type { Historia } from '../lib/historia'
import { Icono } from './Icono'

interface Props {
  historia: Historia
  setHistoria: (f: (h: Historia) => Historia) => void
}

const poner = (setHistoria: Props['setHistoria'], cambios: Record<string, string>) =>
  setHistoria((h) => ({ ...h, antecedentes: { ...h.antecedentes, ...cambios } }))

const SIGUIENTE: Record<string, string> = { '': 'si', si: 'no', no: '' }
const ESTADO: Record<string, string> = { '': 'sin responder', si: 'sí', no: 'no' }

/** Ficha de un toque: vacía → Sí → No → vacía. */
function Ficha({ texto, valor, onCambio, motor }: { texto: string; valor: string; onCambio: (v: string) => void; motor?: boolean }) {
  return (
    <button type="button" onClick={() => onCambio(SIGUIENTE[valor] ?? '')} aria-label={`${texto}: ${ESTADO[valor]}. Tocar para cambiar`}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[15px] transition-colors ${
        valor === 'si' ? 'border-brand bg-brand text-on-brand'
          : valor === 'no' ? 'border-line bg-surface-2 text-ink-faint line-through decoration-ink-faint/60'
            : 'border-line bg-surface text-ink hover:border-brand/60'}`}>
      {valor === 'si' && <Icono nombre="check" className="h-4 w-4" />}
      {valor === 'no' && <Icono nombre="cerrar" className="h-3.5 w-3.5" />}
      {texto}
      {motor && <span className={`h-1.5 w-1.5 rounded-full ${valor === 'si' ? 'bg-on-brand' : 'bg-brand'}`} aria-hidden title="También cuenta en los diagnósticos" />}
    </button>
  )
}

/** Fichas Sí/No por grupo, con detalle solo para las marcadas «Sí». `prefijo` = «p» (patológicos) o «e» (epidemiológicos). */
function ListaSiNo({ items, prefijo, historia, setHistoria }: { items: Antecedente[]; prefijo: string } & Props) {
  const a = historia.antecedentes ?? {}
  const grupos = [...new Set(items.map((x) => x.grupo))]
  const sinResponder = items.filter((x) => !a[`${prefijo}.${x.id}`])
  const conSi = items.filter((x) => a[`${prefijo}.${x.id}`] === 'si')
  return (
    <div className="grid gap-4">
      {grupos.map((g) => (
        <div key={g} className={grupos.length > 1 ? 'grid gap-2 sm:grid-cols-[8.5rem_1fr] sm:items-start' : ''}>
          {grupos.length > 1 && <h4 className="pt-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">{g}</h4>}
          <div className="flex flex-wrap gap-1.5">
            {items.filter((x) => x.grupo === g).map((x) => (
              <Ficha key={x.id} texto={x.nombre} motor={!!x.hallazgo} valor={a[`${prefijo}.${x.id}`] ?? ''}
                onCambio={(nv) => poner(setHistoria, { [`${prefijo}.${x.id}`]: nv })} />
            ))}
          </div>
        </div>
      ))}
      {conSi.length > 0 && (
        <div className="grid gap-2 border-t border-rule pt-4">
          {conSi.map((x) => (
            <label key={x.id} className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center sm:gap-3">
              <span className="text-sm font-medium text-ink">{x.nombre}</span>
              <input placeholder={x.detalle ?? 'Desde cuándo, tratamiento'}
                className="min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-[16px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
                value={a[`${prefijo}.${x.id}.det`] ?? ''} onChange={(e) => poner(setHistoria, { [`${prefijo}.${x.id}.det`]: e.target.value })} />
            </label>
          ))}
        </div>
      )}
      {sinResponder.length > 0 && (
        <button className="inline-flex min-h-10 w-fit items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-brand hover:bg-brand-soft"
          onClick={() => poner(setHistoria, Object.fromEntries(sinResponder.map((x) => [`${prefijo}.${x.id}`, 'no'])))}>
          <Icono nombre="check" className="h-4 w-4" /> Niega las otras {sinResponder.length}
        </button>
      )}
    </div>
  )
}

export function AntecedentesPersonales(props: Props) {
  return (
    <div className="grid gap-5">
      <section className="linea-margen rounded-xl border border-line bg-surface py-4 pl-6 pr-4 sm:py-5 sm:pl-8 sm:pr-6">
        <h3 className="font-display text-xl font-semibold text-ink">Enfermedades previas</h3>
        <p className="mb-4 mt-0.5 text-sm text-ink-soft">Toca una vez = Sí · dos veces = No. Las que tienen <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" /> también cuentan en los diagnósticos.</p>
        <ListaSiNo items={PATOLOGICOS} prefijo="p" {...props} />
      </section>
      <section className="linea-margen rounded-xl border border-line bg-surface py-4 pl-6 pr-4 sm:py-5 sm:pl-8 sm:pr-6">
        <h3 className="font-display text-xl font-semibold text-ink">Antecedentes epidemiológicos</h3>
        <p className="mb-4 mt-0.5 text-sm text-ink-soft">Factores de Ecuador que cambian el diagnóstico (dengue, malaria, tuberculosis, Chagas).</p>
        <ListaSiNo items={EPIDEMIOLOGICOS} prefijo="e" {...props} />
      </section>
    </div>
  )
}

export function AntecedentesFamiliares({ historia, setHistoria }: Props) {
  const a = historia.antecedentes ?? {}
  const [abiertos, setAbiertos] = useState<string[]>([])
  const ninguno = a['f.ninguno'] === 'si'
  const grupos = [...new Set(FAMILIARES.map((x) => x.grupo))]
  return (
    <section className="linea-margen rounded-xl border border-line bg-surface py-4 pl-6 pr-4 sm:py-5 sm:pl-8 sm:pr-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">Enfermedades en la familia</h3>
          <p className="mt-0.5 text-sm text-ink-soft">Toca la enfermedad y luego quién la tuvo.</p>
        </div>
        <button aria-pressed={ninguno} onClick={() => poner(setHistoria, { 'f.ninguno': ninguno ? '' : 'si' })}
          className={`min-h-10 rounded-full border px-3.5 text-sm font-medium ${ninguno ? 'border-brand bg-brand text-on-brand' : 'border-line text-ink-soft hover:border-brand/60'}`}>
          Niega antecedentes familiares
        </button>
      </div>
      <div className={`mt-4 grid gap-4 ${ninguno ? 'pointer-events-none opacity-40' : ''}`}>
        {grupos.map((g) => (
          <div key={g} className="grid gap-2 sm:grid-cols-[8.5rem_1fr] sm:items-start">
            <h4 className="pt-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">{g}</h4>
            <div className="flex flex-wrap gap-1.5">
              {FAMILIARES.filter((x) => x.grupo === g).map((x) => {
                const n = (a[`f.${x.id}`] ?? '').split(',').filter(Boolean).length
                const abierto = abiertos.includes(x.id) || n > 0
                return (
                  <button key={x.id} type="button" aria-expanded={abierto} onClick={() => setAbiertos((v) => (v.includes(x.id) ? v.filter((y) => y !== x.id) : [...v, x.id]))}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[15px] transition-colors ${
                      n ? 'border-brand bg-brand text-on-brand' : abierto ? 'border-brand bg-brand-soft text-brand-strong' : 'border-line bg-surface text-ink hover:border-brand/60'}`}>
                    {n > 0 && <Icono nombre="check" className="h-4 w-4" />}{x.nombre}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {FAMILIARES.filter((x) => abiertos.includes(x.id) || (a[`f.${x.id}`] ?? '')).length > 0 && (
          <div className="grid gap-3 border-t border-rule pt-4">
            {FAMILIARES.filter((x) => abiertos.includes(x.id) || (a[`f.${x.id}`] ?? '')).map((x) => {
              const elegidos = (a[`f.${x.id}`] ?? '').split(',').filter(Boolean)
              return (
                <div key={x.id} className="grid gap-1.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center sm:gap-3">
                  <p className="text-sm font-medium text-ink">{x.nombre}: ¿quién?</p>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${x.nombre}: parentesco`}>
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
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

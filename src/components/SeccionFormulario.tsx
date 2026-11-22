import { useState, type ReactNode } from 'react'
import type { Campo, Seccion } from '../data/secciones'
import { avisoSigno, cedulaValida, imc, RANGOS } from '../lib/historia'
import { Icono } from './Icono'

interface Props {
  seccion: Seccion
  valores: Record<string, string>
  onCambio: (campoId: string, valor: string) => void
  guia: Record<string, string>
  onGuia: (clave: string, valor: string) => void
  sexo?: string
  /** Bloque que va justo después de la guía (por ejemplo los antecedentes estructurados). */
  children?: ReactNode
}

const claseInput =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-faint transition-colors focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15'

function aviso(seccionId: string, c: Campo, v: string): string | null {
  if (seccionId === 'filiacion' && c.id === 'cedula' && v.trim() && !cedulaValida(v.trim())) return 'La cédula no es válida: revise los 10 dígitos.'
  if (seccionId === 'examen') return avisoSigno(c.id, v)
  return null
}

function Entrada({ c, v, onCambio, invalido }: { c: Campo; v: string; onCambio: (v: string) => void; invalido: boolean }) {
  const id = `campo-${c.id}`
  const comun = { id, 'aria-invalid': invalido || undefined, 'aria-describedby': c.ayuda ? `${id}-ayuda` : undefined }
  if (c.tipo === 'parrafo')
    return <textarea {...comun} rows={3} className={`${claseInput} min-h-24 resize-y leading-relaxed`} value={v} onChange={(e) => onCambio(e.target.value)} />
  if (c.tipo === 'opcion') {
    // Pocas opciones: botones (un toque). Muchas: lista desplegable.
    if (c.opciones!.length <= 4)
      return (
        <div role="radiogroup" aria-labelledby={`${id}-etiqueta`} className="flex flex-wrap gap-2">
          {c.opciones!.map((o) => (
            <button key={o} type="button" role="radio" aria-checked={v === o} onClick={() => onCambio(v === o ? '' : o)}
              className={`min-h-11 rounded-xl border px-4 text-[15px] transition-colors ${
                v === o ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface text-ink hover:border-brand/60'}`}>
              {o}
            </button>
          ))}
        </div>
      )
    return (
      <select {...comun} className={claseInput} value={v} onChange={(e) => onCambio(e.target.value)}>
        <option value="">Elegir…</option>
        {c.opciones!.map((o) => <option key={o}>{o}</option>)}
      </select>
    )
  }
  return (
    <div className="relative">
      <input {...comun} className={`${claseInput} ${c.unidad ? 'pr-16' : ''} ${c.tipo === 'numero' ? 'cifra' : ''}`}
        type={c.tipo === 'fecha' ? 'date' : 'text'} inputMode={c.tipo === 'numero' ? 'decimal' : undefined}
        value={v} onChange={(e) => onCambio(e.target.value)} />
      {c.unidad && <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-ink-faint">{c.unidad}</span>}
    </div>
  )
}

/** Tarjeta de signo vital: cifra grande, unidad y estado (como un monitor). */
function SignoVital({ c, v, onCambio }: { c: Campo; v: string; onCambio: (v: string) => void }) {
  const a = avisoSigno(c.id, v)
  const r = RANGOS[c.id]
  const estado = !v.trim() ? 'vacio' : a ? 'alerta' : r ? 'normal' : 'dato'
  const id = `campo-${c.id}`
  return (
    <div className={`rounded-2xl border p-3 transition-colors ${
      estado === 'alerta' ? 'border-alarm/40 bg-alarm-soft' : estado === 'normal' ? 'border-ok/30 bg-ok-soft' : 'border-line bg-surface'}`}>
      <label htmlFor={id} className="flex items-start justify-between gap-2 text-xs font-medium text-ink-soft">
        <span>{c.etiqueta}{c.obligatorio && <span className="text-alarm"> *</span>}</span>
        {estado === 'alerta' && <span className="rounded-full bg-alarm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-alarm">{a!.split(' ').pop()}</span>}
        {estado === 'normal' && <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ok">en rango</span>}
      </label>
      <div className="mt-1 flex items-baseline gap-1.5">
        <input id={id} inputMode="decimal" value={v} onChange={(e) => onCambio(e.target.value)} placeholder="—"
          aria-invalid={estado === 'alerta' || undefined}
          className={`cifra w-full min-w-0 bg-transparent text-3xl font-semibold tracking-tight placeholder:text-ink-faint/50 focus:outline-none ${estado === 'alerta' ? 'text-alarm' : 'text-ink'}`} />
        <span className="shrink-0 text-sm text-ink-faint">{c.unidad}</span>
      </div>
    </div>
  )
}

function Guia({ seccion, guia, onGuia }: Pick<Props, 'seccion' | 'guia' | 'onGuia'>) {
  const [abierta, setAbierta] = useState(true)
  const hechas = seccion.guia.filter((_, i) => guia[`${seccion.id}.${i}`] === '1').length
  return (
    <section className="rounded-2xl border border-line bg-surface shadow-card">
      <button className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setAbierta(!abierta)} aria-expanded={abierta}>
        <span className="flex items-center gap-2.5 font-semibold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand"><Icono nombre="mensaje" className="h-4 w-4" /></span>
          Qué preguntar
        </span>
        <span className="flex items-center gap-2 text-sm text-ink-soft">
          <span className={`cifra rounded-full px-2 py-0.5 text-xs font-semibold ${hechas === seccion.guia.length ? 'bg-ok-soft text-ok' : 'bg-surface-2 text-ink-soft'}`}>{hechas}/{seccion.guia.length}</span>
          <Icono nombre="flecha" className={`h-4 w-4 transition-transform ${abierta ? 'rotate-90' : ''}`} />
        </span>
      </button>
      {abierta && (
        <ul className="grid gap-1 px-2 pb-3 sm:grid-cols-2">
          {seccion.guia.map((g, i) => {
            const clave = `${seccion.id}.${i}`
            const hecha = guia[clave] === '1'
            return (
              <li key={i}>
                <label className="flex min-h-11 cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 text-[15px] leading-snug hover:bg-surface/60">
                  <input type="checkbox" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--brand)]" checked={hecha}
                    onChange={(e) => onGuia(clave, e.target.checked ? '1' : '')} />
                  <span className={hecha ? 'text-ink-faint line-through decoration-ink-faint/50' : 'text-ink'}>{g}</span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export function SeccionFormulario({ seccion, valores, onCambio, guia, onGuia, sexo, children }: Props) {
  const grupos: { titulo?: string; campos: Campo[] }[] = []
  for (const c of seccion.campos.filter((x) => !x.soloSexo || x.soloSexo === sexo)) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.titulo === c.grupo) ultimo.campos.push(c)
    else grupos.push({ titulo: c.grupo, campos: [c] })
  }
  const i = seccion.id === 'examen' ? imc(Number(valores.peso), Number(valores.talla)) : null

  return (
    <div className="grid gap-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Paso {seccion.numero} de 10</p>
        <h2 className="mt-0.5 font-display text-[28px] font-bold leading-tight tracking-tight text-ink">{seccion.titulo}</h2>
        <p className="mt-1 text-ink-soft">{seccion.descripcion}</p>
      </header>

      <Guia seccion={seccion} guia={guia} onGuia={onGuia} />
      {children}

      {grupos.map((g, gi) => (
        <section key={gi} className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
          {g.titulo && <h3 className="mb-4 font-display text-base font-bold text-ink">{g.titulo}</h3>}
          {g.titulo === 'Signos vitales' ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {g.campos.filter((c) => c.tipo === 'numero').map((c) => (
                  <SignoVital key={c.id} c={c} v={valores[c.id] ?? ''} onCambio={(nv) => onCambio(c.id, nv)} />
                ))}
                {i !== null && (
                  <div className="rounded-2xl border border-line bg-surface-2 p-3">
                    <p className="text-xs font-medium text-ink-soft">IMC (calculado)</p>
                    <p className="cifra mt-1 text-3xl font-semibold tracking-tight text-ink">{String(i).replace('.', ',')}<span className="ml-1.5 text-sm font-normal text-ink-faint">kg/m²</span></p>
                  </div>
                )}
              </div>
              {g.campos.filter((c) => c.tipo !== 'numero').map((c) => (
                <div key={c.id} className="mt-4">
                  <p id={`campo-${c.id}-etiqueta`} className="mb-1.5 text-sm font-medium text-ink">{c.etiqueta}</p>
                  <Entrada c={c} v={valores[c.id] ?? ''} onCambio={(nv) => onCambio(c.id, nv)} invalido={false} />
                </div>
              ))}
              <p className="mt-3 text-xs text-ink-faint">Rangos de aviso provisionales (adulto), pendientes de revisión médica; la saturación se ajustará a la altura de Cuenca.</p>
            </>
          ) : (
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              {g.campos.map((c) => {
                const v = valores[c.id] ?? ''
                const a = aviso(seccion.id, c, v)
                const ancho = c.tipo === 'parrafo' || (c.tipo === 'opcion' && (c.opciones?.length ?? 0) > 3 && (c.opciones?.length ?? 0) <= 4)
                return (
                  <div key={c.id} className={ancho ? 'sm:col-span-2' : ''}>
                    {c.tipo === 'opcion' && (c.opciones?.length ?? 0) <= 4 ? (
                      <p id={`campo-${c.id}-etiqueta`} className="mb-1.5 text-sm font-medium text-ink">
                        {c.etiqueta}{c.obligatorio && <span className="text-alarm"> *</span>}
                      </p>
                    ) : (
                      <label htmlFor={`campo-${c.id}`} className="mb-1.5 block text-sm font-medium text-ink">
                        {c.etiqueta}{c.obligatorio && <span className="text-alarm"> *</span>}
                      </label>
                    )}
                    <Entrada c={c} v={v} onCambio={(nv) => onCambio(c.id, nv)} invalido={!!a} />
                    {c.rapido && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {c.rapido.map((r) => (
                          <button key={r} type="button" aria-pressed={v === r} onClick={() => onCambio(c.id, v === r ? '' : r)}
                            className={`min-h-8 rounded-full border px-3 text-sm transition-colors ${v === r ? 'border-brand bg-brand-soft font-medium text-brand-strong' : 'border-line text-ink-soft hover:border-brand/60'}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                    {c.ayuda && <p id={`campo-${c.id}-ayuda`} className="mt-1.5 text-xs text-ink-faint">{c.ayuda}</p>}
                    {a && <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-alarm"><Icono nombre="alerta" className="h-4 w-4" />{a}</p>}
                  </div>
                )
              })}
              {g.titulo === 'Hábitos' && Number(valores.tabacoCig) > 0 && Number(valores.tabacoAnios) > 0 && (
                <p className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm text-ink sm:col-span-2">
                  Índice tabáquico: <span className="cifra font-semibold">{String(Math.round((Number(valores.tabacoCig) * Number(valores.tabacoAnios)) / 2) / 10).replace('.', ',')}</span> paquetes/año
                </p>
              )}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

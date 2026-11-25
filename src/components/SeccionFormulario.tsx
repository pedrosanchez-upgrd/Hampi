import { useRef, useState, type ReactNode } from 'react'
import type { Campo, Seccion } from '../data/secciones'
import { avisoSigno, cedulaValida, imc, RANGOS, type Historia } from '../lib/historia'
import { sugerenciasPara, type Sugerencia } from '../data/redaccionAyuda'
import { abreviaturasEn, escribirCompleto } from '../data/abreviaturas'
import { agregarDictado, useDictado } from '../lib/dictado'
import { terminosPara, usarTermino } from '../lib/terminos'
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
  /** Historia completa, para armar sugerencias de redacción. */
  historia?: Historia
}

const claseInput =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-faint transition-colors focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15'

function aviso(seccionId: string, c: Campo, v: string): string | null {
  if (seccionId === 'filiacion' && c.id === 'cedula' && v.trim() && !cedulaValida(v.trim())) return 'La cédula no es válida: revisa los 10 dígitos.'
  if (c.tipo === 'numero' && v.trim() && Number.isNaN(Number(v.trim().replace(',', '.')))) return 'Escribe solo el número (por ejemplo 36,8).'
  if (c.id === 'edad' && v.trim() && (Number(v) < 0 || Number(v) > 120)) return 'Revisa la edad: debe estar entre 0 y 120 años.'
  if (c.id === 'intensidad' && v.trim() && (Number(v) < 0 || Number(v) > 10)) return 'La intensidad va de 0 a 10.'
  if (seccionId === 'examen') return avisoSigno(c.id, v)
  return null
}

function Entrada({ c, v, onCambio, invalido }: { c: Campo; v: string; onCambio: (v: string) => void; invalido: boolean }) {
  const id = `campo-${c.id}`
  const comun = { id, 'aria-invalid': invalido || undefined, 'aria-describedby': c.ayuda ? `${id}-ayuda` : undefined }
  if (c.tipo === 'parrafo') return <Parrafo comun={comun} v={v} onCambio={onCambio} etiqueta={c.corto ?? c.etiqueta} />
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

/** Campo de párrafo con dictado por voz (si el navegador lo permite). */
function Parrafo({ comun, v, onCambio, etiqueta }: { comun: Record<string, unknown>; v: string; onCambio: (v: string) => void; etiqueta: string }) {
  const actual = useRef(v)
  actual.current = v
  const d = useDictado((t) => onCambio(agregarDictado(actual.current, t)))
  return (
    <div>
      <div className="relative">
        <textarea {...comun} rows={3} className={`${claseInput} min-h-24 resize-y leading-relaxed ${d.disponible ? 'pr-14' : ''}`} value={v} onChange={(e) => onCambio(e.target.value)} />
        {d.disponible && (
          <button type="button" onClick={d.alternar} aria-pressed={d.escuchando} aria-label={d.escuchando ? `Detener dictado en ${etiqueta}` : `Dictar ${etiqueta}`}
            className={`absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${d.escuchando ? 'bg-alarm text-on-alarm' : 'bg-surface-2 text-ink-soft hover:bg-brand-soft hover:text-brand-strong'}`}>
            <Icono nombre="microfono" className="h-5 w-5" />
          </button>
        )}
      </div>
      {d.escuchando && <p className="mt-1.5 text-sm font-medium text-alarm" role="status">Escuchando… di «coma», «punto y seguido» o «punto y aparte». Toca el micrófono para terminar.</p>}
      {d.error && <p className="mt-1.5 text-sm text-warn" role="status">{d.error}</p>}
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
  const [abierta, setAbierta] = useState(false)
  const hechas = seccion.guia.filter((_, i) => guia[`${seccion.id}.${i}`] === '1').length
  const siguiente = seccion.guia.findIndex((_, i) => guia[`${seccion.id}.${i}`] !== '1')
  const marcar = (i: number, v: boolean) => onGuia(`${seccion.id}.${i}`, v ? '1' : '')
  return (
    <section aria-label="Guion de la entrevista" className="rounded-xl border border-line bg-margen/70 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-brand-strong">
          <Icono nombre="mensaje" className="h-4 w-4" /> {siguiente < 0 ? 'Guion completo' : 'Pregunta ahora'}
          <span className="cifra text-xs font-normal text-ink-faint">{hechas}/{seccion.guia.length}</span>
        </p>
        <button className="min-h-10 text-sm font-medium text-brand" onClick={() => setAbierta(!abierta)} aria-expanded={abierta}>
          {abierta ? 'Ver menos' : 'Ver todo el guion'}
        </button>
      </div>
      {!abierta && siguiente >= 0 && (
        <label className="mt-1 flex min-h-11 cursor-pointer items-start gap-3 py-1 leading-snug">
          <input type="checkbox" className="mt-1 h-[18px] w-[18px] shrink-0 accent-[var(--brand)]" checked={false} onChange={() => marcar(siguiente, true)} />
          <span className="font-display text-[18px] text-ink">{seccion.guia[siguiente]}</span>
        </label>
      )}
      {!abierta && siguiente < 0 && <p className="mt-1 text-sm text-ok">Preguntaste todo lo del guion de este apartado.</p>}
      {abierta && (
        <ol className="mt-1 grid gap-x-6 sm:grid-cols-2">
          {seccion.guia.map((g, i) => {
            const hecha = guia[`${seccion.id}.${i}`] === '1'
            return (
              <li key={i}>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1.5 leading-snug">
                  <input type="checkbox" className="mt-1 h-[18px] w-[18px] shrink-0 accent-[var(--brand)]" checked={hecha} onChange={(e) => marcar(i, e.target.checked)} />
                  <span className={`font-display text-[17px] ${hecha ? 'text-ink-faint line-through decoration-ink-faint/50' : 'text-ink'}`}>{g}</span>
                </label>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

/** Sugerencias de redacción debajo del campo: un toque para usarlas. */
/** Términos de semiología mientras se escribe en el campo (solo con el campo activo). */
function Terminos({ v, terminos, onCambio }: { v: string; terminos: string[]; onCambio: (v: string) => void }) {
  const lista = terminosPara(v, terminos)
  if (!lista.length) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Opciones para escribir">
      {lista.map(({ termino, completa }) => (
        <button key={termino} type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => onCambio(usarTermino(v, termino, completa))}
          className={`inline-flex min-h-9 items-center rounded-full border px-3 text-sm transition-colors ${completa ? 'border-brand bg-brand-soft font-medium text-brand-strong' : 'border-line bg-surface text-ink-soft hover:border-brand/60'}`}>
          {termino}
        </button>
      ))}
    </div>
  )
}

/** Aviso suave cuando el texto tiene abreviaturas: un toque las escribe completas. */
function Abreviaturas({ valor, onUsar }: { valor: string; onUsar: (t: string) => void }) {
  const ab = abreviaturasEn(valor)
  if (!ab.length) return null
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">
      <span className="text-ink-soft">
        <span className="font-medium text-ink">Mejor sin abreviaturas: </span>
        {ab.map((a) => `${a.abrev} → ${a.completo}`).join(' · ')}
      </span>
      <button type="button" onClick={() => onUsar(escribirCompleto(valor))}
        className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-brand/40 bg-surface px-2.5 text-sm font-semibold text-brand-strong hover:bg-brand-soft">
        <Icono nombre="check" className="h-3.5 w-3.5" /> Escribir completo
      </button>
    </div>
  )
}

function Sugerencias({ lista, valor, onUsar, aviso }: { lista: Sugerencia[]; valor: string; onUsar: (t: string) => void; aviso?: string }) {
  if (!lista.length) return null
  const v = valor.trim()
  const cortas = lista.filter((x) => x.texto.length <= 45 && x.etiqueta === x.texto)
  const largas = lista.filter((x) => !cortas.includes(x))
  const agregar = (t: string) => onUsar(v ? `${v}${v.endsWith('.') || t.includes('\n') ? '\n' : '; '}${t}` : t)
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {cortas.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-ink-faint">Sugerencias:</span>
          {cortas.map((x) => {
            const usado = v.toLowerCase().includes(x.texto.toLowerCase())
            return (
              <button key={x.texto} type="button" disabled={usado} onClick={() => agregar(x.texto)}
                className="inline-flex min-h-10 items-center gap-1 rounded-full border border-brand/30 bg-brand-soft/40 px-3 text-sm text-brand-strong hover:bg-brand-soft disabled:border-line disabled:bg-transparent disabled:text-ink-faint">
                <Icono nombre={usado ? 'check' : 'mas'} className="h-3.5 w-3.5" />{x.texto}
              </button>
            )
          })}
        </div>
      )}
      {largas.map((x) => <SugerenciaLarga key={x.etiqueta} x={x} v={v} onUsar={onUsar} agregar={agregar} aviso={aviso} />)}
    </div>
  )
}

/** Sugerencia larga plegada en una línea; un toque la abre. */
function SugerenciaLarga({ x, v, onUsar, agregar, aviso }: { x: Sugerencia; v: string; onUsar: (t: string) => void; agregar: (t: string) => void; aviso?: string }) {
  const [abierta, setAbierta] = useState(false)
  const [previo, setPrevio] = useState<string | null>(null)
  const usado = v.includes(x.texto)
  if (usado)
    return (
      <p className="inline-flex min-h-10 flex-wrap items-center gap-x-2 text-sm text-ok">
        <span className="inline-flex items-center gap-1"><Icono nombre="check" className="h-4 w-4" /> Sugerencia usada · {x.etiqueta}</span>
        {previo !== null && (
          <button type="button" className="min-h-10 rounded-lg px-2 font-semibold text-brand hover:bg-brand-soft" onClick={() => { onUsar(previo); setPrevio(null) }}>
            Deshacer
          </button>
        )}
      </p>
    )
  if (!abierta)
    return (
      <button type="button" onClick={() => setAbierta(true)} aria-expanded={false}
        className="inline-flex min-h-9 w-fit max-w-full items-center gap-1.5 rounded-full border border-dashed border-brand/40 px-3 text-left text-sm text-brand-strong hover:bg-brand-soft/50">
        <Icono nombre="libro" className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Sugerencia: {x.etiqueta.charAt(0).toLowerCase() + x.etiqueta.slice(1)}</span>
      </button>
    )
  return (
    <div className="rounded-xl border border-dashed border-brand/35 bg-brand-soft/25 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-strong"><Icono nombre="libro" className="h-3.5 w-3.5" /> Sugerencia · {x.etiqueta}</p>
        <button type="button" onClick={() => setAbierta(false)} className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-surface-2" aria-label="Cerrar sugerencia"><Icono nombre="cerrar" className="h-4 w-4" /></button>
      </div>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{x.texto}</p>
      {aviso && x.etiqueta !== 'Formato' && <p className="mt-1 text-xs text-ink-faint">{aviso}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setPrevio(v); onUsar(x.texto) }} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-brand px-3 text-sm font-semibold text-on-brand hover:bg-brand-strong">
          {v ? 'Reemplazar con esta' : 'Usar este texto'}
        </button>
        {v && !/^niega\.?$/i.test(v) && <button type="button" onClick={() => { setPrevio(v); agregar(x.texto) }} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-ink hover:border-brand/60">Agregar al final</button>}
      </div>
    </div>
  )
}

export function SeccionFormulario({ seccion, valores, onCambio, guia, onGuia, sexo, children, historia }: Props) {
  const [foco, setFoco] = useState<string | null>(null)
  const grupos: { titulo?: string; campos: Campo[] }[] = []
  for (const c of seccion.campos.filter((x) => !x.soloSexo || x.soloSexo === sexo)) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.titulo === c.grupo) ultimo.campos.push(c)
    else grupos.push({ titulo: c.grupo, campos: [c] })
  }
  const i = seccion.id === 'examen' ? imc(Number(valores.peso), Number(valores.talla)) : null

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <header className="flex items-start gap-4">
        <span aria-hidden className="font-display text-[56px] font-semibold leading-[0.9] text-brand/75 sm:text-[72px]">{String(seccion.numero).padStart(2, '0')}</span>
        <div className="min-w-0 pt-1">
          <h2 className="font-display text-[30px] font-semibold leading-tight text-ink sm:text-[34px]">{seccion.titulo}</h2>
          <p className="mt-1 text-ink-soft">{seccion.descripcion}</p>
        </div>
      </header>

      <Guia seccion={seccion} guia={guia} onGuia={onGuia} />
      {children}

      <section className="linea-margen grid gap-7 rounded-xl border border-line bg-surface py-5 pl-6 pr-4 sm:py-6 sm:pl-8 sm:pr-6">
      {grupos.map((g, gi) => (
        <div key={gi}>
          {g.titulo && <h3 className="mb-4 border-b border-rule pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{g.titulo}</h3>}
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
                  <div key={c.id} className={ancho ? 'sm:col-span-2' : ''}
                    onFocusCapture={() => setFoco(c.id)} onBlurCapture={() => setTimeout(() => setFoco((f) => (f === c.id ? null : f)), 120)}>
                    {c.tipo === 'opcion' && (c.opciones?.length ?? 0) <= 4 ? (
                      <p id={`campo-${c.id}-etiqueta`} className="mb-1.5 text-sm font-medium text-ink">
                        {c.etiqueta}{c.obligatorio && <span className="text-alarm"> *</span>}
                      </p>
                    ) : (
                      <label htmlFor={`campo-${c.id}`} className={`mb-1.5 block text-sm font-medium text-ink ${g.campos.some((x) => x.pregunta) && !ancho ? 'sm:min-h-[4.25rem]' : ''}`}>
                        {c.etiqueta}{c.obligatorio && <span className="text-alarm"> *</span>}
                        {c.pregunta && <span className="mt-0.5 block font-display text-[15px] font-normal italic leading-snug text-ink-soft">«{c.pregunta}»</span>}
                      </label>
                    )}
                    <Entrada c={c} v={v} onCambio={(nv) => onCambio(c.id, nv)} invalido={!!a} />
                    {c.terminos && foco === c.id && <Terminos v={v} terminos={c.terminos} onCambio={(nv) => onCambio(c.id, nv)} />}
                    {c.rapido && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {c.rapido.map((r) => (
                          <button key={r} type="button" aria-pressed={v === r} onClick={() => onCambio(c.id, v === r ? '' : r)}
                            className={`min-h-10 rounded-full border px-3 text-sm transition-colors ${v === r ? 'border-brand bg-brand-soft font-medium text-brand-strong' : 'border-line text-ink-soft hover:border-brand/60'}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                    {c.ayuda && <p id={`campo-${c.id}-ayuda`} className="mt-1.5 text-xs text-ink-faint">{c.ayuda}</p>}
                    {historia && (c.tipo === 'parrafo' || c.tipo === 'texto') && (
                      <Sugerencias lista={sugerenciasPara(seccion.id, c.id, historia)} valor={v} onUsar={(t) => onCambio(c.id, t)}
                        aviso={seccion.id === 'examen' ? 'Úsala solo si examinaste esta región y la encontraste normal.' : seccion.id === 'sistemas' ? 'Úsala solo si preguntaste cada una de estas cosas.' : undefined} />
                    )}
                    {(c.tipo === 'parrafo' || c.tipo === 'texto') && seccion.id !== 'motivo' && <Abreviaturas valor={v} onUsar={(t) => onCambio(c.id, t)} />}
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
        </div>
      ))}
      </section>
    </div>
  )
}

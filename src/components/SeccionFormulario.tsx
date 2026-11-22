import { useState } from 'react'
import type { Campo, Seccion } from '../data/secciones'
import { avisoSigno, cedulaValida, imc } from '../lib/historia'

interface Props {
  seccion: Seccion
  valores: Record<string, string>
  onCambio: (campoId: string, valor: string) => void
}

const claseInput =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20'

function aviso(seccionId: string, c: Campo, v: string): string | null {
  if (seccionId === 'filiacion' && c.id === 'cedula' && v.trim() && !cedulaValida(v.trim()))
    return 'Cédula no válida'
  if (seccionId === 'examen') return avisoSigno(c.id, v)
  return null
}

function Entrada({ c, v, onCambio }: { c: Campo; v: string; onCambio: (v: string) => void }) {
  const id = `campo-${c.id}`
  if (c.tipo === 'parrafo')
    return <textarea id={id} rows={3} className={claseInput} value={v} onChange={(e) => onCambio(e.target.value)} />
  if (c.tipo === 'opcion')
    return (
      <select id={id} className={claseInput} value={v} onChange={(e) => onCambio(e.target.value)}>
        <option value="">—</option>
        {c.opciones!.map((o) => <option key={o}>{o}</option>)}
      </select>
    )
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        className={claseInput}
        type={c.tipo === 'fecha' ? 'date' : 'text'}
        inputMode={c.tipo === 'numero' ? 'decimal' : undefined}
        value={v}
        onChange={(e) => onCambio(e.target.value)}
      />
      {c.unidad && <span className="shrink-0 text-sm text-slate-500">{c.unidad}</span>}
    </div>
  )
}

export function SeccionFormulario({ seccion, valores, onCambio }: Props) {
  const [hechas, setHechas] = useState<Record<number, boolean>>({})
  let grupoActual: string | undefined
  const i = seccion.id === 'examen' ? imc(Number(valores.peso), Number(valores.talla)) : null

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <section>
        <h2 className="text-2xl font-semibold">{seccion.numero}. {seccion.titulo}</h2>
        <p className="mt-1 text-slate-600">{seccion.descripcion}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {seccion.campos.map((c) => {
            const v = valores[c.id] ?? ''
            const a = aviso(seccion.id, c, v)
            const titulo = c.grupo && c.grupo !== grupoActual ? (grupoActual = c.grupo) : null
            return (
              <div key={c.id} style={{ display: 'contents' }}>
                {titulo && <h3 className="mt-2 font-semibold text-marca sm:col-span-2">{titulo}</h3>}
                <div className={c.tipo === 'parrafo' ? 'sm:col-span-2' : ''}>
                  <label htmlFor={`campo-${c.id}`} className="mb-1 block text-sm font-medium">
                    {c.etiqueta}
                    {c.obligatorio && <span className="text-alarma"> *</span>}
                  </label>
                  <Entrada c={c} v={v} onCambio={(nv) => onCambio(c.id, nv)} />
                  {c.ayuda && <p className="mt-1 text-xs text-slate-500">{c.ayuda}</p>}
                  {a && <p className="mt-1 text-sm font-medium text-alarma">⚠ {a}</p>}
                </div>
              </div>
            )
          })}
          {i !== null && <p className="text-sm sm:col-span-2">IMC calculado: <strong>{i} kg/m²</strong></p>}
        </div>
      </section>

      <aside className="h-fit rounded-xl border border-teal-200 bg-teal-50 p-4 lg:sticky lg:top-4">
        <h3 className="font-semibold text-marca-oscuro">Guía: qué preguntar</h3>
        <ul className="mt-3 space-y-2">
          {seccion.guia.map((g, n) => (
            <li key={n}>
              <label className="flex gap-2 text-sm leading-snug">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-teal-700"
                  checked={!!hechas[n]}
                  onChange={(e) => setHechas({ ...hechas, [n]: e.target.checked })}
                />
                <span className={hechas[n] ? 'text-slate-400 line-through' : ''}>{g}</span>
              </label>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

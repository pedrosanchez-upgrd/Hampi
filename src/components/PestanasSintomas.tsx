import { useState } from 'react'
import { SINTOMAS } from '../data/sintomas'
import { abrirSintoma, cerrarSintoma, sintomasAbiertos, type Historia } from '../lib/historia'

interface Props {
  historia: Historia
  setHistoria: (f: (h: Historia) => Historia) => void
}

const SISTEMAS = [...new Set(SINTOMAS.map((s) => s.sistema))]

export function PestanasSintomas({ historia, setHistoria }: Props) {
  const abiertos = sintomasAbiertos(historia)
  const [elegido, setElegido] = useState<string | null>(null)
  const activo = abiertos.includes(elegido ?? '') ? elegido! : abiertos[0]
  const s = SINTOMAS.find((x) => x.id === activo)
  const sx = historia.sintomas ?? {}
  const poner = (clave: string, valor: string) =>
    setHistoria((h) => ({ ...h, sintomas: { ...h.sintomas, [clave]: valor } }))

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Pestañas de síntoma</h3>
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
          value=""
          aria-label="Agregar síntoma"
          onChange={(e) => {
            const id = e.target.value
            if (!id) return
            setHistoria((h) => abrirSintoma(h, id))
            setElegido(id)
          }}
        >
          <option value="">+ Agregar síntoma</option>
          {SISTEMAS.map((sis) => (
            <optgroup key={sis} label={sis}>
              {SINTOMAS.filter((x) => x.sistema === sis && !abiertos.includes(x.id)).map((x) => (
                <option key={x.id} value={x.id}>{x.nombre}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {abiertos.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          Se abren solas cuando escribe un síntoma en el motivo o en la enfermedad actual (por ejemplo «dolor en el pecho»). También puede agregarlas a mano.
        </p>
      ) : (
        <>
          <div role="tablist" className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {abiertos.map((id) => {
              const x = SINTOMAS.find((y) => y.id === id)!
              const alarmas = x.alarmas.filter((_, i) => sx[`${id}.a${i}`] === '1').length
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={id === activo}
                  onClick={() => setElegido(id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${
                    id === activo ? 'border-marca bg-marca text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {x.nombre}
                  {alarmas > 0 && <span className="ml-1.5 rounded-full bg-alarma px-1.5 text-xs text-white">{alarmas}</span>}
                </button>
              )
            })}
          </div>

          {s && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-marca-oscuro">Preguntas de {s.nombre.toLowerCase()}</h4>
                <ul className="mt-2 space-y-1.5">
                  {s.preguntas.map((p, i) => (
                    <li key={p}>
                      <label className="flex gap-2 text-sm leading-snug">
                        <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-teal-700"
                          checked={sx[`${s.id}.p${i}`] === '1'}
                          onChange={(e) => poner(`${s.id}.p${i}`, e.target.checked ? '1' : '')} />
                        <span className={sx[`${s.id}.p${i}`] === '1' ? 'text-slate-400 line-through' : ''}>{p}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-alarma">Signos de alarma (marcar si están presentes)</h4>
                <ul className="mt-2 space-y-1.5">
                  {s.alarmas.map((a, i) => (
                    <li key={a}>
                      <label className="flex gap-2 text-sm leading-snug">
                        <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-red-700"
                          checked={sx[`${s.id}.a${i}`] === '1'}
                          onChange={(e) => poner(`${s.id}.a${i}`, e.target.checked ? '1' : '')} />
                        <span className={sx[`${s.id}.a${i}`] === '1' ? 'font-medium text-alarma' : ''}>{a}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-2">
                <label htmlFor={`notas-${s.id}`} className="mb-1 block text-sm font-medium">Hallazgos de esta pestaña</label>
                <textarea id={`notas-${s.id}`} rows={3}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20"
                  value={sx[`${s.id}.notas`] ?? ''}
                  onChange={(e) => poner(`${s.id}.notas`, e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <button className="text-sm text-slate-500 underline" onClick={() => setHistoria((h) => cerrarSintoma(h, s.id))}>
                  Cerrar esta pestaña
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

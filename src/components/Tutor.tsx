import { useState } from 'react'
import { diagnosticosEnVivo, formatoFactor, preguntasClave } from '../lib/motor'
import { alarmasMarcadas, avisos, faltantes, type Historia } from '../lib/historia'
import { hallazgosEnLoEscrito } from '../data/detectarHallazgos'
import { LoQueEscribio, PregunteAhora } from './PanelDiagnosticos'
import { Icono } from './Icono'

interface Props {
  historia: Historia
  setHistoria: (f: (h: Historia) => Historia) => void
  irA: (seccionId: string) => void
  /** Modo práctica: el tutor no muestra diagnósticos ni preguntas clave hasta el final. */
  practica?: { titulo: string; onTerminar: () => void }
}

function Nota({ titulo, children, tono = 'normal' }: { titulo: string; children: React.ReactNode; tono?: 'normal' | 'alarma' }) {
  return (
    <section className="grid gap-2">
      <h3 className={`text-xs font-semibold uppercase tracking-[0.14em] ${tono === 'alarma' ? 'text-alarm' : 'text-ink-soft'}`}>{titulo}</h3>
      {children}
    </section>
  )
}

function Probables({ historia, irA }: Pick<Props, 'historia' | 'irA'>) {
  const todos = diagnosticosEnVivo(historia).filter((x) => !x.descartado)
  if (!todos.length)
    return <p className="text-sm leading-relaxed text-ink-soft">Aparecen cuando escribes el motivo de consulta (por ejemplo «dolor en el pecho» o «fiebre»).</p>
  return (
    <>
      <ol className="grid gap-1">
        {todos.slice(0, 3).map((r, i) => {
          const m = r.razones.find((x) => x.factor > 1) ?? r.razones[0]
          return (
            <li key={r.id} className="flex min-w-0 items-baseline gap-3 border-b border-rule py-1.5 last:border-0">
              <span className={`w-5 shrink-0 font-display text-lg font-semibold ${i === 0 ? 'text-brand' : 'text-ink-faint'}`}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug text-ink">
                  {r.nombre}
                  {r.grave && <span className="ml-1.5 whitespace-nowrap rounded-full bg-alarm-soft px-1.5 py-px align-middle text-[11px] font-semibold text-alarm">no te lo pierdas</span>}
                </p>
                <p className="truncate text-xs text-ink-soft">
                  {m ? `${m.factor > 1 ? '▲' : '▼'} ${m.presente ? m.texto : 'Sin ' + m.texto.charAt(0).toLowerCase() + m.texto.slice(1)}` : 'Sin hallazgos registrados todavía'}
                </p>
              </div>
              {r.factorLR !== 1 && <span className="cifra shrink-0 text-xs text-ink-faint" title="Razón de verosimilitud combinada de los hallazgos registrados" aria-label={`Razón de verosimilitud combinada ${formatoFactor(r.factorLR)}`}>{formatoFactor(r.factorLR)}</span>}
            </li>
          )
        })}
      </ol>
      <button className="inline-flex min-h-10 w-fit items-center gap-1.5 text-sm font-semibold text-brand" onClick={() => irA('impresion')}>
        {todos.length > 3 ? `Ver los ${todos.length} y elegir` : 'Elegir mis diagnósticos'} <Icono nombre="flecha" className="h-4 w-4" />
      </button>
    </>
  )
}

function TeFalta({ historia, irA }: Pick<Props, 'historia' | 'irA'>) {
  const [todo, setTodo] = useState(false)
  const items = [
    ...avisos(historia).map((a) => ({ texto: a.texto, seccionId: a.seccionId, tipo: 'aviso' as const })),
    ...faltantes(historia).map((f) => ({ texto: `${f.campo} · ${f.seccion}`, seccionId: f.seccionId, tipo: 'falta' as const })),
  ]
  if (!items.length) return <p className="flex items-center gap-1.5 text-sm text-ok"><Icono nombre="check" className="h-4 w-4" /> Lo obligatorio está completo.</p>
  const visibles = todo ? items : items.slice(0, 2)
  return (
    <>
      <ul className="grid gap-0.5">
        {visibles.map((x, i) => (
          <li key={i}>
            <button className="flex min-h-10 w-full items-start gap-2 rounded-lg px-1 py-1.5 text-left text-sm hover:bg-warn-soft" onClick={() => irA(x.seccionId)}>
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${x.tipo === 'aviso' ? 'bg-warn' : 'bg-ink-faint'}`} />
              <span className="text-ink">{x.texto}</span>
            </button>
          </li>
        ))}
      </ul>
      {items.length > 2 && (
        <button className="min-h-10 w-fit text-sm font-semibold text-brand" onClick={() => setTodo(!todo)}>{todo ? 'Ver menos' : `Ver las ${items.length}`}</button>
      )}
    </>
  )
}

/** El tutor al margen: lo urgente primero. */
export function Tutor({ historia, setHistoria, irA, practica }: Props) {
  const alarmas = alarmasMarcadas(historia)
  return (
    <div className="grid gap-6">
      {alarmas.length > 0 && (
        <Nota titulo={alarmas.length === 1 ? 'Signo de alarma' : `${alarmas.length} signos de alarma`} tono="alarma">
          <ul className="grid gap-1.5">
            {alarmas.map((a, i) => (
              <li key={i} className="flex gap-2 rounded-lg bg-alarm-soft px-3 py-2 text-sm">
                <Icono nombre="alerta" className="mt-0.5 h-4 w-4 shrink-0 text-alarm" />
                <span><span className="font-semibold text-alarm">{a.alarma}</span><span className="text-ink-soft"> · {a.sintoma}</span></span>
              </li>
            ))}
          </ul>
        </Nota>
      )}

      {practica ? (
        <Nota titulo="Modo práctica">
          <p className="text-sm leading-relaxed text-ink-soft">
            En «{practica.titulo}» el tutor se calla: los diagnósticos y las preguntas clave se ven al terminar.
            Pregúntale al paciente desde las pestañas de síntoma.
          </p>
          <button onClick={practica.onTerminar} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-brand px-4 font-semibold text-on-brand hover:bg-brand-strong">
            <Icono nombre="check" className="h-4 w-4" /> Terminar y ver mi resultado
          </button>
        </Nota>
      ) : (
        <>
          <LoQueEscribio historia={historia} setHistoria={setHistoria} max={3} />
          {(() => {
            const ocultos = (historia.diagnosticosVivo?.ignorados ?? '').split(',').filter(Boolean).length
            return ocultos > 0 ? (
              <button className="-mt-3 min-h-10 w-fit text-left text-sm text-ink-soft hover:text-ink"
                onClick={() => setHistoria((h) => ({ ...h, diagnosticosVivo: { ...h.diagnosticosVivo, ignorados: '' } }))}>
                Ocultaste {ocultos} {ocultos === 1 ? 'dato' : 'datos'} con «No corresponde» · <span className="font-semibold text-brand">volver a mostrar</span>
              </button>
            ) : null
          })()}
          <PregunteAhora historia={historia} setHistoria={setHistoria} max={1} />
          <Nota titulo="Lo más probable ahora"><Probables historia={historia} irA={irA} /></Nota>
        </>
      )}

      <Nota titulo="Te falta"><TeFalta historia={historia} irA={irA} /></Nota>
      <p className="text-xs leading-relaxed text-ink-faint">
        Notas de apoyo: el número (×) combina razones de verosimilitud publicadas; ▲▼ son factores sin número. La decisión es tuya.
      </p>
    </div>
  )
}

/** La nota más importante en una línea (para el cajón del teléfono). */
export function notaPrincipal(h: Historia, practica: boolean): { texto: string; tono: 'alarma' | 'brand' | 'neutro' } {
  const al = alarmasMarcadas(h).length
  if (al) return { texto: `${al} ${al === 1 ? 'signo de alarma' : 'signos de alarma'}`, tono: 'alarma' }
  if (practica) return { texto: 'Modo práctica · terminar cuando quieras', tono: 'neutro' }
  const enc = hallazgosEnLoEscrito(h).length
  if (enc) return { texto: `Encontré ${enc} ${enc === 1 ? 'dato' : 'datos'} en lo que escribiste`, tono: 'brand' }
  const q = preguntasClave(h, 1)[0]
  if (q) return { texto: `Pregúntale: ${q.texto.charAt(0).toLowerCase()}${q.texto.slice(1)}`, tono: 'brand' }
  const d = diagnosticosEnVivo(h).filter((x) => !x.descartado)[0]
  if (d) return { texto: `Lo más probable: ${d.nombre}`, tono: 'neutro' }
  const f = faltantes(h).length
  return { texto: f ? (f === 1 ? 'Te falta 1 dato obligatorio' : `Te faltan ${f} datos obligatorios`) : 'Todo lo obligatorio está completo', tono: 'neutro' }
}

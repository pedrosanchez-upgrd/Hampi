import { useEffect, useState } from 'react'
import { SECCIONES } from './data/secciones'
import { historiaVacia, faltantes, type Historia } from './lib/historia'
import { Terminos, VERSION_TERMINOS } from './components/Terminos'
import { SeccionFormulario } from './components/SeccionFormulario'
import { Redaccion } from './components/Redaccion'
import { PestanasSintomas } from './components/PestanasSintomas'
import { PanelDiagnosticos, ListaDiagnosticos } from './components/PanelDiagnosticos'

const CLAVE_TERMINOS = 'hampi.terminos'
const CLAVE_BORRADOR = 'hampi.borrador'

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const v = localStorage.getItem(clave)
    return v ? (JSON.parse(v) as T) : porDefecto
  } catch {
    return porDefecto
  }
}

function guardar(clave: string, valor: unknown) {
  try { localStorage.setItem(clave, JSON.stringify(valor)) } catch { /* sin almacenamiento */ }
}

export default function App() {
  const [aceptado, setAceptado] = useState(
    () => leer<{ version?: string }>(CLAVE_TERMINOS, {}).version === VERSION_TERMINOS,
  )
  const [historia, setHistoria] = useState<Historia>(() => ({ ...historiaVacia(), ...leer(CLAVE_BORRADOR, {}) }))
  const [actual, setActual] = useState<string>(SECCIONES[0].id)

  useEffect(() => guardar(CLAVE_BORRADOR, historia), [historia])

  if (!aceptado)
    return (
      <Terminos
        onAceptar={() => {
          guardar(CLAVE_TERMINOS, { version: VERSION_TERMINOS, fecha: new Date().toISOString() })
          setAceptado(true)
        }}
      />
    )

  const falta = faltantes(historia)
  const llenos = (id: string) => Object.values(historia[id] ?? {}).some((v) => v.trim())
  const irA = (id: string) => { setActual(id); window.scrollTo({ top: 0 }) }
  const seccion = SECCIONES.find((s) => s.id === actual)

  return (
    <div className="min-h-screen">
      <div className="no-imprimir bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
        Modo de prueba: use solo casos ficticios. Hampi es una herramienta de apoyo; la decisión clínica es suya.
      </div>
      <header className="no-imprimir flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <span className="text-xl font-semibold text-marca">Hampi</span>
          <span className="ml-2 text-sm text-slate-500">Medicina interna</span>
        </div>
        <button
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          onClick={() => {
            if (confirm('¿Borrar esta historia y empezar una nueva?')) { setHistoria(historiaVacia()); irA(SECCIONES[0].id) }
          }}
        >
          Nueva historia
        </button>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-6 pb-24 md:grid-cols-[220px_1fr]">
        <nav className="no-imprimir min-w-0 md:sticky md:top-4 md:h-fit">
          <ol className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
            {[...SECCIONES.map((s) => ({ id: s.id, n: s.numero, t: s.titulo })), { id: 'redaccion', n: 10, t: 'Redacción final' }].map((s) => {
              const pendiente = falta.some((f) => f.seccionId === s.id)
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    onClick={() => irA(s.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                      actual === s.id ? 'bg-marca text-white' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-5 text-right opacity-70">{s.n}</span>
                    <span className="whitespace-nowrap md:whitespace-normal">{s.t}</span>
                    {s.id !== 'redaccion' && llenos(s.id) && !pendiente && <span className="ml-auto" aria-label="con datos">✓</span>}
                    {pendiente && <span className="ml-auto h-2 w-2 rounded-full bg-amber-500" aria-label="faltan datos obligatorios" />}
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        <main className="min-w-0">
          {seccion ? (
            <SeccionFormulario
              key={seccion.id}
              seccion={seccion}
              valores={historia[seccion.id] ?? {}}
              onCambio={(campo, valor) =>
                setHistoria((h) => ({ ...h, [seccion.id]: { ...h[seccion.id], [campo]: valor } }))
              }
            />
          ) : (
            <Redaccion historia={historia} irA={irA} />
          )}
          {seccion?.id === 'enfermedad' && <PestanasSintomas historia={historia} setHistoria={setHistoria} />}
          {seccion?.id === 'impresion' && (
            <section className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-lg font-semibold">Diagnósticos en vivo</h3>
              <div className="mt-2"><ListaDiagnosticos historia={historia} setHistoria={setHistoria} /></div>
            </section>
          )}
          {seccion && (
            <div className="no-imprimir mt-8 flex justify-end">
              <button
                className="rounded-lg bg-marca px-4 py-2 font-medium text-white hover:bg-marca-oscuro"
                onClick={() => irA(SECCIONES[seccion.numero]?.id ?? 'redaccion')}
              >
                Siguiente →
              </button>
            </div>
          )}
        </main>
      </div>
      {seccion?.id !== 'impresion' && <PanelDiagnosticos historia={historia} setHistoria={setHistoria} />}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { SECCIONES } from './data/secciones'
import { SINTOMAS } from './data/sintomas'
import { alarmasMarcadas, faltantes, historiaVacia, progresoSeccion, sintomasAbiertos, type Historia } from './lib/historia'
import { useTema } from './lib/tema'
import { Terminos, VERSION_TERMINOS } from './components/Terminos'
import { SeccionFormulario } from './components/SeccionFormulario'
import { Redaccion } from './components/Redaccion'
import { PestanasSintomas } from './components/PestanasSintomas'
import { Asistente, AsistenteFlotante, ListaDiagnosticos } from './components/PanelDiagnosticos'
import { Icono, Logo } from './components/Icono'

const CLAVE_TERMINOS = 'hampi.terminos'
const CLAVE_BORRADOR = 'hampi.borrador'

function leer<T>(clave: string, porDefecto: T): T {
  try { const v = localStorage.getItem(clave); return v ? (JSON.parse(v) as T) : porDefecto } catch { return porDefecto }
}
function guardar(clave: string, valor: unknown) {
  try { localStorage.setItem(clave, JSON.stringify(valor)) } catch { /* sin almacenamiento */ }
}

const PASOS = [...SECCIONES.map((s) => ({ id: s.id, n: s.numero, t: s.titulo })), { id: 'redaccion', n: 10, t: 'Redacción final' }]

/** Anillo de progreso de un apartado (como el avance de una ficha). */
function Anillo({ id, historia, activo }: { id: string; historia: Historia; activo: boolean }) {
  if (id === 'redaccion') return <Icono nombre="documento" className="h-5 w-5" />
  const p = progresoSeccion(historia, id)
  const f = p.total ? p.llenos / p.total : 0
  const completo = p.obligatoriosFaltan === 0 && p.llenos > 0
  const c = 2 * Math.PI * 9
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 -rotate-90" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth="3" />
      <circle cx="12" cy="12" r="9" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${f * c} ${c}`}
        stroke={activo ? 'var(--on-brand)' : completo ? 'var(--ok)' : 'var(--brand)'} />
    </svg>
  )
}

function BandaPaciente({ historia }: { historia: Historia }) {
  const f = historia.filiacion ?? {}
  const m = historia.motivo ?? {}
  const abiertos = sintomasAbiertos(historia).map((id) => SINTOMAS.find((s) => s.id === id)!.nombre)
  const alarmas = alarmasMarcadas(historia).length
  const quien = [f.sexo, f.edad && `${f.edad} años`].filter(Boolean).join(' · ')
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-soft sm:flex"><Icono nombre="persona" className="h-5 w-5" /></span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{quien || 'Paciente sin datos'}{m.motivo && <span className="font-normal text-ink-soft"> · «{m.motivo}»{m.tiempo && `, ${m.tiempo}`}</span>}</p>
        <p className="truncate text-xs text-ink-faint">{abiertos.length ? abiertos.join(' · ') : 'Caso ficticio · los síntomas aparecerán aquí'}</p>
      </div>
      {alarmas > 0 && (
        <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-alarm-soft px-2.5 py-1 text-xs font-semibold text-alarm">
          <Icono nombre="alerta" className="h-4 w-4" /><span className="cifra">{alarmas}</span><span className="hidden sm:inline">{alarmas === 1 ? 'alarma' : 'alarmas'}</span>
        </span>
      )}
    </div>
  )
}

export default function App() {
  const [aceptado, setAceptado] = useState(() => leer<{ version?: string }>(CLAVE_TERMINOS, {}).version === VERSION_TERMINOS)
  const [historia, setHistoria] = useState<Historia>(() => ({ ...historiaVacia(), ...leer(CLAVE_BORRADOR, {}) }))
  const [actual, setActual] = useState<string>(SECCIONES[0].id)
  const [confirmar, setConfirmar] = useState(false)
  const [tema, cambiarTema] = useTema()

  useEffect(() => guardar(CLAVE_BORRADOR, historia), [historia])
  // En el teléfono, el apartado activo siempre visible en el carrusel.
  useEffect(() => {
    document.querySelector('[aria-current="step"]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [actual])

  if (!aceptado)
    return <Terminos onAceptar={() => { guardar(CLAVE_TERMINOS, { version: VERSION_TERMINOS, fecha: new Date().toISOString() }); setAceptado(true) }} />

  const falta = faltantes(historia)
  const irA = (id: string) => { setActual(id); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const seccion = SECCIONES.find((s) => s.id === actual)
  const indice = PASOS.findIndex((p) => p.id === actual)
  const siguiente = PASOS[indice + 1]
  const anterior = PASOS[indice - 1]

  return (
    <div className="min-h-screen pb-[env(safe-area-inset-bottom,0px)]">
      {/* Encabezado fijo con la banda del paciente */}
      <header className="no-imprimir sticky top-0 z-10 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2.5 sm:gap-4">
          <div className="flex shrink-0 items-center gap-2.5">
            <Logo className="h-9 w-9" />
            <div className="hidden leading-tight md:block">
              <p className="font-display text-lg font-extrabold tracking-tight text-ink">Hampi</p>
              <p className="text-[11px] text-ink-faint">Medicina interna</p>
            </div>
          </div>
          <span className="hidden h-8 w-px bg-line md:block" />
          <BandaPaciente historia={historia} />
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={cambiarTema} className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2"
              aria-label={`Tema: ${tema}. Cambiar`} title={`Tema: ${tema}`}>
              <Icono nombre={tema === 'oscuro' ? 'luna' : tema === 'claro' ? 'sol' : 'sistema'} className="h-5 w-5" />
            </button>
            {confirmar ? (
              <span className="flex items-center gap-1.5">
                <button className="min-h-10 rounded-full bg-alarm px-3 text-sm font-semibold text-white"
                  onClick={() => { setHistoria(historiaVacia()); irA(SECCIONES[0].id); setConfirmar(false) }}>Borrar todo</button>
                <button className="min-h-10 rounded-full px-3 text-sm text-ink-soft hover:bg-surface-2" onClick={() => setConfirmar(false)}>Cancelar</button>
              </span>
            ) : (
              <button className="flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-soft hover:bg-surface-2" onClick={() => setConfirmar(true)}>
                <Icono nombre="mas" className="h-4 w-4" /><span className="hidden sm:inline">Nueva historia</span>
              </button>
            )}
          </div>
        </div>
        <p className="border-t border-warn/20 bg-warn-soft px-4 py-1 text-center text-xs text-warn">
          Modo de prueba: use solo casos ficticios. Hampi es una herramienta de apoyo; la decisión clínica es suya.
        </p>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 pb-28 pt-5 md:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_380px]">
        {/* Navegación: lista con progreso en pantallas medianas; carrusel en el teléfono */}
        <nav aria-label="Apartados" className="no-imprimir min-w-0 md:sticky md:top-28 md:h-fit">
          <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:gap-0.5 md:overflow-visible md:px-0">
            {PASOS.map((s) => {
              const activo = actual === s.id
              const pendiente = falta.some((f) => f.seccionId === s.id)
              return (
                <li key={s.id} className="shrink-0">
                  <button onClick={() => irA(s.id)} aria-current={activo ? 'step' : undefined}
                    className={`flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[15px] transition-colors ${
                      activo ? 'bg-brand text-on-brand shadow-card' : 'text-ink hover:bg-surface'}`}>
                    <span className={activo ? 'text-on-brand' : 'text-ink-faint'}><Anillo id={s.id} historia={historia} activo={activo} /></span>
                    <span className="whitespace-nowrap md:whitespace-normal"><span className="cifra mr-1 opacity-60">{s.n}</span>{s.t}</span>
                    {pendiente && <span className={`ml-auto h-2 w-2 shrink-0 rounded-full ${activo ? 'bg-on-brand' : 'bg-warn'}`} aria-label="faltan datos obligatorios" />}
                  </button>
                </li>
              )
            })}
          </ol>
          <p className="mt-4 hidden px-3 text-xs leading-relaxed text-ink-faint md:block">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-warn" /> faltan datos obligatorios
          </p>
        </nav>

        <main className="min-w-0">
          {seccion ? (
            <SeccionFormulario key={seccion.id} seccion={seccion} valores={historia[seccion.id] ?? {}}
              onCambio={(campo, valor) => setHistoria((h) => ({ ...h, [seccion.id]: { ...h[seccion.id], [campo]: valor } }))}
              guia={historia.guia ?? {}}
              onGuia={(clave, valor) => setHistoria((h) => ({ ...h, guia: { ...h.guia, [clave]: valor } }))} />
          ) : (
            <Redaccion historia={historia} irA={irA} />
          )}

          {seccion?.id === 'enfermedad' && <div className="mt-5"><PestanasSintomas historia={historia} setHistoria={setHistoria} /></div>}
          {seccion?.id === 'impresion' && (
            <section className="mt-5 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5 xl:hidden">
              <h3 className="mb-3 font-display text-lg font-bold text-ink">Diagnósticos en vivo</h3>
              <ListaDiagnosticos historia={historia} setHistoria={setHistoria} />
            </section>
          )}

          <div className="no-imprimir mt-8 flex items-center justify-between gap-3">
            {anterior ? (
              <button className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-ink-soft hover:bg-surface" onClick={() => irA(anterior.id)}>
                <Icono nombre="atras" className="h-5 w-5" /><span className="hidden sm:inline">{anterior.t}</span>
              </button>
            ) : <span />}
            {siguiente && (
              <button className="flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 font-semibold text-on-brand shadow-card hover:bg-brand-strong" onClick={() => irA(siguiente.id)}>
                {siguiente.t} <Icono nombre="flecha" className="h-5 w-5" />
              </button>
            )}
          </div>
        </main>

        {/* Asistente fijo a la derecha en pantallas anchas */}
        <aside aria-label="Asistente" className="no-imprimir hidden min-w-0 xl:block">
          <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-line bg-surface/60 p-3">
            <Asistente historia={historia} setHistoria={setHistoria} irA={irA} />
          </div>
        </aside>
      </div>

      <AsistenteFlotante historia={historia} setHistoria={setHistoria} irA={irA} />
    </div>
  )
}

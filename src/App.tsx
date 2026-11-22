import { useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { SECCIONES } from './data/secciones'
import { SINTOMAS } from './data/sintomas'
import { alarmasMarcadas, faltantes, historiaVacia, progresoSeccion, sintomasAbiertos, type Historia } from './lib/historia'
import { useTema } from './lib/tema'
import { Terminos, VERSION_TERMINOS } from './components/Terminos'
import { SeccionFormulario } from './components/SeccionFormulario'
import { Redaccion } from './components/Redaccion'
import { PestanasSintomas } from './components/PestanasSintomas'
import { Asistente, AsistenteFlotante, ElegirDiagnosticos } from './components/PanelDiagnosticos'
import { Icono, Logo } from './components/Icono'
import { AntecedentesFamiliares, AntecedentesPersonales } from './components/Antecedentes'
import { casoEjemplo } from './data/casoEjemplo'
import { Cuenta } from './components/Cuenta'
import { MisHistorias } from './components/MisHistorias'
import { asegurarPerfil, auditar, guardarHistoria, registrarAceptacion, salir, supabase } from './lib/nube'

const CLAVE_TERMINOS = 'hampi.terminos'
const CLAVE_BORRADOR = 'hampi.borrador'
const CLAVE_SIN_CUENTA = 'hampi.sinCuenta'
const CLAVE_HISTORIA_ID = 'hampi.historiaId'
const VACIA = JSON.stringify(historiaVacia())

type EstadoGuardado = 'local' | 'guardando' | 'guardado' | 'error'

/** Indicador de dónde está guardada la historia. */
function Guardado({ estado }: { estado: EstadoGuardado }) {
  const t = { local: 'En este dispositivo', guardando: 'Guardando…', guardado: 'Guardado en su cuenta', error: 'Sin conexión: guardado en el dispositivo' }[estado]
  return (
    <span className={`hidden items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium lg:flex ${
      estado === 'error' ? 'bg-warn-soft text-warn' : estado === 'guardado' ? 'bg-ok-soft text-ok' : 'bg-surface-2 text-ink-soft'}`} role="status">
      <Icono nombre={estado === 'guardado' ? 'check' : estado === 'error' ? 'alerta' : 'documento'} className="h-3.5 w-3.5" />{t}
    </span>
  )
}

function leer<T>(clave: string, porDefecto: T): T {
  try { const v = localStorage.getItem(clave); return v ? (JSON.parse(v) as T) : porDefecto } catch { return porDefecto }
}
function guardar(clave: string, valor: unknown) {
  try { localStorage.setItem(clave, JSON.stringify(valor)) } catch { /* sin almacenamiento */ }
}

const PASOS = [...SECCIONES.map((s) => ({ id: s.id, n: s.numero, t: s.titulo })), { id: 'redaccion', n: 10, t: 'Redacción final' }]
const ICONO_PASO: Record<string, string> = {
  filiacion: 'persona', motivo: 'mensaje', enfermedad: 'pulso', personales: 'carpeta', familiares: 'familia',
  sistemas: 'lista', examen: 'estetoscopio', impresion: 'lupa', plan: 'portapapeles', redaccion: 'documento',
}

/** Ícono del apartado dentro de un anillo que muestra cuánto se llenó. */
function Anillo({ id, historia, activo }: { id: string; historia: Historia; activo: boolean }) {
  const p = id === 'redaccion' ? null : progresoSeccion(historia, id)
  const f = p && p.total ? p.llenos / p.total : 0
  const completo = !!p && p.obligatoriosFaltan === 0 && p.llenos > 0
  const c = 2 * Math.PI * 13
  return (
    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
      <svg viewBox="0 0 32 32" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth="2.5" />
        {p && <circle cx="16" cy="16" r="13" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${f * c} ${c}`}
          stroke={activo ? 'var(--on-brand)' : completo ? 'var(--ok)' : 'var(--brand)'} />}
      </svg>
      <Icono nombre={ICONO_PASO[id]} className="h-4 w-4" />
    </span>
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
  const [sesion, setSesion] = useState<Session | null>(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)
  const [sinCuenta, setSinCuenta] = useState(() => leer<boolean>(CLAVE_SIN_CUENTA, false))
  const [recuperando, setRecuperando] = useState(false)
  const [historiaId, setHistoriaId] = useState<string | null>(() => leer<string | null>(CLAVE_HISTORIA_ID, null))
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoGuardado>('local')
  const [verHistorias, setVerHistorias] = useState(false)
  const [menu, setMenu] = useState(false)
  const [asistenteAbierto, setAsistenteAbierto] = useState(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const enCurso = useRef<Promise<void> | null>(null)
  const idActual = useRef<string | null>(historiaId)
  useEffect(() => { idActual.current = historiaId }, [historiaId])

  useEffect(() => guardar(CLAVE_BORRADOR, historia), [historia])
  useEffect(() => guardar(CLAVE_HISTORIA_ID, historiaId), [historiaId])

  // Sesión de Supabase: se recupera al abrir y se escucha si cambia.
  useEffect(() => {
    let vivo = true
    supabase.auth.getSession().then(({ data }) => { if (vivo) { setSesion(data.session); setCargandoSesion(false) } })
      .catch(() => { if (vivo) setCargandoSesion(false) })
    const { data } = supabase.auth.onAuthStateChange((evento, s) => {
      setSesion(s)
      if (evento === 'PASSWORD_RECOVERY') setRecuperando(true)
    })
    return () => { vivo = false; data.subscription.unsubscribe() }
  }, [])

  // Al entrar: perfil y aceptación de términos quedan registrados en la nube.
  useEffect(() => {
    if (!sesion) return
    asegurarPerfil(sesion).catch(() => {})
    registrarAceptacion(sesion, VERSION_TERMINOS).catch(() => {})
  }, [sesion?.user.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Guardado automático en la cuenta, 1,5 s después del último cambio.
  useEffect(() => {
    if (!sesion) { setEstadoGuardado('local'); return }
    if (JSON.stringify(historia) === VACIA) return
    if (temporizador.current) clearTimeout(temporizador.current)
    setEstadoGuardado('guardando')
    temporizador.current = setTimeout(() => {
      // Cada guardado espera al anterior: así la primera vez no se crean dos historias.
      const previo = enCurso.current ?? Promise.resolve()
      const ahora = previo.catch(() => {}).then(() => guardarHistoria(idActual.current, historia))
        .then((id) => { idActual.current = id; setHistoriaId(id); setEstadoGuardado('guardado') })
        .catch(() => setEstadoGuardado('error'))
      enCurso.current = ahora
    }, 1500)
    return () => { if (temporizador.current) clearTimeout(temporizador.current) }
  }, [historia, sesion?.user.id]) // eslint-disable-line react-hooks/exhaustive-deps
  // En el teléfono, el apartado activo siempre visible en el carrusel.
  useEffect(() => {
    document.querySelector('[aria-current="step"]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [actual])

  if (!aceptado)
    return <Terminos onAceptar={() => { guardar(CLAVE_TERMINOS, { version: VERSION_TERMINOS, fecha: new Date().toISOString() }); setAceptado(true) }} />
  if (recuperando) return <Cuenta recuperando onListo={() => setRecuperando(false)} />
  if (cargandoSesion) return <main className="flex min-h-screen items-center justify-center"><Logo className="h-12 w-12 animate-pulse" /></main>
  if (!sesion && !sinCuenta)
    return <Cuenta onListo={() => { setSinCuenta(false); guardar(CLAVE_SIN_CUENTA, false) }} onSinCuenta={() => { setSinCuenta(true); guardar(CLAVE_SIN_CUENTA, true) }} />

  const nuevaHistoria = () => { setHistoria(historiaVacia()); setHistoriaId(null); irA(SECCIONES[0].id); setConfirmar(false); setVerHistorias(false) }

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
            <Guardado estado={sesion ? estadoGuardado : 'local'} />
            {sesion ? (
              <>
                <button onClick={() => setVerHistorias(true)} className="flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-soft hover:bg-surface-2" title={sesion.user.email ?? ''}>
                  <Icono nombre="carpeta" className="h-4 w-4" /><span className="hidden sm:inline">Mis historias</span>
                </button>
                <button onClick={async () => { await salir(); setHistoria(historiaVacia()); setHistoriaId(null) }} className="hidden min-h-10 rounded-full px-3 text-sm text-ink-soft hover:bg-surface-2 sm:block">Salir</button>
              </>
            ) : (
              <button onClick={() => { setSinCuenta(false); guardar(CLAVE_SIN_CUENTA, false) }} className="flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-brand hover:bg-brand-soft">
                <Icono nombre="persona" className="h-4 w-4" />Entrar
              </button>
            )}
            <button onClick={cambiarTema} className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 sm:flex"
              aria-label={`Tema: ${tema}. Cambiar`} title={`Tema: ${tema}`}>
              <Icono nombre={tema === 'oscuro' ? 'luna' : tema === 'claro' ? 'sol' : 'sistema'} className="h-5 w-5" />
            </button>
            {confirmar ? (
              <span className="flex items-center gap-1.5">
                <button className="min-h-10 rounded-full bg-alarm px-3 text-sm font-semibold text-on-alarm"
                  onClick={nuevaHistoria}>{sesion ? 'Empezar otra' : 'Borrar todo'}</button>
                <button className="min-h-10 rounded-full px-3 text-sm text-ink-soft hover:bg-surface-2" onClick={() => setConfirmar(false)}>Cancelar</button>
              </span>
            ) : (
              <button className="hidden min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-soft hover:bg-surface-2 sm:flex" onClick={() => setConfirmar(true)}>
                <Icono nombre="mas" className="h-4 w-4" />Nueva historia
              </button>
            )}
            <div className="relative sm:hidden">
              <button onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Más opciones"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2">
                <Icono nombre="puntos" className="h-5 w-5" />
              </button>
              {menu && <div className="fixed inset-0 z-10" aria-hidden onClick={() => setMenu(false)} />}
              {menu && (
                <div role="menu" className="absolute right-0 top-12 z-20 w-56 rounded-2xl border border-line bg-surface p-1.5 shadow-card">
                  <button role="menuitem" className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[15px] text-ink hover:bg-surface-2"
                    onClick={() => { setMenu(false); setConfirmar(true) }}><Icono nombre="mas" className="h-4 w-4" /> Nueva historia</button>
                  <button role="menuitem" className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[15px] text-ink hover:bg-surface-2"
                    onClick={cambiarTema}><Icono nombre={tema === 'oscuro' ? 'luna' : tema === 'claro' ? 'sol' : 'sistema'} className="h-4 w-4" />
                    Tema: {tema === 'sistema' ? 'automático' : tema}</button>
                  {sesion && <button role="menuitem" className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[15px] text-ink hover:bg-surface-2"
                    onClick={async () => { setMenu(false); await salir(); setHistoria(historiaVacia()); setHistoriaId(null) }}><Icono nombre="atras" className="h-4 w-4" /> Salir</button>}
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="border-t border-warn/20 bg-warn-soft px-4 py-1 text-center text-xs text-warn">
          <span className="sm:hidden">Modo de prueba · solo casos ficticios</span>
          <span className="hidden sm:inline">Modo de prueba: use solo casos ficticios. Hampi es una herramienta de apoyo; la decisión clínica es suya.</span>
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
                    <span className={activo ? 'text-on-brand' : 'text-ink-soft'}><Anillo id={s.id} historia={historia} activo={activo} /></span>
                    <span className="whitespace-nowrap font-medium md:whitespace-normal">{s.t}</span>
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
              onGuia={(clave, valor) => setHistoria((h) => ({ ...h, guia: { ...h.guia, [clave]: valor } }))}
              sexo={historia.filiacion?.sexo} historia={historia}>
              {seccion.id === 'filiacion' && !historia.filiacion?.edad && !historia.motivo?.motivo && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-brand/40 bg-surface p-4">
                  <div>
                    <p className="font-semibold text-ink">¿Primera vez en Hampi?</p>
                    <p className="text-sm text-ink-soft">Cargue un caso ficticio de dolor torácico para ver cómo se abren las pestañas y cómo se ordenan los diagnósticos.</p>
                  </div>
                  <button className="min-h-11 rounded-xl bg-brand-soft px-4 font-semibold text-brand-strong hover:bg-brand/15" onClick={() => setHistoria(casoEjemplo())}>
                    Cargar caso de ejemplo
                  </button>
                </div>
              )}
              {seccion.id === 'sistemas' && (
                <button className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink hover:border-brand/60"
                  onClick={() => setHistoria((h) => ({ ...h, sistemas: Object.fromEntries(seccion.campos.map((c) => [c.id, (h.sistemas?.[c.id] ?? '').trim() || 'Niega'])) }))}>
                  <Icono nombre="check" className="h-4 w-4 text-brand" /> Escribir «Niega» en los sistemas vacíos
                </button>
              )}
              {seccion.id === 'impresion' && <ElegirDiagnosticos historia={historia} setHistoria={setHistoria} irA={irA} />}
              {seccion.id === 'personales' && <AntecedentesPersonales historia={historia} setHistoria={setHistoria} />}
              {seccion.id === 'familiares' && <AntecedentesFamiliares historia={historia} setHistoria={setHistoria} />}
            </SeccionFormulario>
          ) : (
            <Redaccion historia={historia} irA={irA} />
          )}

          {seccion?.id === 'enfermedad' && <div className="mt-5"><PestanasSintomas historia={historia} setHistoria={setHistoria} /></div>}
          {seccion && seccion.id !== 'impresion' && (
            <div className="mt-5"><ElegirDiagnosticos compacto historia={historia} setHistoria={setHistoria} irA={irA} /></div>
          )}

          <div className="no-imprimir mt-8 hidden items-center justify-between gap-3 md:flex">
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

      <AsistenteFlotante historia={historia} setHistoria={setHistoria} irA={irA} abierto={asistenteAbierto} setAbierto={setAsistenteAbierto} />

      {/* Teléfono: barra inferior con Anterior · Asistente · Siguiente (no tapa el formulario) */}
      <nav aria-label="Pasos" className="no-imprimir fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-2 backdrop-blur-md md:hidden">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <button className="flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm text-ink-soft disabled:opacity-30" disabled={!anterior} onClick={() => anterior && irA(anterior.id)}>
            <Icono nombre="atras" className="h-5 w-5" /> Anterior
          </button>
          <button onClick={() => setAsistenteAbierto(true)} className="flex min-h-11 items-center gap-2 rounded-full bg-brand-soft px-4 font-semibold text-brand-strong">
            <Icono nombre="pulso" className="h-5 w-5" /> Asistente
            {alarmasMarcadas(historia).length > 0 && <span className="cifra rounded-full bg-alarm px-1.5 text-xs text-on-alarm">{alarmasMarcadas(historia).length}</span>}
          </button>
          <button className="flex min-h-11 items-center justify-end gap-1 rounded-xl px-2 text-sm font-semibold text-brand disabled:opacity-30" disabled={!siguiente} onClick={() => siguiente && irA(siguiente.id)}>
            Siguiente <Icono nombre="flecha" className="h-5 w-5" />
          </button>
        </div>
      </nav>
      {sesion && (
        <MisHistorias abierto={verHistorias} actualId={historiaId} onCerrar={() => setVerHistorias(false)} onNueva={nuevaHistoria}
          onAbrir={(h) => { setHistoria({ ...historiaVacia(), ...h.contenido }); setHistoriaId(h.id); setVerHistorias(false); irA(SECCIONES[0].id); auditar('abrir', h.id) }} />
      )}
    </div>
  )
}

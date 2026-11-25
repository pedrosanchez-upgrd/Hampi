import { useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { SECCIONES } from './data/secciones'
import { SINTOMAS } from './data/sintomas'
import { alarmasMarcadas, edadTexto, historiaVacia, progresoSeccion, sintomasAbiertos, type Historia } from './lib/historia'
import { useTema } from './lib/tema'
import { Terminos, VERSION_TERMINOS } from './components/Terminos'
import { SeccionFormulario } from './components/SeccionFormulario'
import { Redaccion } from './components/Redaccion'
import { PestanasSintomas } from './components/PestanasSintomas'
import { ElegirDiagnosticos } from './components/PanelDiagnosticos'
import { Tutor, notaPrincipal } from './components/Tutor'
import { Inicio } from './components/Inicio'
import { ResultadoPractica } from './components/ResultadoPractica'
import { casoPorId, historiaDePractica } from './data/casosPractica'
import { Icono, Logo } from './components/Icono'
import { AntecedentesFamiliares, AntecedentesPersonales } from './components/Antecedentes'
import { casoEjemplo } from './data/casoEjemplo'
import { Cuenta } from './components/Cuenta'
import { MisHistorias } from './components/MisHistorias'
import { Revision } from './components/Revision'
import { cargarReglasAprobadas, esRevisor } from './lib/evidenciaNube'
import { establecerReglasAprobadas } from './lib/motor'
import { asegurarPerfil, auditar, guardarHistoria, registrarAceptacion, salir, supabase } from './lib/nube'

const CLAVE_TERMINOS = 'hampi.terminos'
const CLAVE_BORRADOR = 'hampi.borrador'
const CLAVE_SIN_CUENTA = 'hampi.sinCuenta'
const CLAVE_HISTORIA_ID = 'hampi.historiaId'
const CLAVE_VISTO = 'hampi.visto'
const CLAVE_APARTADO = 'hampi.apartado'
const VACIA = JSON.stringify(historiaVacia())

type EstadoGuardado = 'local' | 'guardando' | 'guardado' | 'error'

/** Dónde está guardada la historia (compacto, en la cabecera). */
function Guardado({ estado }: { estado: EstadoGuardado }) {
  const t = { local: 'En este dispositivo', guardando: 'Guardando…', guardado: 'Guardado', error: 'No se pudo guardar en la cuenta · queda en el dispositivo' }[estado]
  return (
    <span className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${estado === 'error' ? 'text-warn' : estado === 'guardado' ? 'text-ok' : 'text-ink-faint'}`} role="status" title={t}>
      <Icono nombre={estado === 'guardado' ? 'check' : estado === 'error' ? 'alerta' : 'documento'} className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
      <span className="sr-only lg:not-sr-only">{t}</span>
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

const CORTO: Record<string, string> = {
  filiacion: 'Filiación', motivo: 'Motivo', enfermedad: 'Enfermedad actual', personales: 'Personales', familiares: 'Familiares',
  sistemas: 'Sistemas', examen: 'Examen físico', impresion: 'Impresión', plan: 'Plan', redaccion: 'Redacción',
}

function avance(historia: Historia, id: string) {
  const p = id === 'redaccion' ? null : progresoSeccion(historia, id)
  return { f: p && p.total ? p.llenos / p.total : 0, completo: !!p && p.obligatoriosFaltan === 0 && p.llenos > 0, falta: !!p && p.obligatoriosFaltan > 0 }
}

/** Índice del cuaderno: pestañas numeradas con su avance. `vertical` en pantallas anchas. */
function Indice({ historia, actual, irA, vertical }: { historia: Historia; actual: string; irA: (id: string) => void; vertical?: boolean }) {
  return (
    <ol className={vertical ? 'grid gap-0.5' : '-mb-px flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:px-6'}>
      {PASOS.map((s) => {
        const activo = actual === s.id
        const a = avance(historia, s.id)
        return (
          <li key={s.id} className="shrink-0">
            <button onClick={() => irA(s.id)} aria-current={activo ? 'step' : undefined}
              className={vertical
                ? `flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left transition-colors ${activo ? 'bg-surface text-ink shadow-card' : 'text-ink-soft hover:bg-surface/70'}`
                : `relative flex min-h-12 items-center gap-2 rounded-t-lg border-x border-t px-3 text-left transition-colors ${activo ? 'border-line bg-bg text-ink' : 'border-transparent text-ink-soft hover:text-ink'}`}>
              <span className={`font-display text-lg font-semibold leading-none ${activo ? 'text-brand' : a.completo ? 'text-ok' : 'text-ink-faint'}`}>
                {a.completo && !activo ? <Icono nombre="check" className="h-4 w-4" /> : String(s.n).padStart(2, '0')}
              </span>
              <span className={`whitespace-nowrap text-[15px] ${activo ? 'font-semibold' : ''}`}>{CORTO[s.id]}</span>
              {a.falta && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warn" aria-label="faltan datos obligatorios" />}
              {vertical && s.id !== 'redaccion' && (
                <span className="ml-auto h-1 w-8 shrink-0 overflow-hidden rounded-full bg-surface-2" aria-hidden><span className="block h-full bg-brand/70" style={{ width: `${a.f * 100}%` }} /></span>
              )}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

/** Cabecera de la ficha: quién es el paciente y por qué vino, como en la primera línea de una historia. */
function FichaPaciente({ historia }: { historia: Historia }) {
  const f = historia.filiacion ?? {}
  const m = historia.motivo ?? {}
  const abiertos = sintomasAbiertos(historia).map((id) => SINTOMAS.find((s) => s.id === id)!.nombre)
  const alarmas = alarmasMarcadas(historia).length
  const quien = [f.sexo, f.edad && edadTexto(f.edad)].filter(Boolean).join(', ')
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="min-w-0">
        <p className="truncate font-display text-[19px] font-semibold leading-tight text-ink">
          {quien || 'Paciente sin datos'}
          {m.motivo && <span className="font-normal italic text-ink-soft"> · «{m.motivo}»{m.tiempo && `, ${m.tiempo}`}</span>}
        </p>
        <p className="truncate text-xs text-ink-faint">{abiertos.length ? abiertos.join(' · ') : 'Los síntomas aparecen aquí cuando los escribes'}</p>
      </div>
      {alarmas > 0 && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-alarm px-2.5 py-1 text-xs font-semibold text-on-alarm">
          <Icono nombre="alerta" className="h-4 w-4" /><span className="cifra">{alarmas}</span><span className="hidden sm:inline">{alarmas === 1 ? 'alarma' : 'alarmas'}</span>
        </span>
      )}
    </div>
  )
}

/** Tarjeta del paciente simulado en el modo práctica. */
function PacientePractica({ historia, seccionId }: { historia: Historia; seccionId: string }) {
  const c = casoPorId(historia.practica?.caso)
  if (!c) return null
  const vitales: [string, string, string][] = [['PA', `${c.signos.pas}/${c.signos.pad}`, 'mmHg'], ['FC', c.signos.fc, 'lpm'], ['FR', c.signos.fr, 'rpm'], ['T', c.signos.temp, '°C'], ['Sat', c.signos.sat, '%']]
  return (
    <aside aria-label="Paciente de práctica" className="rounded-xl border border-brand/30 bg-brand-soft/40 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-strong">Práctica · {c.titulo}</p>
      <p className="mt-1 font-display text-[17px] italic leading-snug text-ink">«{c.presentacion}»</p>
      {seccionId === 'examen' && (
        <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {vitales.map(([k, v, u]) => <div key={k} className="flex gap-1.5"><dt className="text-ink-soft">{k}</dt><dd className="cifra font-semibold text-ink">{v} <span className="font-normal text-ink-faint">{u}</span></dd></div>)}
        </dl>
      )}
      {seccionId === 'enfermedad' && <p className="mt-1.5 text-sm text-ink-soft">Usa «Preguntar o examinar» en la pestaña de síntoma: el paciente responde solo lo que le preguntes.</p>}
    </aside>
  )
}

export default function App() {
  const [aceptado, setAceptado] = useState(() => leer<{ version?: string }>(CLAVE_TERMINOS, {}).version === VERSION_TERMINOS)
  const [historia, setHistoria] = useState<Historia>(() => ({ ...historiaVacia(), ...leer(CLAVE_BORRADOR, {}) }))
  const [actual, setActual] = useState<string>(() => leer<string>(CLAVE_APARTADO, SECCIONES[0].id))
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
  const [tutorAbierto, setTutorAbierto] = useState(false)
  const [vista, setVista] = useState<'inicio' | 'consulta'>('inicio')
  const [verResultado, setVerResultado] = useState(false)
  const [primeraVez] = useState(() => !leer<boolean>(CLAVE_VISTO, false))
  const [revisor, setRevisor] = useState(false)
  const [verRevision, setVerRevision] = useState(false)
  const [, setReglasNube] = useState(0)
  const cerrarTutorRef = useRef<HTMLButtonElement | null>(null)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const enCurso = useRef<Promise<void> | null>(null)
  const idActual = useRef<string | null>(historiaId)
  useEffect(() => { idActual.current = historiaId }, [historiaId])

  useEffect(() => guardar(CLAVE_BORRADOR, historia), [historia])
  useEffect(() => guardar(CLAVE_HISTORIA_ID, historiaId), [historiaId])
  useEffect(() => guardar(CLAVE_APARTADO, actual), [actual])

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

  // Fase 3: reglas confirmadas por dos revisores y acceso a la revisión médica.
  const recargarReglas = () => cargarReglasAprobadas().then(setReglasNube)
  useEffect(() => {
    if (!sesion) { establecerReglasAprobadas([]); setRevisor(false); setReglasNube(0); return }
    recargarReglas()
    esRevisor().then(setRevisor).catch(() => setRevisor(false))
  }, [sesion?.user.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Guardado automático en la cuenta, 1,5 s después del último cambio.
  useEffect(() => {
    // Las prácticas no se suben a la cuenta: quedan en el dispositivo.
    if (!sesion || historia.practica?.caso) { setEstadoGuardado('local'); return }
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
  // Cajón del tutor: el foco entra al abrir y Escape lo cierra.
  useEffect(() => {
    if (!tutorAbierto) return
    cerrarTutorRef.current?.focus()
    const t = (e: KeyboardEvent) => { if (e.key === 'Escape') setTutorAbierto(false) }
    addEventListener('keydown', t)
    return () => removeEventListener('keydown', t)
  }, [tutorAbierto])
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

  const abrirConsulta = (h?: Historia, id: string | null = historiaId) => {
    if (h) { setHistoria(h); setHistoriaId(id) }
    guardar(CLAVE_VISTO, true)
    setVista('consulta'); if (h) setActual(SECCIONES[0].id); setConfirmar(false); setVerHistorias(false); setVerResultado(false)
    window.scrollTo({ top: 0 })
  }
  const nuevaHistoria = () => abrirConsulta(historiaVacia(), null)
  const salirCuenta = async () => { setMenu(false); await salir(); setHistoria(historiaVacia()); setHistoriaId(null); setVista('inicio') }

  const caso = casoPorId(historia.practica?.caso)
  const irA = (id: string) => { setActual(id); setTutorAbierto(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const seccion = SECCIONES.find((s) => s.id === actual)
  const indice = PASOS.findIndex((p) => p.id === actual)
  const siguiente = PASOS[indice + 1]
  const anterior = PASOS[indice - 1]
  const nota = notaPrincipal(historia, !!caso)
  const practica = caso ? { titulo: caso.titulo, onTerminar: () => { setTutorAbierto(false); setVerResultado(true) } } : undefined

  const hojas = (
    <>
      {sesion && revisor && <Revision abierto={verRevision} usuarioId={sesion.user.id} onCerrar={() => setVerRevision(false)} onCambio={recargarReglas} />}
      {sesion && (
        <MisHistorias abierto={verHistorias} actualId={historiaId} onCerrar={() => setVerHistorias(false)} onNueva={nuevaHistoria}
          onAbrir={(h) => { abrirConsulta({ ...historiaVacia(), ...h.contenido }, h.id); auditar('abrir', h.id) }} />
      )}
    </>
  )

  if (vista === 'inicio')
    return (
      <>
        <Inicio historia={historia} hayBorrador={JSON.stringify(historia) !== VACIA} primeraVez={primeraVez} conCuenta={!!sesion}
          onSeguir={() => abrirConsulta()} onNueva={nuevaHistoria} onEjemplo={() => abrirConsulta(casoEjemplo(), null)}
          onPracticar={(c) => abrirConsulta(historiaDePractica(c), null)} onMisHistorias={() => setVerHistorias(true)}
          onEntrar={() => { setSinCuenta(false); guardar(CLAVE_SIN_CUENTA, false) }} />
        {hojas}
      </>
    )

  const menuItem = 'flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[15px] text-ink hover:bg-surface-2'

  return (
    <div className="min-h-screen pb-[env(safe-area-inset-bottom,0px)]">
      <header className="no-imprimir sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6">
          <button onClick={() => setVista('inicio')} className="flex shrink-0 items-center gap-2 rounded-lg" aria-label="Ir al inicio de Hampi">
            <Logo className="h-9 w-9" />
          </button>
          <FichaPaciente historia={historia} />
          <span className={`hidden shrink-0 -rotate-2 rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] md:inline ${caso ? 'border-brand/50 text-brand' : 'border-warn/50 text-warn'}`}>
            {caso ? 'Práctica' : 'Caso ficticio'}
          </span>
          <Guardado estado={sesion && !caso ? estadoGuardado : 'local'} />
          <div className="relative">
            <button onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Menú"
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2">
              <Icono nombre="puntos" className="h-5 w-5" />
            </button>
            {menu && <div className="fixed inset-0 z-10" aria-hidden onClick={() => setMenu(false)} />}
            {menu && (
              <div role="menu" className="absolute right-0 top-12 z-20 w-64 rounded-2xl border border-line bg-surface p-1.5 shadow-card">
                <button role="menuitem" className={menuItem} onClick={() => { setMenu(false); setVista('inicio') }}><Icono nombre="atras" className="h-4 w-4" /> Inicio</button>
                <button role="menuitem" className={menuItem} onClick={() => { setMenu(false); setConfirmar(true) }}><Icono nombre="mas" className="h-4 w-4" /> Nueva historia</button>
                {sesion && <button role="menuitem" className={menuItem} onClick={() => { setMenu(false); setVerHistorias(true) }}><Icono nombre="carpeta" className="h-4 w-4" /> Mis historias</button>}
                {revisor && <button role="menuitem" className={menuItem} onClick={() => { setMenu(false); setVerRevision(true) }}><Icono nombre="libro" className="h-4 w-4" /> Revisión médica</button>}
                <button role="menuitem" className={menuItem} onClick={cambiarTema}>
                  <Icono nombre={tema === 'oscuro' ? 'luna' : tema === 'claro' ? 'sol' : 'sistema'} className="h-4 w-4" /> Tema: {tema === 'sistema' ? 'automático' : tema}
                </button>
                {sesion
                  ? <button role="menuitem" className={menuItem} onClick={salirCuenta}><Icono nombre="persona" className="h-4 w-4" /> Salir de la cuenta</button>
                  : <button role="menuitem" className={menuItem} onClick={() => { setMenu(false); setSinCuenta(false); guardar(CLAVE_SIN_CUENTA, false) }}><Icono nombre="persona" className="h-4 w-4" /> Entrar para guardar en tu cuenta</button>}
              </div>
            )}
          </div>
        </div>
        {confirmar && (
          <div role="alertdialog" aria-label="Empezar otra historia" className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-alarm-soft px-4 py-2 sm:px-6">
            <p className="text-sm text-ink">{sesion && !caso ? 'Esta historia ya está guardada en tu cuenta. ¿Empezar otra?' : 'Se borrará lo que escribiste en este dispositivo. ¿Empezar otra?'}</p>
            <span className="flex gap-2">
              <button className="min-h-10 rounded-lg bg-alarm px-3 text-sm font-semibold text-on-alarm" onClick={nuevaHistoria}>Empezar otra</button>
              <button className="min-h-10 rounded-lg px-3 text-sm text-ink" onClick={() => setConfirmar(false)}>Cancelar</button>
            </span>
          </div>
        )}
        <nav aria-label="Apartados" className="xl:hidden"><Indice historia={historia} actual={actual} irA={irA} /></nav>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 px-4 pb-32 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:pb-16 xl:grid-cols-[210px_minmax(0,1fr)_370px] 2xl:mx-auto 2xl:max-w-[1600px]">
        <nav aria-label="Apartados" className="no-imprimir hidden xl:block">
          <div className="sticky top-24"><Indice historia={historia} actual={actual} irA={irA} vertical /></div>
        </nav>

        <main className="mx-auto grid w-full min-w-0 max-w-3xl content-start gap-5">
          {caso && <PacientePractica historia={historia} seccionId={actual} />}
          {seccion ? (
            <SeccionFormulario key={seccion.id} seccion={seccion} valores={historia[seccion.id] ?? {}}
              onCambio={(campo, valor) => setHistoria((h) => ({ ...h, [seccion.id]: { ...h[seccion.id], [campo]: valor } }))}
              guia={historia.guia ?? {}}
              onGuia={(clave, valor) => setHistoria((h) => ({ ...h, guia: { ...h.guia, [clave]: valor } }))}
              sexo={historia.filiacion?.sexo} historia={historia}>
              {seccion.id === 'sistemas' && (
                <button className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink hover:border-brand/60"
                  onClick={() => setHistoria((h) => ({ ...h, sistemas: Object.fromEntries(seccion.campos.map((c) => [c.id, (h.sistemas?.[c.id] ?? '').trim() || 'Niega'])) }))}>
                  <Icono nombre="check" className="h-4 w-4 text-brand" /> Escribir «Niega» en los sistemas vacíos
                </button>
              )}
              {seccion.id === 'impresion' && !caso && <ElegirDiagnosticos historia={historia} setHistoria={setHistoria} irA={irA} />}
              {seccion.id === 'personales' && <AntecedentesPersonales historia={historia} setHistoria={setHistoria} />}
              {seccion.id === 'familiares' && <AntecedentesFamiliares historia={historia} setHistoria={setHistoria} />}
            </SeccionFormulario>
          ) : (
            <Redaccion historia={historia} irA={irA} onNueva={() => setConfirmar(true)} onInicio={() => setVista('inicio')} />
          )}

          {seccion?.id === 'enfermedad' && <PestanasSintomas historia={historia} setHistoria={setHistoria} />}

          {/* Pasar la hoja */}
          <div className="no-imprimir mt-4 hidden items-center justify-between gap-3 border-t border-line pt-5 lg:flex">
            {anterior ? (
              <button className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-ink-soft hover:text-ink" onClick={() => irA(anterior.id)}>
                <Icono nombre="atras" className="h-5 w-5" /> {String(anterior.n).padStart(2, '0')} · {CORTO[anterior.id]}
              </button>
            ) : <span />}
            {siguiente ? (
              <button className="flex min-h-12 items-center gap-3 rounded-xl bg-brand px-5 text-on-brand hover:bg-brand-strong" onClick={() => irA(siguiente.id)}>
                <span className="text-left leading-tight"><span className="block text-xs opacity-80">Siguiente</span><span className="font-semibold">{String(siguiente.n).padStart(2, '0')} · {CORTO[siguiente.id]}</span></span>
                <Icono nombre="flecha" className="h-5 w-5" />
              </button>
            ) : caso ? (
              <button className="flex min-h-12 items-center gap-2 rounded-xl bg-brand px-5 font-semibold text-on-brand hover:bg-brand-strong" onClick={practica!.onTerminar}>
                Terminar y ver mi resultado <Icono nombre="flecha" className="h-5 w-5" />
              </button>
            ) : <span />}
          </div>
        </main>

        {/* El tutor al margen (iPad horizontal, iPad grande y computador) */}
        <aside aria-label="Tutor" className="no-imprimir hidden min-w-0 lg:block">
          <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-2xl bg-margen px-5 py-5 xl:top-24 xl:max-h-[calc(100vh-7rem)]">
            <p className="mb-5 flex items-baseline justify-between gap-2 border-b border-line pb-3">
              <span className="font-display text-2xl font-semibold text-ink">Tutor</span>
              <span className="text-xs text-ink-faint">notas al margen</span>
            </p>
            <Tutor historia={historia} setHistoria={setHistoria} irA={irA} practica={practica} />
          </div>
        </aside>
      </div>

      {/* Teléfono y iPad vertical: la nota principal asoma; al tocarla se abre el tutor */}
      <nav aria-label="Pasos y tutor" className="no-imprimir fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md lg:hidden">
        <button onClick={() => setTutorAbierto(true)} aria-haspopup="dialog"
          className={`flex min-h-11 w-full items-center gap-2 border-b border-line px-4 text-left text-sm ${nota.tono === 'alarma' ? 'bg-alarm-soft text-alarm' : nota.tono === 'brand' ? 'bg-margen text-brand-strong' : 'bg-margen text-ink-soft'}`}>
          <Icono nombre={nota.tono === 'alarma' ? 'alerta' : 'pulso'} className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate font-medium">{nota.texto}</span>
          <span className="shrink-0 text-xs font-semibold">Abrir tutor</span>
        </button>
        <div className="grid grid-cols-2 gap-2 px-3 pt-2">
          <button className="flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm text-ink-soft disabled:opacity-30" disabled={!anterior} onClick={() => anterior && irA(anterior.id)}>
            <Icono nombre="atras" className="h-5 w-5" /> {anterior ? CORTO[anterior.id] : 'Anterior'}
          </button>
          {siguiente ? (
            <button className="flex min-h-11 items-center justify-end gap-1 rounded-xl bg-brand px-3 text-sm font-semibold text-on-brand" onClick={() => irA(siguiente.id)}>
              {CORTO[siguiente.id]} <Icono nombre="flecha" className="h-5 w-5" />
            </button>
          ) : caso ? (
            <button className="flex min-h-11 items-center justify-end gap-1 rounded-xl bg-brand px-3 text-sm font-semibold text-on-brand" onClick={practica!.onTerminar}>Ver mi resultado</button>
          ) : <span />}
        </div>
      </nav>

      {tutorAbierto && (
        <div className="no-imprimir fixed inset-0 z-30 flex items-end bg-ink/30 backdrop-blur-[2px] lg:hidden" onClick={() => setTutorAbierto(false)}>
          <aside role="dialog" aria-modal="true" aria-label="Tutor" onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-margen px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-3 shadow-card">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" aria-hidden />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-ink">Tutor</h2>
              <button ref={cerrarTutorRef} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-2" onClick={() => setTutorAbierto(false)} aria-label="Cerrar tutor"><Icono nombre="cerrar" className="h-5 w-5" /></button>
            </div>
            <Tutor historia={historia} setHistoria={setHistoria} irA={irA} practica={practica} />
          </aside>
        </div>
      )}

      {verResultado && caso && (
        <ResultadoPractica historia={historia} onCerrar={() => setVerResultado(false)}
          onOtro={() => { setVerResultado(false); setVista('inicio') }} onRedaccion={() => { setVerResultado(false); irA('redaccion') }} />
      )}
      {hojas}
    </div>
  )
}

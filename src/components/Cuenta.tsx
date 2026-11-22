import { useState, type FormEvent, type ReactNode } from 'react'
import { cambiarClave, crearCuenta, entrar, mensajeError, recuperarClave, ROLES, validarCuenta, type Rol } from '../lib/nube'
import { Icono, Logo } from './Icono'

type Modo = 'entrar' | 'crear' | 'recuperar' | 'nuevaClave'

const claseInput =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15'

function Campo({ id, etiqueta, children, ayuda }: { id: string; etiqueta: string; children: ReactNode; ayuda?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{etiqueta}</label>
      {children}
      {ayuda && <p className="mt-1.5 text-xs text-ink-faint">{ayuda}</p>}
    </div>
  )
}

interface Props {
  /** Abierto desde el enlace de «olvidé mi contraseña». */
  recuperando?: boolean
  onListo: () => void
  onSinCuenta?: () => void
}

/** Pantalla de cuenta: entrar, crear cuenta, recuperar y cambiar contraseña. */
export function Cuenta({ recuperando, onListo, onSinCuenta }: Props) {
  const [modo, setModo] = useState<Modo>(recuperando ? 'nuevaClave' : 'entrar')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState<Rol>('interno')
  const [institucion, setInstitucion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [verClave, setVerClave] = useState(false)

  const cambiar = (m: Modo) => { setModo(m); setError(null); setAviso(null) }

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError(null); setAviso(null)
    const datos = { nombre, rol, institucion }
    const v = modo === 'recuperar' ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) ? null : 'Escriba un correo válido.')
      : modo === 'nuevaClave' ? (clave.length < 8 || !/[a-zA-Z]/.test(clave) || !/\d/.test(clave) ? 'La contraseña debe tener al menos 8 caracteres, con letras y números.' : null)
      : validarCuenta(correo, clave, modo === 'crear' ? datos : undefined)
    if (v) { setError(v); return }
    setOcupado(true)
    try {
      if (modo === 'entrar') { await entrar(correo, clave); onListo() }
      else if (modo === 'crear') {
        const r = await crearCuenta(correo, clave, datos)
        if (r.necesitaConfirmar) { setAviso(`Le enviamos un correo a ${correo.trim()}. Ábralo, toque el enlace para confirmar y luego entre con su contraseña.`); setModo('entrar') }
        else onListo()
      } else if (modo === 'recuperar') {
        await recuperarClave(correo)
        setAviso('Si ese correo tiene cuenta, le llegará un enlace para crear una contraseña nueva.')
      } else {
        await cambiarClave(clave)
        onListo()
      }
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setOcupado(false)
    }
  }

  const titulo = { entrar: 'Entrar a Hampi', crear: 'Crear cuenta', recuperar: 'Recuperar contraseña', nuevaClave: 'Nueva contraseña' }[modo]
  const boton = { entrar: 'Entrar', crear: 'Crear cuenta', recuperar: 'Enviar enlace', nuevaClave: 'Guardar contraseña' }[modo]

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-3">
          <Logo className="h-11 w-11" />
          <div>
            <p className="font-display text-2xl font-extrabold tracking-tight text-ink">Hampi</p>
            <p className="text-sm text-ink-soft">Historia clínica inteligente</p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
          {(modo === 'entrar' || modo === 'crear') && (
            <div role="tablist" aria-label="Cuenta" className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
              {([['entrar', 'Entrar'], ['crear', 'Crear cuenta']] as const).map(([id, t]) => (
                <button key={id} role="tab" aria-selected={modo === id} onClick={() => cambiar(id)}
                  className={`min-h-10 rounded-lg text-sm font-semibold transition-colors ${modo === id ? 'bg-surface text-ink shadow-card' : 'text-ink-soft'}`}>{t}</button>
              ))}
            </div>
          )}
          <h1 className="font-display text-xl font-bold text-ink">{titulo}</h1>
          {modo === 'crear' && <p className="mt-1 text-sm text-ink-soft">Sus historias se guardan en su cuenta y solo usted puede verlas.</p>}
          {modo === 'recuperar' && <p className="mt-1 text-sm text-ink-soft">Le enviaremos un enlace a su correo.</p>}

          <form onSubmit={enviar} className="mt-5 grid gap-4" noValidate>
            {modo === 'crear' && (
              <>
                <Campo id="cuenta-nombre" etiqueta="Nombre completo">
                  <input id="cuenta-nombre" className={claseInput} autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </Campo>
                <div>
                  <p id="cuenta-rol-etiqueta" className="mb-1.5 text-sm font-medium text-ink">Usted es</p>
                  <div role="radiogroup" aria-labelledby="cuenta-rol-etiqueta" className="grid grid-cols-2 gap-2">
                    {ROLES.map((r) => (
                      <button key={r.id} type="button" role="radio" aria-checked={rol === r.id} onClick={() => setRol(r.id)}
                        className={`min-h-11 rounded-xl border px-3 text-[15px] transition-colors ${rol === r.id ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface text-ink hover:border-brand/60'}`}>{r.nombre}</button>
                    ))}
                  </div>
                </div>
                <Campo id="cuenta-institucion" etiqueta="Hospital o universidad" ayuda="Ej.: Hospital Vicente Corral Moscoso, Universidad de Cuenca">
                  <input id="cuenta-institucion" className={claseInput} autoComplete="organization" value={institucion} onChange={(e) => setInstitucion(e.target.value)} />
                </Campo>
              </>
            )}
            {modo !== 'nuevaClave' && (
              <Campo id="cuenta-correo" etiqueta="Correo">
                <input id="cuenta-correo" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" className={claseInput}
                  value={correo} onChange={(e) => setCorreo(e.target.value)} />
              </Campo>
            )}
            {modo !== 'recuperar' && (
              <Campo id="cuenta-clave" etiqueta={modo === 'nuevaClave' ? 'Contraseña nueva' : 'Contraseña'}
                ayuda={modo === 'entrar' ? undefined : 'Al menos 8 caracteres, con letras y números.'}>
                <div className="relative">
                  <input id="cuenta-clave" type={verClave ? 'text' : 'password'} className={`${claseInput} pr-20`}
                    autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} value={clave} onChange={(e) => setClave(e.target.value)} />
                  <button type="button" onClick={() => setVerClave(!verClave)}
                    className="absolute inset-y-0 right-2 my-auto h-9 rounded-lg px-2.5 text-sm text-ink-soft hover:bg-surface-2">{verClave ? 'Ocultar' : 'Mostrar'}</button>
                </div>
              </Campo>
            )}

            {error && <p role="alert" className="flex gap-2 rounded-xl bg-alarm-soft p-3 text-sm text-alarm"><Icono nombre="alerta" className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
            {aviso && <p role="status" className="flex gap-2 rounded-xl bg-ok-soft p-3 text-sm text-ok"><Icono nombre="check" className="mt-0.5 h-4 w-4 shrink-0" />{aviso}</p>}

            <button type="submit" disabled={ocupado}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 font-semibold text-on-brand hover:bg-brand-strong disabled:opacity-60">
              {ocupado ? 'Un momento…' : boton}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
            {modo === 'entrar' && <button className="min-h-10 text-brand underline-offset-2 hover:underline" onClick={() => cambiar('recuperar')}>¿Olvidó su contraseña?</button>}
            {modo === 'recuperar' && <button className="min-h-10 text-brand underline-offset-2 hover:underline" onClick={() => cambiar('entrar')}>Volver a entrar</button>}
          </div>
        </section>

        {onSinCuenta && modo !== 'nuevaClave' && (
          <div className="mt-5 rounded-2xl border border-dashed border-line p-4 text-center">
            <button className="min-h-11 font-semibold text-ink underline-offset-2 hover:underline" onClick={onSinCuenta}>Seguir sin cuenta</button>
            <p className="mt-1 text-xs text-ink-faint">La historia se guarda solo en este dispositivo.</p>
          </div>
        )}
      </div>
    </main>
  )
}

import { useState } from 'react'
import { Icono, Logo } from './Icono'

export const VERSION_TERMINOS = '0.1-borrador'

const PUNTOS: [string, string][] = [
  ['Herramienta de apoyo', 'Hampi no diagnostica ni reemplaza el criterio médico. Toda decisión diagnóstica y terapéutica es responsabilidad del profesional que la usa.'],
  ['Sugerencias verificables', 'Las preguntas, los signos de alarma y los diagnósticos posibles pueden estar incompletos o equivocados. Cada sugerencia muestra su fuente para que pueda verificarla.'],
  ['Usted revisa y firma', 'El texto redactado por la app debe revisarse, corregirse y firmarse antes de pasar a la historia clínica oficial.'],
  ['Solo casos ficticios por ahora', 'Durante la etapa de prueba no ingrese nombres, cédulas ni datos reales de pacientes.'],
  ['Datos protegidos', 'Los datos se protegen con cifrado y acceso controlado, conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador. No comparta su cuenta.'],
  ['Supervisión docente', 'Estudiantes e internos usan la app bajo la supervisión de su docente o médico tratante.'],
]

export function Terminos({ onAceptar }: { onAceptar: () => void }) {
  const [leido, setLeido] = useState(false)
  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <Logo className="h-11 w-11" />
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Hampi</h1>
            <p className="text-sm text-ink-soft">Historia clínica inteligente · Medicina interna</p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Antes de empezar</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink">Términos y condiciones de uso</h2>
          <p className="mt-1 text-sm text-ink-faint">
            Versión {VERSION_TERMINOS}. Borrador pendiente de revisión por un abogado antes del uso con pacientes reales.
          </p>

          <ol className="mt-6 grid gap-4">
            {PUNTOS.map(([titulo, texto], i) => (
              <li key={titulo} className="flex gap-4">
                <span className="cifra mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-ink">{titulo}</p>
                  <p className="mt-0.5 text-[15px] leading-relaxed text-ink-soft">{texto}</p>
                </div>
              </li>
            ))}
          </ol>

          <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-2 p-4">
            <input id="acepto-terminos" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)]"
              checked={leido} onChange={(e) => setLeido(e.target.checked)} />
            <span className="text-[15px] text-ink">
              Entiendo que Hampi es una herramienta de apoyo y que la decisión clínica es mía.
            </span>
          </label>

          <button
            onClick={onAceptar}
            disabled={!leido}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 font-semibold text-on-brand transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            Aceptar y empezar <Icono nombre="flecha" className="h-5 w-5" />
          </button>
        </section>
        <p className="mt-6 text-center text-xs text-ink-faint">Cuenca, Ecuador · Datos de salud protegidos según la LOPDP</p>
      </div>
    </main>
  )
}

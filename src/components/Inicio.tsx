import { CASOS, type CasoPractica } from '../data/casosPractica'
import { edadTexto, type Historia } from '../lib/historia'
import { Icono, Logo } from './Icono'

interface Props {
  historia: Historia
  hayBorrador: boolean
  primeraVez: boolean
  conCuenta: boolean
  onSeguir: () => void
  onNueva: () => void
  onEjemplo: () => void
  onPracticar: (c: CasoPractica) => void
  onMisHistorias: () => void
  onEntrar: () => void
}

function resumen(h: Historia) {
  const f = h.filiacion ?? {}, m = h.motivo ?? {}
  const quien = [f.sexo, f.edad && edadTexto(f.edad)].filter(Boolean).join(', ') || 'Paciente sin datos'
  return { quien, motivo: m.motivo ? `«${m.motivo}»${m.tiempo ? `, ${m.tiempo}` : ''}` : 'sin motivo de consulta todavía' }
}

/** Portada: seguir, empezar o practicar. */
export function Inicio(p: Props) {
  const r = resumen(p.historia)
  const enPractica = !!p.historia.practica?.caso
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-4 pb-16 pt-8 sm:px-8 sm:pt-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <Logo className="h-14 w-14" />
          <div>
            <h1 className="font-display text-[44px] font-semibold leading-none text-ink">Hampi</h1>
            <p className="mt-1.5 text-ink-soft">Tu cuaderno de historias clínicas, con un tutor al margen.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.conCuenta ? (
            <button onClick={p.onMisHistorias} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 font-medium text-ink hover:border-brand/60">
              <Icono nombre="carpeta" className="h-4 w-4" /> Mis historias
            </button>
          ) : (
            <button onClick={p.onEntrar} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 font-medium text-ink hover:border-brand/60">
              <Icono nombre="persona" className="h-4 w-4" /> Entrar para guardar en tu cuenta
            </button>
          )}
        </div>
      </header>

      <section className="linea-margen renglones grid gap-5 rounded-2xl border border-line bg-surface py-6 pl-8 pr-6 sm:grid-cols-[1fr_auto] sm:items-center sm:py-8 sm:pl-12">
        {p.hayBorrador ? (
          <>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{enPractica ? 'Práctica a medias' : 'Historia a medias'}</p>
              <p className="mt-2 font-display text-[28px] font-semibold leading-tight text-ink">{r.quien}</p>
              <p className="mt-1 font-display text-lg italic text-ink-soft">{r.motivo}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
              <button onClick={p.onSeguir} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-[17px] font-semibold text-on-brand hover:bg-brand-strong">
                Seguir donde quedé <Icono nombre="flecha" className="h-5 w-5" />
              </button>
              <button onClick={p.onNueva} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 font-medium text-ink-soft hover:bg-surface-2">
                <Icono nombre="mas" className="h-4 w-4" /> Empezar una nueva
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Nueva historia · medicina interna</p>
              <p className="mt-2 text-balance font-display text-[28px] font-semibold leading-tight text-ink">Escribe como siempre. Hampi va anotando al margen.</p>
            </div>
            <button onClick={p.onNueva} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-[17px] font-semibold text-on-brand hover:bg-brand-strong">
              Empezar <Icono nombre="flecha" className="h-5 w-5" />
            </button>
          </>
        )}
      </section>

        <section aria-label="Cómo funciona" className="grid gap-4 sm:grid-cols-3">
          {[
            ['Escribe', 'El motivo, el relato y el examen. Puedes dictar con el micrófono.'],
            ['Mira el margen', 'El tutor anota lo que encontró, qué preguntar y qué diagnósticos suben, con su cita.'],
            ['Revisa y copia', 'Al final tienes la historia redactada y la presentación oral.'],
          ].map(([t, d], i) => (
            <div key={t} className="flex gap-3">
              <span className="font-display text-4xl font-semibold leading-none text-brand/75">{i + 1}</span>
              <div>
                <p className="font-semibold text-ink">{t}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{d}</p>
              </div>
            </div>
          ))}
        </section>

      <section aria-labelledby="practicar" className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="practicar" className="font-display text-[26px] font-semibold text-ink">Practicar con un caso</h2>
            <p className="text-sm text-ink-soft">Para estudiantes e internos. El paciente responde solo lo que le preguntes; al final ves qué te faltó.</p>
          </div>
          <button onClick={p.onEjemplo} className="min-h-10 text-sm font-semibold text-brand">Ver un caso de ejemplo ya lleno</button>
        </div>
        {CASOS.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-5 text-center text-sm text-ink-soft">Todavía no hay casos de práctica cargados.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-3">
            {CASOS.map((c) => (
              <li key={c.id}>
                <button onClick={() => p.onPracticar(c)}
                  className="group flex h-full w-full flex-col gap-3 rounded-xl border border-line bg-surface p-4 text-left transition-colors hover:border-brand/60">
                  <span className="flex items-center justify-between gap-2 text-xs">
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 font-semibold text-ink-soft">{c.nivel}</span>
                    <span className="text-ink-faint">{c.sexo}, {edadTexto(c.edad)}</span>
                  </span>
                  <span className="font-display text-xl font-semibold leading-snug text-ink">{c.titulo}</span>
                  <span className="font-display italic leading-snug text-ink-soft">«{c.motivo}»</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand">Practicar <Icono nombre="flecha" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-ink-faint">Casos ficticios, pendientes de revisión médica.</p>
      </section>

      <p className="border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
        Modo de prueba: usa solo casos ficticios. Hampi es una herramienta de apoyo; la decisión clínica es tuya.
      </p>
    </main>
  )
}

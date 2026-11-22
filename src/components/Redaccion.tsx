import { useState } from 'react'
import { faltantes, redactar, type Historia } from '../lib/historia'

export function Redaccion({ historia, irA }: { historia: Historia; irA: (seccionId: string) => void }) {
  const [copiado, setCopiado] = useState(false)
  const texto = redactar(historia)
  const falta = faltantes(historia)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold no-imprimir">10. Redacción final</h2>
      <p className="mt-1 text-slate-600 no-imprimir">
        Revise el texto antes de firmarlo. En una próxima etapa la IA mejorará la redacción.
      </p>

      {falta.length > 0 && (
        <div className="no-imprimir mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-medium text-amber-900">Faltan {falta.length} datos obligatorios:</p>
          <ul className="mt-2 space-y-1 text-sm">
            {falta.map((f) => (
              <li key={f.seccionId + f.campo}>
                <button className="text-left underline decoration-amber-400" onClick={() => irA(f.seccionId)}>
                  {f.seccion}: {f.campo}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="no-imprimir mt-4 flex gap-3">
        <button onClick={copiar} className="rounded-lg bg-marca px-4 py-2 font-medium text-white hover:bg-marca-oscuro">
          {copiado ? 'Copiado' : 'Copiar texto'}
        </button>
        <button onClick={() => window.print()} className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium">
          Imprimir o guardar PDF
        </button>
      </div>

      <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-5 font-sans text-[15px] leading-relaxed">
        {texto}
      </pre>
    </section>
  )
}

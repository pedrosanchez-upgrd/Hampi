export const VERSION_TERMINOS = '0.1-borrador'

const PUNTOS = [
  'Hampi es una herramienta de apoyo para llenar historias clínicas. No diagnostica ni reemplaza el criterio médico: toda decisión diagnóstica y terapéutica es responsabilidad del profesional que la usa.',
  'Las sugerencias (preguntas, signos de alarma y diagnósticos posibles) pueden estar incompletas o equivocadas. Cada sugerencia muestra su fuente para que pueda verificarla.',
  'El texto redactado por la app debe ser revisado, corregido y firmado por el profesional antes de incorporarse a la historia clínica oficial.',
  'Durante la etapa de prueba solo se permiten casos ficticios. No ingrese nombres, cédulas ni datos reales de pacientes.',
  'Los datos se protegen con cifrado y acceso controlado, conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador. Usted es responsable de no compartir su cuenta.',
  'Los estudiantes e internos deben usar la app bajo la supervisión de su docente o médico tratante.',
]

export function Terminos({ onAceptar }: { onAceptar: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-marca">Hampi</h1>
      <p className="mt-1 text-slate-600">Historia clínica inteligente</p>
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Términos y condiciones de uso</h2>
        <p className="mt-1 text-sm text-slate-500">
          Versión {VERSION_TERMINOS}. Borrador pendiente de revisión por un abogado antes del uso con pacientes reales.
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed">
          {PUNTOS.map((p) => <li key={p}>{p}</li>)}
        </ol>
        <button
          onClick={onAceptar}
          className="mt-8 w-full rounded-lg bg-marca px-4 py-3 font-medium text-white hover:bg-marca-oscuro"
        >
          Acepto: es una herramienta de apoyo y la decisión clínica es mía
        </button>
      </section>
    </main>
  )
}

# Hampi — guía para seguir programando

Hampi («medicina» en kichwa) es un sitio web que ayuda a médicos, internos y estudiantes a llenar historias clínicas: formulario por apartados con guía de preguntas, pestañas por síntoma, diagnósticos en vivo con su cita, aviso de faltantes y redacción final. Por ahora solo para hospitales y universidades de **Cuenca, Ecuador**.

Documentos de trabajo (Claude Docs): «Plan: Historia Clínica Inteligente», «Planificación Completa» y «Fase 1: Estructura de la historia clínica de medicina interna» (fuente del contenido de `src/data/secciones.ts`).

## Cómo está armado
- React + TypeScript + Vite + Tailwind 4. `npm run dev`, `npm test` (Vitest), `npm run build`.
- `src/data/secciones.ts`: los apartados, campos y preguntas guía.
- `src/lib/historia.ts`: validación de cédula, rangos de signos vitales (PROVISIONALES), faltantes y redacción.
- `supabase/migrations/`: esquema con RLS. **No aplicado** en ningún proyecto todavía.

## Reglas (obligatorias)
- Responder siempre en **español**; el dueño trabaja desde un iPad: explicar paso a paso.
- Avanzar fase por fase, probando cada parte antes de seguir. No adelantar funciones de fases posteriores.
- Es una herramienta de **apoyo**: nunca presentar sugerencias como diagnóstico. La decisión es del médico.
- Fase 1 solo con **casos ficticios**. Ningún dato real de pacientes.
- Contenido médico (preguntas, signos de alarma, rangos, reglas de diagnóstico) debe ser revisado por médicos antes de usarse; cada regla de diagnóstico lleva su cita (PMID) y aprobación.
- Datos de salud = sensibles (LOPDP Ecuador): RLS siempre activo, cifrado, auditoría. Nunca desactivar RLS.
- La IA solo recibe datos sin nombre ni cédula. Las claves (Supabase service_role, Anthropic) nunca en el repositorio ni en el navegador: van en Supabase Edge Functions.
- **No** crear proyectos de Supabase, aplicar migraciones, desplegar ni activar cobros sin autorización explícita. **No** inventar resultados de pruebas.
- Los términos y condiciones son borrador hasta que los revise un abogado ecuatoriano.

## Comprobar el diseño
Revisar en teléfono (390 px) e iPad (1024 px). Campos con `font-size:16px` para que el iPad no haga zoom.

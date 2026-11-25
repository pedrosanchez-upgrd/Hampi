# Hampi — guía para seguir programando

Hampi («medicina» en kichwa) es un sitio web que ayuda a médicos, internos y estudiantes a llenar historias clínicas: formulario por apartados con guía de preguntas, pestañas por síntoma, diagnósticos en vivo con su cita, aviso de faltantes y redacción final. Por ahora solo para hospitales y universidades de **Cuenca, Ecuador**.

Documentos de trabajo (Claude Docs): «Plan: Historia Clínica Inteligente», «Planificación Completa» y «Fase 1: Estructura de la historia clínica de medicina interna» (fuente del contenido de `src/data/secciones.ts`).

## Cómo está armado
- React + TypeScript + Vite + Tailwind 4. `npm run dev`, `npm test` (Vitest), `npm run build`.
- `src/data/secciones.ts`: los apartados, campos y preguntas guía.
- `DESIGN.md`: brief de diseño. Dirección desde 25-nov-2026: «cuaderno clínico con tutor al margen» (papel cálido, renglones `.renglones`, línea de margen `.linea-margen`, títulos Source Serif 4, trato de «tú»). Pantallas: `Inicio.tsx` (portada), `Tutor.tsx` (columna del tutor y cajón del teléfono), `ResultadoPractica.tsx`; modo práctica en `src/data/casosPractica.ts` (3 casos ficticios, pendientes de revisión médica). Tokens en `src/index.css` (claro y oscuro). Íconos propios en `src/components/Icono.tsx`.
- `src/data/sintomas.ts`: 41 pestañas de síntoma (palabras clave, preguntas, signos de alarma Sí/No; los «No» salen como negativos pertinentes).
- `src/data/antecedentes.ts`: patológicos, familiares por parentesco y epidemiológicos de Ecuador; algunos alimentan hallazgos del motor.
- `src/data/casoEjemplo.ts`: caso ficticio de dolor torácico para probar.
- `src/data/redaccionAyuda.ts`: sugerencias de redacción bajo cada campo (relato armado con ALICIA, examen físico normal por región, síndromes por síntoma, crónicos desde antecedentes, educación desde alarmas). Nunca inventan datos del paciente.
- `src/data/considerar.ts`: «Otros a considerar» por síntoma (lista orientativa, sin puntaje). `Diagnostico.estudios`: solo exámenes que menciona el resumen del artículo citado. `preguntasParaAfinar` (motor): hallazgos sin responder que cambiarían el orden.
- Lección aprendida (22-nov): lo negado («niega…», «sin…», «no refiere…») no abre pestañas de síntoma; ver prueba de regresión en `src/data/redaccionAyuda.test.ts`.
- `src/data/conocimiento.ts`: fuentes (PMID/DOI verificados en PubMed), hallazgos, diagnósticos y reglas (LR o cualitativo). Para revisión médica: doc «Hampi: reglas de diagnóstico para revisión médica» (https://claude.ai/artifact/QSfWHA3DE64FrZQEgQF3tR). Toda regla nueva lleva fuente verificada.
- `src/data/detectarHallazgos.ts`: lee lo escrito (motivo, enfermedad actual, antecedentes, sistemas, examen) y propone hallazgos del motor («Encontré esto en lo que escribió»); el médico confirma o dice «No corresponde» (`diagnosticosVivo.ignorados`). Negación fuerte hasta el punto, «no» hasta la coma; signos del examen solo con «positivo/negativo». Nunca marca solo.
- `src/data/abreviaturas.ts`: abreviaturas de un solo significado (en mayúsculas) con botón «Escribir completo»; no incluye IV, IM, AP (ambiguas).
- `preguntasClave` (motor): «Pregunte o examine esto ahora», 3 hallazgos sin responder que más moverían la lista (peso por LR y por puesto, una por diagnóstico primero). Revisión por sistemas: tras «Niega» se ofrece escribir qué niega. Plan → exámenes: estudios de la fuente de los diagnósticos elegidos.
- `src/lib/historia.ts`: cédula, rangos de signos vitales (PROVISIONALES), pestañas abiertas, faltantes, redacción y `textoParaIA` (sin identificadores).
- `src/lib/motor.ts`: diagnósticos en vivo (producto de LR, determinista). Reglas: `lrPos`/`lrNeg` (números del resumen del artículo), `cualitativo` (×2/×0,5), `soloAusente` (el artículo la valida solo para descartar, p. ej. fiebre en meningitis, Ottawa HSA) y `conteo` (POUND, ACV).
- Lección aprendida (23-nov, revisión): «niega/sin…» niega la lista hasta el punto, pero se corta cuando empieza otra frase (tras coma: «de…», «presenta…»; o «pero», «aunque»). «Sin embargo» no niega. Lógica única en `tramosNegados` (sintomas.ts), usada por pestañas y hallazgos.
- Revisión de tipos de `supabase/` (no la cubre `tsc -b`): usar un tsconfig aparte con `allowImportingTsExtensions` y una declaración mínima de `Deno`.
- Lección aprendida (23-nov): una regla validada para descartar no debe subir el diagnóstico cuando el hallazgo está presente. Probar cada regla nueva con un caso donde no corresponde (ver `src/lib/fase2.test.ts`).
- Solo se usan números que aparecen en el resumen de PubMed; si el resumen no está disponible (Holleman 1995, Deyo 1992, Williams 1992), no se usa el artículo.
- Revisión de accesibilidad: `npm run build`, `npx vite preview --port 4173` y `npm run revisar:accesibilidad` (axe, claro y oscuro).
- Supabase: proyecto **Hampi** (`absuudeafyxnjvnbejrv`, us-east-1) en la organización de Pedro, creado el 22-nov-2026. Migración `20261122_01_inicial.sql` **aplicada**; asesor de seguridad sin avisos; el rol anónimo no tiene acceso a ninguna tabla. URL y clave publicable en `src/lib/config.ts`. Pruebas locales: `supabase/test/rls.test.ts` (PGlite). La app tiene cuentas con correo y contraseña (`src/lib/nube.ts`, `Cuenta.tsx`, `MisHistorias.tsx`) y guardado automático; sin cuenta guarda en el dispositivo. El Artifact y este contenedor NO llegan a supabase.co: el inicio de sesión se prueba en la versión publicada en Cloudflare (`wrangler.jsonc`, cabeceras en `public/_headers`).
- Carrington Medidas se transfirió el 22-nov a la organización «Carrington» de los papás de Pedro (Pedro es miembro, no dueño). No tocar.
- `supabase/functions/redactar/`: redacción con Claude. **No desplegada.**
- **Fase 3 (empezada el 22-nov-2026, a pedido del dueño):**
  - Migraciones `20261123_01_evidencia.sql` y `20261125_01_evidencia_ajustes.sql` **aplicadas el 25-nov-2026** con autorización del dueño (asesor de seguridad sin avisos; `es_revisor` es `security invoker`; una sola política de lectura en `evidencia`). Tablas: `revisores` (solo administración los agrega), `revistas` (calidad por ISSN), `evidencia` (artículos encontrados; la app no puede insertar), `reglas_aprobadas` (cuentan solo con `confirmada_por` ≠ `aprobada_por`). Funciones `security definer` en el esquema `privado` (no expuesto por la API) para evitar recursión entre políticas. Pruebas: `supabase/test/evidencia.test.ts`.
  - `supabase/functions/_shared/evidencia.ts`: lee PubMed (efetch XML), SciELO (buscador, `output=rss`; el PID trae ISSN y año) y Elsevier (Scopus Search JSON); filtro de calidad Q1/Q2 (Scimago), A1/A2 (Publindex) o catálogo Latindex. Ejemplos reales en `_shared/ejemplos/`. Pruebas: `supabase/test/fuentes.test.ts`.
  - `supabase/functions/buscar-evidencia/`: busca y guarda como pendiente (**desplegada el 25-nov-2026**, verify_jwt activo; no probada contra internet desde el contenedor). La tabla `revistas` está vacía: hasta cargarla, el filtro de calidad rechaza todo. Secretos opcionales `ELSEVIER_API_KEY`, `NCBI_API_KEY`.
  - `scripts/revistas.mjs`: arma el SQL de `revistas` desde los CSV de Scimago, Latindex y Publindex (revisar encabezados con los archivos reales).
  - App: `src/lib/evidenciaNube.ts` (`validarRegla`: la cita debe estar en el resumen y contener el número), `src/components/Revision.tsx` (solo revisores), el motor suma reglas confirmadas (`establecerReglasAprobadas`).
  - Dictado por voz: `src/lib/dictado.ts` (reconocimiento del navegador, es-EC; «coma», «punto y seguido», «punto y aparte»). El navegador puede enviar la voz a Apple o Google.
- Vista de prueba (Artifact privado): https://claude.ai/artifact/Q7nDf8RaNk2H7kbCA8akc4 — se rearma con `npm run build && node scripts/artifact.mjs <salida.html>` y se publica en la misma dirección.

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

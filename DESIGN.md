# DESIGN.md · Hampi

> Si este archivo y el código no coinciden, manda el código hasta que Pedro decida. Anotar el conflicto en Preguntas abiertas.
> Escrito en modo «solo avanza» (Pedro pidió trabajar sin detenerse la noche del 22-nov-2026): todo lo que no vino de él está marcado «(supuesto)» y queda para su aprobación.

## Producto
Sitio web (luego app) que ayuda a médicos, internos y estudiantes de medicina de Cuenca, Ecuador, a llenar la historia clínica de medicina interna **mientras entrevistan al paciente**: apartados con guía de preguntas, pestañas por síntoma, diagnósticos en vivo con su cita, aviso de faltantes y redacción final para revisar y firmar.
Dispositivos: iPad (principal, 820–1366 px), teléfono (390 px) y computador del hospital (1280 px+) (supuesto).
Trabajo principal de la pantalla más usada: registrar un dato y seguir conversando con el paciente sin perder el hilo; mirar de reojo qué falta y qué diagnóstico sube.

## Audiencia y voz
Internos, estudiantes y médicos; saben medicina pero tienen poco tiempo y muchas interrupciones. Español de Ecuador, tuteo profesional evitado: «usted» en la app (supuesto). Términos clínicos correctos (ALICIA, Murphy, LR), frases cortas, nada de exclamaciones. Fechas 22/11/2026, horas 14:30, unidades SI (mmHg, °C, mg/dL).

## Mood
Palabras: sereno, preciso, confiable (supuesto, a partir de «amigable, llamativo y lindo» de Pedro).
Nunca como: un panel genérico de SaaS, una app de bienestar con degradados, un sistema hospitalario gris de los 2000, nada que parezca un juego.

## Marca
Nombre: Hampi («medicina» en kichwa). Sin logo previo: se usa un monograma simple (hoja + trazo de pulso) (supuesto).
Color principal: verde eucalipto profundo, de las plantas medicinales andinas (supuesto). Superficies tipo papel de ficha clínica, frías y limpias.
Color semántico separado del acento: rojo de alarma, ámbar de faltante, verde de completo.
Tipos: Plus Jakarta Sans para títulos, Inter para texto y formularios, JetBrains Mono para cifras y signos vitales (supuesto).

## Referencias
- Formularios del MSP (anamnesis y examen físico) — tomar: el orden de apartados que el médico ya conoce; evitar: la densidad y las casillas diminutas.
- Monitor de signos vitales — tomar: cifra grande con unidad y estado de color; evitar: el negro con neón.
- Apps clínicas de consulta rápida (calculadoras, guías) — tomar: respuestas en un toque y fuentes a la vista; evitar: la publicidad y los menús profundos.
(Referencias propuestas por Claude; pendientes de que Pedro diga qué tomar y qué evitar.)

## Restricciones
- iPad primero, también teléfono (390 px) y computador. Toques de 44 px como mínimo; texto de formulario de 16 px (evita el zoom del iPad).
- WCAG AA. Tema claro y **oscuro** (guardias nocturnas: menos brillo). Respetar «reducir movimiento».
- Sin dependencias de íconos externas: íconos SVG propios en línea.
- Movimiento solo para confirmar acciones y para que la lista de diagnósticos se reordene sin saltos.
- Debe verse bien impreso (la redacción final).

## Registro de decisiones
- 2026-11-22 — Modo oscuro incluido desde el inicio — se usa en guardias nocturnas.
- 2026-11-22 — Panel «Asistente» (diagnósticos + guía) a la derecha en pantallas anchas y en hoja deslizable en iPad vertical y teléfono — el médico no debe perder el formulario de vista.
- 2026-11-22 — Banda del paciente fija arriba (sexo, edad, motivo, alarmas) — como la cabecera de una historia en papel.

## Preguntas abiertas
- ¿Le gusta a Pedro el verde eucalipto como color principal, o prefiere otro?
- ¿«Usted» o «tú» en los textos de la app?
- ¿Qué referencias le gustan y qué tomar/evitar de cada una?
- ¿Logo propio más adelante?

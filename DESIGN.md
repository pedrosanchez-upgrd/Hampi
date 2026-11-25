# DESIGN.md · Hampi

> Si este archivo y el código no coinciden, manda el código hasta que Pedro decida. Anotar el conflicto en Preguntas abiertas.
> Escrito en modo «solo avanza» (Pedro pidió trabajar sin detenerse la noche del 22-nov-2026): todo lo que no vino de él está marcado «(supuesto)» y queda para su aprobación.

## Producto
Sitio web (luego app) que ayuda a médicos, internos y estudiantes de medicina de Cuenca, Ecuador, a llenar la historia clínica de medicina interna **mientras entrevistan al paciente**: apartados con guía de preguntas, pestañas por síntoma, diagnósticos en vivo con su cita, aviso de faltantes y redacción final para revisar y firmar.
Dispositivos: iPad (principal, 820–1366 px), teléfono (390 px) y computador del hospital (1280 px+) (supuesto).
Trabajo principal de la pantalla más usada: registrar un dato y seguir conversando con el paciente sin perder el hilo; mirar de reojo qué falta y qué diagnóstico sube.

## Audiencia y voz
Internos, estudiantes y médicos; saben medicina pero tienen poco tiempo y muchas interrupciones. Español de Ecuador. La app trata al usuario de **tú** (decidido por Pedro, 25-nov-2026); las preguntas al paciente van en «usted». Términos clínicos correctos (ALICIA, Murphy, LR), frases cortas, nada de exclamaciones. Fechas 22/11/2026, horas 14:30, unidades SI (mmHg, °C, mg/dL).

## Mood
Palabras: sereno, preciso, confiable (supuesto, a partir de «amigable, llamativo y lindo» de Pedro).
Nunca como: un panel genérico de SaaS, una app de bienestar con degradados, un sistema hospitalario gris de los 2000, nada que parezca un juego.

## Marca
Nombre: Hampi («medicina» en kichwa). Sin logo previo: se usa un monograma simple (hoja + trazo de pulso) (supuesto).
Color principal: verde eucalipto profundo, de las plantas medicinales andinas. Superficies de **cuaderno clínico**: papel cálido, renglones suaves y línea roja de margen.
Color semántico separado del acento: rojo de alarma, ámbar de faltante, verde de completo.
Tipos: **Source Serif 4** para títulos, números de apartado, guion de entrevista y citas del paciente; Inter para texto y formularios; JetBrains Mono para cifras y signos vitales.

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

- 2026-11-23 — Flechas ▲▼ para factores cualitativos y número solo para LR publicados — evitar falsa precisión.
- 2026-11-23 — Contraste revisado con axe-core (WCAG AA) en claro y oscuro; token on-alarm para texto sobre rojo.
- 2026-11-22 — Refinamiento (craft-critique): barra inferior en el teléfono (Anterior · Asistente · Siguiente) en vez de botón flotante que tapaba campos; menú «Más» con nombres; «No» en tono suave y «?» sin relleno (un solo color fuerte: Sí y alarmas); íconos por apartado dentro del anillo de progreso; «Paso X de 10»; guía «Qué preguntar» en tarjeta blanca; aviso de prueba corto en el teléfono.

- 2026-11-25 — Rediseño «cuaderno clínico con tutor al margen» (Pedro: «lo veo muy genérico», eligió que Claude decida la dirección) — se dejó el esquema típico de SaaS (menú lateral + tarjetas blancas iguales). La historia se ve como un cuaderno: papel cálido, renglones, línea de margen, números de apartado grandes con serifa.
- 2026-11-25 — El tutor siempre a la vista en iPad 1024+ y computador (columna «Tutor · notas al margen»): alarmas, «Encontré esto en lo que escribiste», «Pregunta o examina esto ahora», lo más probable y lo que falta, en ese orden de urgencia — lo más útil de Hampi estaba escondido detrás de un botón. En teléfono e iPad vertical, cajón inferior que asoma con la nota más importante.
- 2026-11-25 — Índice como pestañas de cuaderno numeradas (01–10) arriba; vertical a la izquierda desde 1280 px.
- 2026-11-25 — Cada campo principal lleva arriba la pregunta al paciente en cursiva con serifa («¿Desde cuándo le pasa?») — la sección se lee como una conversación.
- 2026-11-25 — Portada nueva (seguir donde quedé, empezar, practicar) y **Modo práctica** con 3 casos ficticios: el paciente responde solo lo que se le pregunta; el tutor se calla hasta el final; resultado con diagnóstico, preguntas clave que faltaron y la enseñanza del caso.
- 2026-11-25 — Trato de «tú» en toda la app.
- 2026-11-25 — Sombras solo en lo que flota (menú, hojas, diálogos); las hojas del cuaderno van con borde y línea de margen.
- 2026-11-25 — Autocrítica: botones «Preguntar o examinar» como texto (doce botones con borde formaban una pared), números decorativos subidos a 75 % para contraste AA, títulos balanceados.

- 2026-11-25 — Menos saturación (Pedro: «que no se vea hecho shampoo»). Método: divulgación progresiva, lo esencial a la vista y el resto a un toque. Guion: solo la siguiente pregunta («Ver todo el guion»). Sugerencias plegadas en una línea. Pregunta al paciente como nota bajo la etiqueta. Antecedentes como fichas de un toque (Sí → No → vacío) con detalle solo para «Sí»; familiares: primero la enfermedad, luego el parentesco. Hallazgos: solo los pendientes; «Ya respondidos (n)» plegado. Tutor: 1 pregunta, 3 encontrados, 3 diagnósticos y «Te falta» con 2. Una sola hoja por apartado. Alturas en iPad: Enfermedad actual 4073→2628 px, Personales 5961→4309, Familiares 2383→1546, Examen 3998→2896, Impresión 2910→2098.
- 2026-11-25 — Opciones de semiología al escribir (ALICIA): aparecen solo con el campo activo y se filtran con lo que se escribe («opr» → Opresivo).
- 2026-11-25 — Redacción: signos vitales en una línea, numeración seguida, listas con «y», «8/10» sin espacio, «de localización».

- 2026-11-25 — Evaluación heurística (Nielsen) y prueba de estrés (break-ui), todo corregido: «Deshacer» al usar una sugerencia; guardado visible en el teléfono; avisos de número/edad/intensidad; recuperar lo ocultado con «No corresponde»; cajón del tutor con Escape y foco; siguiente paso al final de la redacción; «Cómo funciona» siempre en la portada; columna que nunca supera el ancho de pantalla (320 px); «1 año»; «Falta 1 dato»; limpieza de espacios pegados; «Seguir donde quedé» vuelve al apartado. Informe: https://claude.ai/artifact/YKq3qLK7ozaBQMam8sUAC8

## Preguntas abiertas
- ¿Le gusta a Pedro el papel cálido del cuaderno, o prefiere un fondo más blanco?
- Fichas de antecedentes de un toque (vacía → Sí → No): la evaluación heurística las marcó como algo que hay que recordar; se mantiene la leyenda. Confirmar con internos reales si se entiende o si conviene Sí/No separados.
- ¿Coma o punto decimal? Se usa coma (36,8 °C) (supuesto); confirmar el uso en los hospitales de Cuenca.
- ¿Qué referencias le gustan y qué tomar/evitar de cada una?
- ¿Logo propio más adelante?

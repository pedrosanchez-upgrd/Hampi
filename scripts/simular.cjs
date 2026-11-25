// «Interno simulado»: un robot llena historias completas en Hampi (iPad y teléfono) como lo haría una
// persona, cuenta el esfuerzo y revisa en cada paso qué está mal. No reemplaza la prueba con internos
// reales: el tiempo es una ESTIMACIÓN con un modelo de tiempos de interfaz.
// Uso: npm run build && npx vite preview --port 4173 (otra terminal) && node scripts/simular.cjs salida.json
const { chromium, devices } = require('playwright')
const fs = require('fs')
const CASOS = require('./simulacion/casos.cjs')

// Tiempos por operación (segundos). Toque y decisión: modelo KLM de Card, Moran y Newell (apuntar ≈ 1,1 s; pensar ≈ 1,35 s).
// Letra en teclado de pantalla y letra a mano: SUPUESTOS (0,35 s y 0,67 s ≈ 15 palabras por minuto a mano).
const T = { toque: 1.1, letra: 0.35, decision: 1.35, letraMano: 0.67 }
const REGION = { 'Cabeza y cuello': 'cabezaCuello', 'Tórax y pulmones': 'torax', 'Corazón': 'corazon', 'Abdomen': 'abdomen', 'Extremidades': 'extremidades', 'Piel': 'pielExamen', 'Neurológico': 'neurologico' }
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

async function simular(caso, nombreDisp, opciones, navegador) {
  const ctx = await navegador.newContext(opciones)
  const p = await ctx.newPage()
  p.setDefaultTimeout(5000)
  const paso = (t) => { if (process.env.DEPURAR) console.log(`  [${caso.id}·${nombreDisp}] ${t}`) }
  const hallazgos = [] // { gravedad: 'grave'|'medio'|'leve', donde, que }
  const nota = (gravedad, donde, que) => hallazgos.push({ gravedad, donde, que })
  const cuenta = { toques: 0, letras: 0, decisiones: 0 }
  p.on('pageerror', (e) => nota('grave', 'App', `Error de la app: ${e.message}`))
  p.on('console', (m) => { if (m.type() === 'error' && !/fonts|Failed to load resource/.test(m.text())) nota('grave', 'App', `Error en consola: ${m.text().slice(0, 140)}`) })
  const telefono = (opciones.viewport?.width ?? 400) < 1024

  const tocar = async (loc, decide = false) => { await loc.click(); cuenta.toques++; if (decide) cuenta.decisiones++ }
  const escribir = async (sel, texto) => {
    const loc = p.locator(sel)
    await loc.click(); cuenta.toques++; cuenta.decisiones++
    await loc.fill(texto); cuenta.letras += texto.length
  }
  const ir = async (t) => { await tocar(p.locator('nav[aria-label="Apartados"] button:visible', { hasText: t }).first()); await p.waitForTimeout(150); await revisarPantalla(t) }

  async function revisarPantalla(donde) {
    const r = await p.evaluate(() => {
      const visibles = [...document.querySelectorAll('button, a, input, select, textarea, [role="radio"], [role="tab"]')].filter((e) => {
        const b = e.getBoundingClientRect(); const s = getComputedStyle(e)
        return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && !e.closest('[aria-hidden="true"]')
      })
      const chicos = visibles.filter((e) => { const b = e.getBoundingClientRect(); return b.height < 36 && e.tagName !== 'INPUT' })
        .map((e) => (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 40))
      const letraChica = visibles.filter((e) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.tagName) && e.type !== 'checkbox' && parseFloat(getComputedStyle(e).fontSize) < 16)
        .map((e) => e.id || e.getAttribute('aria-label') || e.tagName)
      return { desborde: document.documentElement.scrollWidth > window.innerWidth + 1, chicos: [...new Set(chicos)], letraChica, alto: document.documentElement.scrollHeight }
    })
    if (r.desborde) nota('medio', donde, 'La pantalla se sale de lado (desborde horizontal).')
    if (r.chicos.length) nota('leve', donde, `Botones de menos de 36 px de alto: ${r.chicos.slice(0, 6).join(' · ')}${r.chicos.length > 6 ? ` y ${r.chicos.length - 6} más` : ''}.`)
    if (r.letraChica.length) nota('medio', donde, `Campos con letra menor de 16 px (el iPad hace zoom): ${r.letraChica.join(', ')}.`)
    return r
  }

  async function tutor() {
    if (!telefono) return p.locator('aside[aria-label="Tutor"]')
    await tocar(p.getByRole('button', { name: /Abrir tutor/ }))
    return p.locator('[role="dialog"][aria-label="Tutor"]')
  }
  const cerrarTutor = async () => { if (telefono) await tocar(p.getByRole('button', { name: 'Cerrar tutor' })) }

  const inicio = Date.now()
  await p.goto('http://localhost:4173')
  await tocar(p.locator('#acepto-terminos')); await tocar(p.getByRole('button', { name: /Aceptar y empezar/ }))
  const sin = p.getByRole('button', { name: 'Seguir sin cuenta' }); if (await sin.count()) await tocar(sin)
  await revisarPantalla('Portada')
  await tocar(p.getByRole('button', { name: /^Empezar/ }))

  paso('01 Filiación')
  // 01 Filiación
  await revisarPantalla('Filiación')
  await escribir('#campo-edad', caso.filiacion.edad)
  await tocar(p.getByRole('radio', { name: caso.filiacion.sexo, exact: true }), true)
  if (caso.filiacion.ocupacion) await escribir('#campo-ocupacion', caso.filiacion.ocupacion)
  await tocar(p.getByRole('radiogroup', { name: /Fuente de la historia/ }).getByRole('radio', { name: 'Paciente' }), true)

  paso('02 Motivo')
  // 02 Motivo
  await ir('Motivo')
  await escribir('#campo-motivo', caso.motivo.motivo)
  await escribir('#campo-tiempo', caso.motivo.tiempo)

  paso('03 Enfermedad actual')
  // 03 Enfermedad actual
  await ir('Enfermedad actual')
  await escribir('#campo-relato', caso.relato)
  for (const [campo, v] of Object.entries(caso.alicia)) {
    if (typeof v === 'string') { await escribir(`#campo-${campo}`, v); continue }
    const loc = p.locator(`#campo-${campo}`)
    await loc.click(); cuenta.toques++; cuenta.decisiones++
    await loc.pressSequentially(v.escribir); cuenta.letras += v.escribir.length
    const op = p.getByLabel('Opciones para escribir').getByRole('button', { name: v.elegir, exact: true })
    if (await op.count()) { await tocar(op); if ((await loc.inputValue()) !== v.elegir) nota('medio', 'Enfermedad actual', `Al tocar la opción «${v.elegir}» el campo quedó «${await loc.inputValue()}».`) }
    else { nota('medio', 'Enfermedad actual', `Al escribir «${v.escribir}» en ${campo} no apareció la opción «${v.elegir}».`); await loc.fill(v.elegir); cuenta.letras += v.elegir.length - v.escribir.length }
  }
  paso('Pestañas de síntoma')
  // Pestañas de síntoma
  const tabs = await p.locator('[aria-label="Síntomas abiertos"] [role="tab"]').allInnerTexts()
  const nombresTabs = tabs.map((t) => t.replace(/\s*\d+\s*$/, '').trim())
  for (const esperada of caso.pestanas) if (!nombresTabs.includes(esperada)) nota('grave', 'Enfermedad actual', `No se abrió la pestaña «${esperada}» (abiertas: ${nombresTabs.join(', ') || 'ninguna'}).`)
  paso('Signos de alarma')
  // Signos de alarma en todas las pestañas abiertas
  for (let i = 0; i < tabs.length; i++) {
    await tocar(p.locator('[aria-label="Síntomas abiertos"] [role="tab"]').nth(i))
    const grupos = p.locator('[role="group"][aria-label^="Alarma: "]:visible')
    for (let j = 0; j < await grupos.count(); j++) {
      const g = grupos.nth(j); const alarma = (await g.getAttribute('aria-label')).replace('Alarma: ', '')
      await tocar(g.getByRole('button', { name: caso.alarmasSi.includes(alarma) ? 'Sí' : 'No', exact: true }), true)
    }
  }
  paso('Lo que Hampi encontró')
  // Lo que Hampi encontró en el texto
  let raiz = await tutor()
  const tarjeta = raiz.locator('div.rounded-xl', { hasText: 'Encontré esto en lo que escribiste' }).first()
  if (!(await tarjeta.count())) nota('grave', 'Tutor', 'No apareció «Encontré esto en lo que escribiste».')
  else {
    const mas = tarjeta.getByRole('button', { name: /^Ver \d+ más$/ }); if (await mas.count()) await tocar(mas)
    const items = (await tarjeta.locator('li').allInnerTexts()).map((t) => t.split('\n')[0])
    for (const [texto, estado] of Object.entries(caso.encontrar))
      if (!items.some((x) => x.includes(texto) && x.includes(estado))) nota('grave', 'Tutor', `No encontró en el texto «${texto}» como ${estado.toLowerCase()} (encontró: ${items.join(' | ') || 'nada'}).`)
    for (const x of items) if (!Object.keys(caso.encontrar).some((t) => x.includes(t))) nota('leve', 'Tutor', `Propuso algo que el caso no esperaba (revisar si está bien): «${x.replace(/\s+/g, ' ')}».`)
    const todos = tarjeta.getByRole('button', { name: /^Confirmar los/ })
    if (await todos.count()) await tocar(todos, true); else if (await tarjeta.getByRole('button', { name: 'Confirmar' }).count()) await tocar(tarjeta.getByRole('button', { name: 'Confirmar' }).first(), true)
  }
  await cerrarTutor()
  paso('Responder hallazgos')
  // Responder hallazgos clave en las pestañas
  for (const [texto, r] of Object.entries(caso.responder)) {
    let hecho = false
    for (let i = 0; i < tabs.length && !hecho; i++) {
      await tocar(p.locator('[aria-label="Síntomas abiertos"] [role="tab"]').nth(i))
      let g = p.locator(`[role="group"][aria-label="${texto}"]:visible`)
      if (!(await g.count())) { const ya = p.getByRole('button', { name: /Ya respondidos/ }); if (await ya.count() && (await ya.getAttribute('aria-expanded')) === 'false') await tocar(ya); g = p.locator(`[role="group"][aria-label="${texto}"]:visible`) }
      if (await g.count()) { await tocar(g.first().getByRole('button', { name: r, exact: true }), true); hecho = true }
    }
    if (!hecho) nota('medio', 'Enfermedad actual', `No encontré dónde responder «${texto}».`)
  }
  await revisarPantalla('Enfermedad actual (después de responder)')

  paso('04 Personales')
  // 04 Personales
  await ir('Personales')
  for (const [nombre, detalle] of Object.entries(caso.antecedentes)) {
    await tocar(p.getByRole('button', { name: new RegExp(`^${esc(nombre)}: `) }), true)
    const det = p.locator('label', { has: p.locator('span', { hasText: new RegExp(`^${esc(nombre)}$`) }) }).locator('input')
    if (await det.count()) { await det.first().fill(detalle); cuenta.letras += detalle.length; cuenta.toques++ } else nota('medio', 'Personales', `No apareció el detalle de «${nombre}» al marcarlo.`)
  }
  for (let i = 0; i < 3 && await p.getByRole('button', { name: /^Niega las otras/ }).count(); i++) await tocar(p.getByRole('button', { name: /^Niega las otras/ }).first(), true)
  if (caso.mujer) {
    await escribir('#campo-fum', '2026-11-10')
    await tocar(p.getByRole('radiogroup', { name: /Posibilidad de embarazo/ }).getByRole('radio', { name: caso.mujer.embarazo, exact: true }), true)
  }
  await tocar(p.getByRole('button', { name: 'Niega alergias', exact: true }), true)
  if (caso.medicamentos) await escribir('#campo-farmacologicos', caso.medicamentos)
  else await tocar(p.getByRole('button', { name: 'No toma medicamentos', exact: true }), true)
  const nNiega = await p.getByRole('button', { name: 'Niega', exact: true }).count()
  for (let i = 0; i < nNiega; i++) await tocar(p.getByRole('button', { name: 'Niega', exact: true }).nth(i), true)

  paso('05 Familiares')
  // 05 Familiares
  await ir('Familiares')
  if (!Object.keys(caso.familiares).length) await tocar(p.getByRole('button', { name: 'Niega antecedentes familiares' }), true)
  for (const [enf, quien] of Object.entries(caso.familiares)) {
    await tocar(p.getByRole('button', { name: enf, exact: true }), true)
    await tocar(p.getByRole('group', { name: `${enf}: parentesco` }).getByRole('button', { name: quien, exact: true }), true)
  }

  paso('06 Sistemas')
  // 06 Sistemas
  await ir('Sistemas')
  await tocar(p.getByRole('button', { name: /Escribir «Niega» en los sistemas vacíos/ }), true)

  paso('07 Examen físico')
  // 07 Examen físico
  await ir('Examen físico')
  for (const [k, v] of Object.entries(caso.vitales)) await escribir(`#campo-${k}`, v)
  await escribir('#campo-aspecto', caso.aspecto)
  if (caso.abdomen) await escribir('#campo-abdomen', caso.abdomen)
  if (caso.torax) await escribir('#campo-torax', caso.torax)
  for (const region of caso.examenNormal) {
    const id = REGION[region]
    const caja = p.locator(`#campo-${id}`).locator('xpath=ancestor::div[contains(@class,"col-span-2")][1]')
    const chip = caja.getByRole('button', { name: /Sugerencia: examen normal/ })
    if (!(await chip.count())) { nota('medio', 'Examen físico', `No apareció «examen normal» en ${region}.`); continue }
    await tocar(chip, true); await tocar(caja.getByRole('button', { name: 'Usar este texto' }))
  }

  paso('08 Impresión')
  // 08 Impresión
  await ir('Impresión')
  const filas = p.locator('section', { has: p.getByText('¿Cuál es más probable?') }).locator('li')
  const nombres = []
  for (let i = 0; i < await filas.count(); i++) nombres.push((await filas.nth(i).locator('p.font-semibold').first().innerText()).replace(/No te lo pierdas/i, '').trim())
  const puesto = nombres.findIndex((n) => n.startsWith(caso.esperado))
  if (puesto < 0) nota('grave', 'Impresión', `«${caso.esperado}» no aparece en la lista (lista: ${nombres.slice(0, 5).join(', ')}).`)
  else if (puesto > 2) nota('grave', 'Impresión', `«${caso.esperado}» quedó en el puesto ${puesto + 1}, no entre los 3 primeros (${nombres.slice(0, 3).join(', ')}).`)
  if (puesto >= 0) await tocar(filas.nth(puesto).getByRole('button', { name: /Elegir/ }), true)

  paso('09 Plan')
  // 09 Plan
  await ir('Plan')
  await escribir('#campo-manejo', caso.manejo)

  paso('10 Redacción')
  // 10 Redacción
  await ir('Redacción')
  const faltan = await p.getByText(/^Faltan \d+ datos obligatorios/).count()
  if (faltan) nota('medio', 'Redacción', `Quedaron datos obligatorios sin llenar: ${(await p.locator('text=/Faltan \\d+ datos/').locator('xpath=..').innerText()).replace(/\s+/g, ' ').slice(0, 200)}`)
  const texto = await p.locator('#texto-redactado').innerText()
  const revisar = [
    [/ {2,}/, 'dobles espacios'], [/ ,/, 'espacio antes de coma'], [/ \.(?!\d)/, 'espacio antes de punto'], [/\.\.(?!\.)/, 'dos puntos seguidos'],
    [/\bundefined\b|\bnull\b|NaN/, 'texto «undefined/null/NaN»'], [/: \./, 'campo vacío con punto'],
  ]
  for (const [re, que] of revisar) if (re.test(texto)) nota('medio', 'Redacción', `La redacción tiene ${que}: «…${texto.slice(Math.max(0, texto.search(re) - 30), texto.search(re) + 30).replace(/\n/g, ' ')}…».`)
  const numeros = [...texto.matchAll(/^(\d+)\. [A-ZÁÉÍÓÚÑ]/gm)].map((m) => Number(m[1]))
  if (numeros.some((n, i) => n !== i + 1)) nota('medio', 'Redacción', `La numeración de apartados no es seguida: ${numeros.join(', ')}.`)
  const debe = [`${caso.filiacion.edad} años`, caso.motivo.motivo, caso.esperado, `PA ${caso.vitales.pas}/${caso.vitales.pad} mmHg`, ...Object.keys(caso.antecedentes)]
  for (const d of debe) if (!texto.toLowerCase().includes(d.toLowerCase())) nota('grave', 'Redacción', `La redacción no incluye «${d}».`)
  await tocar(p.getByRole('tab', { name: 'Presentación oral' }))
  const oral = await p.locator('#texto-redactado').innerText()
  if (!oral.includes(caso.esperado)) nota('medio', 'Presentación oral', `La presentación oral no menciona «${caso.esperado}».`)
  for (const [re, que] of revisar) if (re.test(oral)) nota('medio', 'Presentación oral', `Tiene ${que}.`)

  await ctx.close()
  const segHampi = cuenta.toques * T.toque + cuenta.letras * T.letra + cuenta.decisiones * T.decision
  const segMano = texto.replace(/\s+/g, ' ').length * T.letraMano + cuenta.decisiones * T.decision
  // Comparación estricta: a mano solo lo que el interno escribió (sin lo que Hampi redacta solo).
  const segManoEstricto = cuenta.letras * T.letraMano + cuenta.decisiones * T.decision
  return {
    caso: caso.id, titulo: caso.titulo, dispositivo: nombreDisp, ...cuenta, letrasRedaccion: texto.replace(/\s+/g, ' ').length,
    minutosHampi: +(segHampi / 60).toFixed(1), minutosMano: +(segMano / 60).toFixed(1), minutosManoEstricto: +(segManoEstricto / 60).toFixed(1),
    puestoEsperado: puesto + 1, segundosRobot: +((Date.now() - inicio) / 1000).toFixed(1), hallazgos,
  }
}

;(async () => {
  const salida = process.argv[2] || 'simulacion.json'
  const navegador = await chromium.launch()
  const resultados = []
  for (const caso of CASOS.filter((c) => !process.env.CASO || c.id === process.env.CASO))
    for (const [nombre, op] of [['iPad', { viewport: { width: 1024, height: 1366 } }], ['Teléfono', { ...devices['iPhone 13'], deviceScaleFactor: 1 }]].filter(([n]) => !process.env.DISP || n === process.env.DISP)) {
      try { resultados.push(await simular(caso, nombre, op, navegador)) }
      catch (e) { const m = String(e.message); const esp = (m.match(/waiting for (.*)/) ?? [])[1] ?? ''; resultados.push({ caso: caso.id, titulo: caso.titulo, dispositivo: nombre, hallazgos: [{ gravedad: 'grave', donde: 'Robot', que: `El robot no pudo terminar: ${m.split('\n')[0].slice(0, 120)} ${esp.replace(/\x1b\[[0-9;]*m/g, '').slice(0, 160)}` }] }) }
      const r = resultados[resultados.length - 1]
      console.log(`${r.caso} · ${r.dispositivo}: ${r.minutosHampi ?? '—'} min en Hampi vs ${r.minutosMano ?? '—'} min a mano · puesto ${r.puestoEsperado ?? '—'} · ${r.hallazgos.length} observaciones`)
    }
  await navegador.close()
  fs.writeFileSync(salida, JSON.stringify({ fecha: new Date().toISOString(), tiempos: T, resultados }, null, 2))
})()

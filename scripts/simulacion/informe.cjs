// Convierte el resultado de scripts/simular.cjs en una página para leer en el iPad.
// Uso: node scripts/simulacion/informe.cjs simulacion.json informe.html
const fs = require('fs')
const [, , entrada, salida, extras] = process.argv
const { fecha, tiempos, resultados } = JSON.parse(fs.readFileSync(entrada, 'utf8'))
const h = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const coma = (n) => (n == null ? '—' : String(n).replace('.', ','))
const ORDEN = { grave: 0, medio: 1, leve: 2 }
const NOMBRE = { grave: 'Grave', medio: 'Medio', leve: 'Leve' }

// Observaciones iguales en varios casos o dispositivos se juntan en una sola.
const juntas = new Map()
for (const r of resultados) for (const o of r.hallazgos) {
  const k = `${o.gravedad}|${o.donde}|${o.que}`
  const x = juntas.get(k) ?? { ...o, en: [] }
  x.en.push(`${r.titulo} · ${r.dispositivo}`)
  juntas.set(k, x)
}
const obs = [...juntas.values()].sort((a, b) => ORDEN[a.gravedad] - ORDEN[b.gravedad] || a.donde.localeCompare(b.donde))
const cuenta = { grave: 0, medio: 0, leve: 0 }
for (const o of obs) cuenta[o.gravedad]++
const REV = extras ? JSON.parse(fs.readFileSync(extras, 'utf8')).revisiones : []
const seccionesRev = REV.map((r) => `
  <section class="hoja" aria-label="${h(r.titulo)}">
    <h2>${h(r.titulo)}</h2>
    <p class="lead" style="margin-top:4px">${h(r.pregunta)}</p>
    <ul style="margin-top:12px">${r.hallazgos.map((x) => `
      <li class="obs ${x.gravedad >= 3 ? 'grave' : x.gravedad === 2 ? 'medio' : 'leve'}">
        <span class="pill">Gravedad ${x.gravedad}</span>
        <div class="cuerpo"><p class="donde">${h(x.regla)}</p><p>${h(x.que)}</p><p class="en">Corregido: ${h(x.arreglo)}</p></div>
      </li>`).join('')}</ul>
    ${r.aguanto ? `<p class="etq" style="margin-top:16px">Lo que aguantó bien</p><ul class="aguanto">${r.aguanto.map((a) => `<li>✓ ${h(a)}</li>`).join('')}</ul>` : ''}
  </section>`).join('')
const ok = resultados.filter((r) => r.minutosHampi != null)
const prom = (k) => (ok.length ? (ok.reduce((s, r) => s + r[k], 0) / ok.length).toFixed(1) : null)
const acierto = ok.filter((r) => r.puestoEsperado >= 1 && r.puestoEsperado <= 3).length

const filas = resultados.map((r) => `
  <tr>
    <td><span class="caso">${h(r.titulo)}</span><span class="disp">${h(r.dispositivo)}</span></td>
    <td class="num">${coma(r.minutosHampi)}</td>
    <td class="num">${coma(r.minutosManoEstricto)}–${coma(r.minutosMano)}</td>
    <td class="num">${r.toques ?? '—'}</td>
    <td class="num">${r.letras ?? '—'}</td>
    <td class="num">${r.puestoEsperado > 0 ? `${r.puestoEsperado}.º` : '<span class="mal">no salió</span>'}</td>
    <td class="num">${r.hallazgos.length}</td>
  </tr>`).join('')

const lista = obs.length ? obs.map((o) => `
  <li class="obs ${o.gravedad}">
    <span class="pill">${NOMBRE[o.gravedad]}</span>
    <div class="cuerpo"><p class="donde">${h(o.donde)}</p><p>${h(o.que)}</p>
    <p class="en">${o.en.length === resultados.length ? 'En todos los recorridos' : `En: ${h(o.en.join(' · '))}`}</p></div>
  </li>`).join('') : '<li class="vacio">El robot no encontró problemas en ningún recorrido.</li>'

fs.writeFileSync(salida, `<title>Interno simulado</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">
<style>
/* Mismo cuaderno clínico que Hampi: papel, tinta y verde eucalipto; el informe es una hoja con margen. */
:root { --bg:#f6f1e7; --hoja:#fffcf5; --tinta:#1c2521; --suave:#48544e; --tenue:#5f6862; --linea:#e0d7c5; --margen:#e3a59c; --marca:#0e6653; --marca-suave:#e0eee6;
  --grave:#b42318; --grave-suave:#fbe9e5; --medio:#8f5200; --medio-suave:#fbefd6; --leve:#48544e; --leve-suave:#efe8da; --ok:#1d7148;
  --serif:"Source Serif 4", Georgia, serif; --sans:"Inter", system-ui, sans-serif; --mono:"JetBrains Mono", ui-monospace, monospace }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#111816; --hoja:#172120; --tinta:#ece6d8; --suave:#b7b2a5; --tenue:#a3a093; --linea:#2b3834; --margen:#7a3b35; --marca:#5cc7a8; --marca-suave:#173a31;
  --grave:#ff8b7c; --grave-suave:#3b1714; --medio:#f1b75c; --medio-suave:#33250c; --leve:#b7b2a5; --leve-suave:#1f2b28; --ok:#74d49e; color-scheme:dark } }
:root[data-theme="dark"] { --bg:#111816; --hoja:#172120; --tinta:#ece6d8; --suave:#b7b2a5; --tenue:#a3a093; --linea:#2b3834; --margen:#7a3b35; --marca:#5cc7a8; --marca-suave:#173a31;
  --grave:#ff8b7c; --grave-suave:#3b1714; --medio:#f1b75c; --medio-suave:#33250c; --leve:#b7b2a5; --leve-suave:#1f2b28; --ok:#74d49e; color-scheme:dark }
body { background:var(--bg); color:var(--tinta); font:16px/1.55 var(--sans); padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); padding-block:32px 56px }
main { max-width:960px; margin:0 auto; display:grid; gap:28px }
h1, h2 { font-family:var(--serif); font-weight:600; text-wrap:balance; margin:0 }
h1 { font-size:clamp(30px, 5vw, 42px); line-height:1.1 }
h2 { font-size:24px }
.etq { font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--tenue); font-weight:600; margin:0 0 6px }
.lead { color:var(--suave); max-width:65ch; margin:8px 0 0 }
.hoja { background:var(--hoja); border:1px solid var(--linea); border-radius:12px; box-shadow:inset 3px 0 0 var(--margen); padding:20px 20px 20px 28px; min-width:0 }
.cifras { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px }
.cifra { display:grid; gap:2px } .cifra b { font-family:var(--serif); font-size:34px; font-weight:600; font-variant-numeric:tabular-nums }
.cifra span { color:var(--suave); font-size:14px }
.tabla { overflow-x:auto } table { border-collapse:collapse; width:100%; min-width:640px; font-size:15px }
th { text-align:left; font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--tenue); font-weight:600; padding:8px; border-bottom:1px solid var(--linea) }
td { padding:10px 8px; border-bottom:1px solid var(--linea); vertical-align:top } .num { text-align:right; font-family:var(--mono); font-variant-numeric:tabular-nums; white-space:nowrap }
th.num { text-align:right } .caso { display:block; font-weight:500 } .disp { color:var(--tenue); font-size:13px } .mal { color:var(--grave); font-family:var(--sans) }
ul { list-style:none; margin:0; padding:0; display:grid; gap:10px }
.obs { display:grid; grid-template-columns:auto 1fr; gap:12px; align-items:start; padding:12px 0; border-bottom:1px solid var(--linea) } .obs:last-child { border:0 }
.pill { font-size:12px; font-weight:600; border-radius:999px; padding:3px 10px; white-space:nowrap }
.grave .pill { background:var(--grave-suave); color:var(--grave) } .medio .pill { background:var(--medio-suave); color:var(--medio) } .leve .pill { background:var(--leve-suave); color:var(--leve) }
.cuerpo { min-width:0 } .cuerpo p { margin:0 } .donde { font-weight:600 } .en { color:var(--tenue); font-size:13px; margin-top:4px !important }
.vacio { color:var(--ok); font-weight:500 }
.aguanto li { color:var(--ok) }
.nota { color:var(--suave); font-size:14px; max-width:70ch } .nota li { list-style:disc; margin-left:18px }
</style>
<main>
  <header>
    <p class="etq">Hampi · prueba automática · ${h(new Date(fecha).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' }))}</p>
    <h1>Interno simulado</h1>
    <p class="lead">Tres revisiones: un robot que llena historias como un interno, una evaluación de usabilidad y una prueba de estrés. Todo lo que encontraron ya está corregido. Un robot llenó ${new Set(resultados.map((r) => r.caso)).size} historias ficticias completas, en iPad y en teléfono, como lo haría un interno, y anotó todo lo que encontró mal. El tiempo es una estimación: no reemplaza la prueba con internos reales.</p>
  </header>

  <section class="hoja cifras" aria-label="Resumen">
    <div class="cifra"><b>${coma(prom('minutosHampi'))} min</b><span>tiempo estimado en Hampi (promedio)</span></div>
    <div class="cifra"><b>${coma(prom('minutosManoEstricto'))}–${coma(prom('minutosMano'))} min</b><span>a mano: solo lo que escribiste — toda la historia final (estimado)</span></div>
    <div class="cifra"><b>${acierto} de ${ok.length}</b><span>recorridos con el diagnóstico esperado entre los 3 primeros</span></div>
    <div class="cifra"><b>${cuenta.grave} · ${cuenta.medio} · ${cuenta.leve}</b><span>observaciones graves · medias · leves</span></div>
  </section>

  <section class="hoja" aria-labelledby="t-obs">
    <h2 id="t-obs">Lo que está mal, de lo más grave a lo más leve</h2>
    <ul style="margin-top:12px">${lista}</ul>
  </section>

  <section class="hoja" aria-labelledby="t-rec">
    <h2 id="t-rec">Cada recorrido</h2>
    <div class="tabla" style="margin-top:12px"><table>
      <thead><tr><th>Caso</th><th class="num">Min Hampi</th><th class="num">Min a mano</th><th class="num">Toques</th><th class="num">Letras</th><th class="num">Diagnóstico</th><th class="num">Obs.</th></tr></thead>
      <tbody>${filas}</tbody>
    </table></div>
  </section>

  ${seccionesRev}

  <section class="nota" aria-label="Cómo se estimó">
    <p class="etq">Cómo se estimó el tiempo</p>
    <ul>
      <li>Cada toque cuenta ${coma(tiempos.toque)} s y cada decisión ${coma(tiempos.decision)} s (modelo de tiempos de interfaz KLM de Card, Moran y Newell).</li>
      <li>Cada letra en el teclado del iPad cuenta ${coma(tiempos.letra)} s, y a mano ${coma(tiempos.letraMano)} s (unas 15 palabras por minuto). Son supuestos razonables, no medidos en Cuenca.</li>
      <li>«A mano» va de un mínimo a un máximo: el mínimo es escribir a mano solo lo que el interno escribió en Hampi; el máximo, escribir todo el texto final que Hampi redacta (negativos pertinentes, examen normal, etc.). Las mismas decisiones en ambos. No cuenta el tiempo de hablar con el paciente.</li>
      <li>Casos ficticios; los diagnósticos son sugerencias de apoyo y la decisión es del médico.</li>
    </ul>
  </section>
</main>
`)
console.log('informe:', salida)

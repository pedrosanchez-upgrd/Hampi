// Arma una sola página (CSS y JS incluidos) para publicar la versión de prueba como Artifact.
// Uso: npm run build && node scripts/artifact.mjs <salida.html>
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
const dir = 'dist/assets'
const archivos = readdirSync(dir)
const css = readFileSync(`${dir}/${archivos.find((f) => f.endsWith('.css'))}`, 'utf8')
const js = readFileSync(`${dir}/${archivos.find((f) => f.endsWith('.js'))}`, 'utf8').replace(/<\/script/gi, '<\\/script')
const html = `<title>Hampi</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`
writeFileSync(process.argv[2] ?? 'dist/artifact.html', html)
console.log('listo', (html.length / 1024).toFixed(0), 'KB')

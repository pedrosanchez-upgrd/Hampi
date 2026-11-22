// Arma una sola página (CSS y JS incluidos) para publicar la versión de prueba como Artifact.
// Uso: npm run build && node scripts/artifact.mjs <salida.html>
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
const dir = 'dist/assets'
const archivos = readdirSync(dir)
const css = readFileSync(`${dir}/${archivos.find((f) => f.endsWith('.css'))}`, 'utf8')
const js = readFileSync(`${dir}/${archivos.find((f) => f.endsWith('.js'))}`, 'utf8').replace(/<\/script/gi, '<\\/script')
const html = `<title>Hampi</title>
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`
writeFileSync(process.argv[2] ?? 'dist/artifact.html', html)
console.log('listo', (html.length / 1024).toFixed(0), 'KB')

// Revisión automática de accesibilidad (WCAG 2 A/AA) con axe-core en modo claro y oscuro.
// Uso: npm run build && npx vite preview --port 4173 (en otra terminal) && node scripts/accesibilidad.cjs
const { chromium } = require('playwright');
const axeSrc = require('fs').readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
(async () => {
  const b = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: scheme });
    await p.goto('http://localhost:4173'); await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    const run = async (nombre) => {
      await p.addScriptTag({ content: axeSrc });
      const r = await p.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations.map(v => ({ id: v.id, n: v.nodes.length, ej: v.nodes.slice(0, 3).map(x => x.target.join(' ') + ' :: ' + (x.failureSummary || '').split('\n').slice(1, 2).join('')) })));
      console.log(scheme, nombre, JSON.stringify(r, null, 1));
    };
    await run('terminos');
    await p.check('#acepto-terminos'); await p.getByRole('button', { name: /Aceptar/ }).click();
    await run('cuenta');
    await p.getByRole('button', { name: 'Seguir sin cuenta' }).click();
    await p.getByRole('button', { name: 'Cargar caso de ejemplo' }).click();
    await run('filiacion');
    await p.getByRole('button', { name: /Enfermedad actual/ }).first().click(); await run('enfermedad');
    await p.getByRole('button', { name: /Antecedentes personales/ }).first().click(); await run('personales');
    await p.getByRole('button', { name: /Examen físico/ }).first().click(); await run('examen');
    await p.getByRole('button', { name: /Redacción final/ }).first().click(); await run('redaccion');
  }
  await b.close();
})();

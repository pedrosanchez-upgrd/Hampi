# Listas de calidad de revistas (para la tabla `revistas`)

## Publindex (Colombia) — `publindex-salud.csv`
- Fuente: datos.gov.co, «Revistas Indexadas, Índice Nacional Publindex» (conjunto `mwmn-inyg`), licencia CC BY-SA 4.0 (atribución: Minciencias, Colombia). Descargado el 26-nov-2026.
- Solo gran área «Ciencias Médicas y de la Salud»; una fila por revista con su clasificación más reciente.
- Hallazgo: 94 revistas; solo 3 en A2 y su clasificación es de 2016 (vencida). La convocatoria más reciente del conjunto es 2022 y en ella ninguna revista de salud es A1 ni A2. Por eso, por ahora, Publindex no aporta revistas al filtro: al cargar, usar solo la última convocatoria.

## Scimago (cuartiles Q1/Q2) — pendiente
- scimagojr.com bloquea la descarga automática (protección contra robots). Descargar desde el navegador: Journal Rankings → Subject Area: Medicine → Only journals → «Download data». Pasar el archivo a `scripts/revistas.mjs --scimago`.

## Latindex (catálogo) — pendiente
- Exportar desde latindex.org (Catálogo 2.0) las revistas de ciencias médicas y pasarlas con `--latindex`.

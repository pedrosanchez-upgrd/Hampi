// Cargador de calidad de revistas. Los CSV de aquí imitan los encabezados esperados;
// la primera carga real debe revisarse con los archivos descargados de cada sitio.
import { describe, it, expect } from 'vitest'
// @ts-expect-error módulo JavaScript sin tipos
import { leerCsv, unir, sql } from '../../scripts/revistas.mjs'

describe('revistas', () => {
  it('une Scimago, Latindex y Publindex por ISSN', () => {
    const scimago = leerCsv('Rank;Sourceid;Title;Type;Issn;SJR;SJR Best Quartile\n1;1;"Revista A; con punto y coma";journal;"15424863, 00079235";1,2;Q1\n2;2;Revista B;journal;03406245;0,9;Q3\n')
    const latindex = leerCsv('Título,ISSN impreso,ISSN electrónico\nRevista C,0016-3503,\nRevista B,0340-6245,\n')
    const publindex = leerCsv('Revista,ISSN,Categoría\nRevista D,0120-0011,A1\n')
    const r = unir({ scimago, latindex, publindex }, 2025)
    const por = Object.fromEntries(r.map((x: { issn: string }) => [x.issn, x]))
    expect(por['1542-4863']).toMatchObject({ nombre: 'Revista A; con punto y coma', scimago_cuartil: 'Q1', scimago_anio: 2025 })
    expect(por['0007-9235'].scimago_cuartil).toBe('Q1')
    expect(por['0340-6245']).toMatchObject({ scimago_cuartil: 'Q3', latindex_catalogo: true })
    expect(por['0016-3503']).toMatchObject({ latindex_catalogo: true, scimago_cuartil: null })
    expect(por['0120-0011'].publindex).toBe('A1')
  })
  it('el SQL escapa comillas y no borra nada', () => {
    const s = sql([{ issn: '0000-0000', nombre: "O'Hara", scimago_cuartil: null, scimago_anio: null, latindex_catalogo: true, publindex: null }])
    expect(s).toContain("'O''Hara'")
    expect(s).not.toMatch(/delete|drop|truncate/i)
  })
})

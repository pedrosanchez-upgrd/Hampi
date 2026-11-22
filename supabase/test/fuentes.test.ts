// Lectura de respuestas reales de PubMed, SciELO y Elsevier, y filtro de calidad.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { calidad, CONSULTAS, leerElsevier, leerPubmed, leerScielo, normalizarIssn, type Revista } from '../functions/_shared/evidencia'
import { DIAGNOSTICOS } from '../../src/data/conocimiento'

const ej = (f: string) => readFileSync(`supabase/functions/_shared/ejemplos/${f}`, 'utf8')

describe('fuentes', () => {
  it('PubMed: título, revista, ISSN, año, autores y resumen sin entidades', () => {
    const [a] = leerPubmed(ej('pubmed-10744147.xml'))
    expect(a).toMatchObject({ base: 'pubmed', identificador: '10744147', revista: 'Thrombosis and haemostasis', issn: ['0340-6245'], anio: 2000, url: 'https://pubmed.ncbi.nlm.nih.gov/10744147/' })
    expect(a.titulo).toContain('pulmonary embolism')
    expect(a.autores).toBe('Wells PS, Anderson DR, Rodger M')
    expect(a.resumen).toContain('heart rate >100 (1.5)')
  })
  it('SciELO: el código del artículo da el ISSN y el año; título y resumen en español', () => {
    const [a, b] = leerScielo(ej('scielo-dolor-toracico.rss'))
    expect(a).toMatchObject({ base: 'scielo', identificador: 'S0016-35032026000200076', issn: ['0016-3503'], anio: 2026, idioma: 'spa' })
    expect(a.titulo).toBe('Esófago Hipercontractil en pacientes adultos con Enfermedad por Reflujo Gastroesofágico')
    expect(a.resumen).toMatch(/^Objetivo:/)
    expect(a.resumen).not.toContain('Abstract')
    expect(b.issn).toEqual(['2011-7582'])
  })
  it('Elsevier: ISSN normalizado, DOI y enlace; sin resumen si no viene', () => {
    const [a, b] = leerElsevier(JSON.parse(ej('elsevier-scopus-ejemplo-oficial.json')))
    expect(a).toMatchObject({ base: 'elsevier', identificador: '84884919538', issn: ['0740-0020', '1095-9998'], anio: 2014, url: 'https://doi.org/10.1016/j.fm.2013.08.011' })
    expect(b.resumen).toBeUndefined()
  })
  it('ISSN', () => {
    expect(normalizarIssn('0102311x')).toBe('0102-311X')
    expect(normalizarIssn('123')).toBeNull()
  })
  it('calidad: la mejor entre sus ISSN; Q3 o sin datos no pasa', () => {
    const m = new Map<string, Revista>([
      ['0740-0020', { issn: '0740-0020', scimago_cuartil: 'Q3' }],
      ['1095-9998', { issn: '1095-9998', scimago_cuartil: 'Q2' }],
      ['0016-3503', { issn: '0016-3503', latindex_catalogo: true }],
      ['2011-7582', { issn: '2011-7582', publindex: 'B', latindex_catalogo: true }],
      ['0120-0011', { issn: '0120-0011', publindex: 'A1', scimago_cuartil: 'Q3' }],
    ])
    expect(calidad(['0740-0020', '1095-9998'], m)).toBe('Q2')
    expect(calidad(['0740-0020'], m)).toBeNull()
    expect(calidad(['0016-3503'], m)).toBe('Latindex')
    expect(calidad(['0120-0011'], m)).toBe('A1')
    expect(calidad(['9999-9999'], m)).toBeNull()
  })
  it('hay una consulta para cada diagnóstico del motor', () => {
    for (const d of DIAGNOSTICOS.filter((x) => x.id !== 'sangradoAltoGrave')) expect(CONSULTAS[d.id], d.id).toBeDefined()
  })
})

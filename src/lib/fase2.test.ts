import { describe, it, expect } from 'vitest'
import { avisos, historiaVacia, paquetesAnio, progresoSeccion, redactar } from './historia'
import { diagnosticosEnVivo, estadoHallazgos } from './motor'

describe('antecedentes conectados', () => {
  it('insuficiencia cardiaca previa alimenta el hallazgo del motor', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'falta de aire' }
    h.antecedentes = { 'p.ic': 'si' }
    expect(estadoHallazgos(h).iccPrevia).toBe('si')
    expect(diagnosticosEnVivo(h)[0].id).toBe('icc')
  })
  it('«No» en todos los antecedentes de un hallazgo lo marca ausente', () => {
    const h = historiaVacia()
    h.antecedentes = { 'p.cardiopatiaIsq': 'no' }
    expect(estadoHallazgos(h).cardiopatia).toBeUndefined() // falta valvulopatía
    h.antecedentes['p.valvulopatia'] = 'no'
    expect(estadoHallazgos(h).cardiopatia).toBe('no')
  })
  it('lo marcado a mano en la pestaña manda sobre el antecedente', () => {
    const h = historiaVacia()
    h.antecedentes = { 'p.fa': 'si' }
    h.hallazgos = { fibrilacion: 'no' }
    expect(estadoHallazgos(h).fibrilacion).toBe('no')
  })
})

describe('redacción de antecedentes y negativos pertinentes', () => {
  it('escribe patológicos, negativos, familiares y paquetes/año', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor en el pecho' }
    h.antecedentes = { 'p.hta': 'si', 'p.hta.det': 'desde 2015, enalapril', 'p.dm': 'no', 'f.dm': 'Padre,Madre', 'e.viaje': 'si', 'e.viaje.det': 'Esmeraldas, hace 1 semana' }
    h.personales = { tabacoCig: '20', tabacoAnios: '10' }
    h.sintomas = { 'toracico.a2': '0', 'toracico.a4': '0' }
    const t = redactar(h)
    expect(t).toContain('Patológicos: Hipertensión arterial (desde 2015, enalapril).')
    expect(t).toContain('Niega: diabetes.')
    expect(t).toContain('Diabetes: padre, madre.')
    expect(t).toContain('Epidemiológicos: Viaje o residencia reciente en la Costa o la Amazonía (Esmeraldas, hace 1 semana).')
    expect(t).toContain('Índice tabáquico: 10 paquetes/año')
    expect(t).toContain('Dolor torácico, niega: síncope; disnea súbita.')
    expect(paquetesAnio(h)).toBe(10)
  })
  it('los campos gineco-obstétricos no salen en hombres', () => {
    const h = historiaVacia()
    h.filiacion = { sexo: 'Hombre' }
    h.personales = { fum: '2026-11-01' }
    expect(redactar(h)).not.toContain('FUM')
    h.filiacion = { sexo: 'Mujer' }
    expect(redactar(h)).toContain('FUM: 2026-11-01')
  })
})

describe('avisos de datos importantes', () => {
  it('pide FUM en mujer en edad fértil y alarmas sin registrar', () => {
    const h = historiaVacia()
    h.filiacion = { sexo: 'Mujer', edad: '28' }
    h.motivo = { motivo: 'dolor abdominal' }
    const a = avisos(h).map((x) => x.texto)
    expect(a.some((x) => x.includes('FUM'))).toBe(true)
    expect(a.some((x) => x.startsWith('Dolor abdominal: falta registrar 5 signos'))).toBe(true)
    h.personales = { fum: '2026-11-01' }
    expect(avisos(h).some((x) => x.texto.includes('FUM'))).toBe(false)
  })
  it('fiebre pide viajes; tos pide contacto con TB', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'fiebre y tos' }
    const a = avisos(h).map((x) => x.texto).join(' | ')
    expect(a).toContain('viajes a la Costa')
    expect(a).toContain('tuberculosis')
  })
  it('el progreso de antecedentes cuenta las enfermedades previas', () => {
    const h = historiaVacia()
    const antes = progresoSeccion(h, 'personales').llenos
    h.antecedentes = { 'p.hta': 'no' }
    expect(progresoSeccion(h, 'personales').llenos).toBe(antes + 1)
  })
})

import { casoEjemplo } from '../data/casoEjemplo'
import { faltantes } from './historia'

describe('caso de ejemplo', () => {
  it('pone el síndrome coronario arriba y deja solo pendientes de impresión y plan', () => {
    const h = casoEjemplo()
    expect(diagnosticosEnVivo(h)[0].id).toBe('sca')
    expect(faltantes(h).map((f) => f.seccionId).sort()).toEqual(['impresion', 'plan'])
    expect(redactar(h)).toContain('Dolor torácico: Dolor de más de 20 min en reposo')
  })
})

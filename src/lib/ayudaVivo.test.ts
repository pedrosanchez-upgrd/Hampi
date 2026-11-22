import { describe, it, expect } from 'vitest'
import { preguntasClave } from './motor'
import { historiaVacia } from './historia'
import { abreviaturasEn, escribirCompleto } from '../data/abreviaturas'
import { sugerenciasPara } from '../data/redaccionAyuda'

describe('pregunte esto ahora', () => {
  it('sin síntomas no propone nada', () => {
    expect(preguntasClave(historiaVacia())).toEqual([])
  })
  it('con dolor torácico propone hasta 3 preguntas sin responder', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor en el pecho' }
    const p = preguntasClave(h)
    expect(p.length).toBe(3)
    expect(p.every((x) => x.diagnosticos.length > 0)).toBe(true)
  })
  it('lo ya respondido deja de aparecer', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor en el pecho' }
    const primera = preguntasClave(h)[0].hallazgo
    h.hallazgos = { [primera]: 'no' }
    expect(preguntasClave(h).map((x) => x.hallazgo)).not.toContain(primera)
  })
  it('no propone hallazgos automáticos ni de diagnósticos descartados', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor en el pecho' }
    expect(preguntasClave(h, 50).map((x) => x.hallazgo)).not.toContain('taquicardia')
    const todos = preguntasClave(h, 50, 50).length
    h.diagnosticosVivo = { descartados: 'sca,diseccion,tep,pericarditis,icc,neumonia' }
    expect(preguntasClave(h, 50, 50).length).toBeLessThan(todos)
  })
})

describe('abreviaturas', () => {
  it('detecta solo en mayúsculas y palabras completas', () => {
    expect(abreviaturasEn('Paciente con HTA y DM2, fa').map((x) => x.abrev)).toEqual(['HTA', 'DM2'])
    expect(abreviaturasEn('hipertensión')).toEqual([])
  })
  it('no toma números romanos ni siglas ambiguas', () => {
    expect(abreviaturasEn('Soplo grado IV/VI, IM leve')).toEqual([])
  })
  it('escribe completo sin tocar el resto', () => {
    expect(escribirCompleto('Antecedente de HTA hace 5 años, toma losartán VO.')).toBe('Antecedente de hipertensión arterial hace 5 años, toma losartán vía oral.')
  })
})

describe('sugerencias nuevas', () => {
  it('revisión por sistemas: tras «Niega» ofrece escribir qué niega', () => {
    const h = historiaVacia()
    expect(sugerenciasPara('sistemas', 'cardio', h)).toEqual([])
    h.sistemas = { cardio: 'Niega' }
    expect(sugerenciasPara('sistemas', 'cardio', h)[0].texto).toContain('Niega dolor torácico')
  })
  it('exámenes: solo de los diagnósticos elegidos que tienen estudios en la fuente', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor abdominal' }
    expect(sugerenciasPara('plan', 'examenes', h).some((x) => x.texto.includes('Ecografía'))).toBe(false)
    h.impresion = { diagnosticos: 'Colecistitis aguda (presuntivo)' }
    expect(sugerenciasPara('plan', 'examenes', h)[0].texto).toBe('Colecistitis aguda: Ecografía de hipocondrio derecho.')
  })
})

describe('pregunte esto ahora: variedad', () => {
  it('en el caso de ejemplo, cada pregunta es de un diagnóstico distinto', async () => {
    const { casoEjemplo } = await import('../data/casoEjemplo')
    const p = preguntasClave(casoEjemplo())
    expect(new Set(p.map((x) => x.diagnosticos[0])).size).toBe(p.length)
    expect(p[0].diagnosticos[0]).toBe('Tromboembolismo pulmonar')
  })
})

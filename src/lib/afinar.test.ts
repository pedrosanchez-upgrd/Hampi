import { describe, it, expect } from 'vitest'
import { preguntasParaAfinar, diagnosticosEnVivo } from './motor'
import { historiaVacia } from './historia'
import { nombresElegidos } from '../components/PanelDiagnosticos'

describe('afinar y elegir', () => {
  it('propone los hallazgos sin responder con su efecto', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor en el pecho' }
    h.hallazgos = { irradiaBrazos: 'si' }
    const p = preguntasParaAfinar(h, 'sca').map((x) => x.hallazgo)
    expect(p).toEqual(['dolorEsfuerzo', 'dolorPleuritico'])
    expect(preguntasParaAfinar(h, 'diseccion').find((x) => x.hallazgo === 'inicioSubito')!.efecto).toBe('si falta: LR 0,3')
  })
  it('no propone hallazgos automáticos (vienen de los signos vitales)', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor en el pecho' }
    expect(preguntasParaAfinar(h, 'tep').map((x) => x.hallazgo)).not.toContain('taquicardia')
  })
  it('los estudios del artículo llegan al resultado', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor abdominal' }
    expect(diagnosticosEnVivo(h).find((x) => x.id === 'colecistitis')!.estudios).toContain('Ecografía')
  })
  it('elegido compara el nombre completo de cada línea', () => {
    const h = historiaVacia()
    h.impresion = { diagnosticos: 'Embarazo ectópico (presuntivo)\nGota' }
    const n = nombresElegidos(h)
    expect(n.has('embarazo')).toBe(false)
    expect(n.has('embarazo ectópico')).toBe(true)
    expect(n.has('gota')).toBe(true)
  })
})

import { describe, it, expect } from 'vitest'
import { terminosPara, usarTermino } from './terminos'

const T = ['Opresivo', 'Punzante', 'Urente', 'Cólico']
describe('opciones mientras se escribe', () => {
  it('sin texto ofrece los primeros términos', () => {
    expect(terminosPara('', T, 2)).toEqual([{ termino: 'Opresivo', completa: false }, { termino: 'Punzante', completa: false }])
  })
  it('lo que se va escribiendo filtra y completa (sin tildes)', () => {
    expect(terminosPara('opr', T)).toEqual([{ termino: 'Opresivo', completa: true }])
    expect(usarTermino('opr', 'Opresivo', true)).toBe('Opresivo')
    expect(terminosPara('Opresivo, col', T)).toEqual([{ termino: 'Cólico', completa: true }])
    expect(usarTermino('Opresivo, col', 'Cólico', true)).toBe('Opresivo, cólico')
  })
  it('no ofrece lo ya escrito y agrega al final con coma', () => {
    expect(terminosPara('Opresivo', T).map((x) => x.termino)).not.toContain('Opresivo')
    expect(usarTermino('Opresivo', 'Punzante', false)).toBe('Opresivo, punzante')
    expect(usarTermino('Opresivo, ', 'Punzante', false)).toBe('Opresivo, punzante')
  })
  it('si lo escrito no coincide con nada, ofrece todos', () => {
    expect(terminosPara('xyz', T).every((x) => !x.completa)).toBe(true)
  })
})

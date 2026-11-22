import { describe, it, expect } from 'vitest'
import { agregarDictado, puntuarDictado } from './dictado'

describe('dictado', () => {
  it('convierte la puntuación dicha', () => {
    expect(puntuarDictado('dolor opresivo coma irradiado al brazo izquierdo punto y seguido niega disnea'))
      .toBe('Dolor opresivo, irradiado al brazo izquierdo. Niega disnea')
    expect(puntuarDictado('examen físico dos puntos abdomen blando punto y aparte corazón rítmico'))
      .toBe('Examen físico: abdomen blando.\nCorazón rítmico')
  })
  it('no cambia «punto» suelto (punto de McBurney)', () => {
    expect(puntuarDictado('dolor en el punto de McBurney')).toBe('Dolor en el punto de McBurney')
  })
  it('«coma» médico no se cambia por una coma', () => {
    expect(puntuarDictado('paciente en coma')).toBe('Paciente en coma')
    expect(puntuarDictado('antecedente de coma diabético coma sin secuelas')).toBe('Antecedente de coma diabético, sin secuelas')
    expect(puntuarDictado('estado de coma')).toBe('Estado de coma')
  })
  it('no toca los decimales', () => {
    expect(puntuarDictado('losartán 1,5 mg coma vía oral')).toBe('Losartán 1,5 mg, vía oral')
  })
  it('agrega al texto que ya había', () => {
    expect(agregarDictado('', 'niega fiebre')).toBe('Niega fiebre')
    expect(agregarDictado('Dolor torácico.', 'niega fiebre')).toBe('Dolor torácico. Niega fiebre')
    expect(agregarDictado('Dolor torácico', 'irradiado al brazo')).toBe('Dolor torácico irradiado al brazo')
  })
})

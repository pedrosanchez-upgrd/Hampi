import { describe, it, expect } from 'vitest'
import { relatoSugerido, sugerenciasPara, EXAMEN_NORMAL } from './redaccionAyuda'
import { casoEjemplo } from './casoEjemplo'
import { historiaVacia } from '../lib/historia'

describe('sugerencias de redacción', () => {
  it('arma el relato con ALICIA y los negativos pertinentes', () => {
    const t = relatoSugerido(casoEjemplo())!
    expect(t.startsWith('Paciente masculino de 58 años que acude por cuadro de 2 horas de evolución caracterizado por dolor torácico')).toBe(true)
    expect(t).toContain('de tipo opresivo')
    expect(t).toContain('irradiado a brazo izquierdo y mandíbula')
    expect(t).toContain('Niega dolor desgarrante hacia la espalda')
    expect(t).not.toContain('..')
  })
  it('sin motivo ni síntoma no inventa un relato', () => {
    expect(relatoSugerido(historiaVacia())).toBeNull()
  })
  it('ofrece examen normal, síndromes, crónicos y educación', () => {
    const h = casoEjemplo()
    expect(sugerenciasPara('examen', 'corazon', h)[0].texto).toBe(EXAMEN_NORMAL.corazon)
    expect(sugerenciasPara('impresion', 'sindromes', h).map((x) => x.texto)).toContain('Síndrome doloroso torácico')
    expect(sugerenciasPara('impresion', 'cronicos', h)[0].texto).toBe('Hipertensión arterial\nDiabetes\nDislipidemia')
    expect(sugerenciasPara('plan', 'educacion', h)[0].texto).toContain('síncope')
    expect(sugerenciasPara('filiacion', 'nombre', h)).toEqual([])
  })
})

import { detectarSintomas } from './sintomas'
import { sintomasAbiertos } from '../lib/historia'

describe('regresión: lo negado no abre pestañas', () => {
  it('«niega síncope; disnea súbita» no abre Síncope ni Disnea', () => {
    expect(detectarSintomas('Dolor en el pecho. Niega síncope; disnea súbita.')).toEqual(['toracico'])
    expect(detectarSintomas('Fiebre alta, sin diarrea ni vómito.')).toEqual(['fiebre'])
    expect(detectarSintomas('No refiere tos. Dolor de cabeza intenso.')).toEqual(['cefalea'])
  })
  it('usar el relato sugerido no abre pestañas nuevas', () => {
    const h = casoEjemplo()
    const antes = sintomasAbiertos(h)
    h.enfermedad = { ...h.enfermedad, relato: relatoSugerido(h)! }
    expect(sintomasAbiertos(h)).toEqual(antes)
  })
})

describe('pestañas y negación (revisión 23-nov)', () => {
  it('lo dicho después de una frase negada sí abre su pestaña', () => {
    expect(detectarSintomas('Dolor torácico sin irradiación, con disnea')).toContain('disnea')
    expect(detectarSintomas('Niega fiebre, disnea ni síncope')).not.toContain('disnea')
  })
})

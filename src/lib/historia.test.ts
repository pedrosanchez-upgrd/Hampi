import { describe, it, expect } from 'vitest'
import { cedulaValida, imc, avisoSigno, faltantes, historiaVacia, redactar } from './historia'

describe('cédula ecuatoriana', () => {
  it('acepta una cédula con dígito verificador correcto', () => {
    expect(cedulaValida('0102030405')).toBe(false) // verificador incorrecto
    expect(cedulaValida('0102030400')).toBe(true)
    expect(cedulaValida('1710034065')).toBe(true)
  })
  it('rechaza formatos inválidos', () => {
    expect(cedulaValida('123')).toBe(false)
    expect(cedulaValida('9902030400')).toBe(false) // provincia 99
    expect(cedulaValida('0192030400')).toBe(false) // tercer dígito 9
  })
})

describe('signos vitales', () => {
  it('calcula el IMC', () => expect(imc(70, 170)).toBe(24.2))
  it('avisa fuera de rango', () => {
    expect(avisoSigno('pas', '85')).toBe('Presión sistólica baja')
    expect(avisoSigno('temp', '38,5')).toBe('Temperatura alta')
    expect(avisoSigno('fc', '80')).toBeNull()
    expect(avisoSigno('fc', '')).toBeNull()
  })
})

describe('historia', () => {
  it('lista los obligatorios faltantes', () => {
    const f = faltantes(historiaVacia())
    expect(f.some((x) => x.campo === 'Edad')).toBe(true)
    expect(f.some((x) => x.seccionId === 'personales')).toBe(true)
  })
  it('redacta con resumen y alarmas al inicio', () => {
    const h = historiaVacia()
    h.filiacion = { edad: '58', sexo: 'Hombre' }
    h.motivo = { motivo: 'dolor en el pecho', tiempo: '2 horas' }
    h.examen = { pas: '85', fc: '110', peso: '70', talla: '170' }
    const t = redactar(h)
    expect(t.startsWith('RESUMEN\nHombre de 58 años, consulta por «dolor en el pecho», de 2 horas de evolución.')).toBe(true)
    expect(t.indexOf('SIGNOS DE ALARMA')).toBeLessThan(t.indexOf('1. DATOS'))
    expect(t).toContain('Presión sistólica baja (85 mmHg)')
    expect(t).toContain('IMC: 24.2 kg/m²')
  })
})

import { detectarSintomas } from '../data/sintomas'
import { sintomasAbiertos, cerrarSintoma, abrirSintoma } from './historia'

describe('pestañas de síntoma', () => {
  it('detecta síntomas sin importar tildes ni mayúsculas', () => {
    expect(detectarSintomas('Dolor en el PECHO y falta de aire')).toEqual(['toracico', 'disnea'])
    expect(detectarSintomas('cefalea intensa con vómito')).toEqual(expect.arrayContaining(['cefalea', 'vomito']))
    expect(detectarSintomas('tose mucho')).toEqual([]) // «tos» solo como palabra completa
    expect(detectarSintomas('tiene tos con flema')).toEqual(['tos'])
  })
  it('abre, cierra y lleva las alarmas a la redacción', () => {
    let h = historiaVacia()
    h.motivo = { motivo: 'me duele el pecho', tiempo: '1 hora' }
    expect(sintomasAbiertos(h)).toEqual(['toracico'])
    h = { ...h, sintomas: { ...h.sintomas, 'toracico.a2': '1', 'toracico.notas': 'Opresivo, irradia a brazo izquierdo' } }
    const t = redactar(h)
    expect(t).toContain('- Dolor torácico: Síncope')
    expect(t).toContain('Dolor torácico: Opresivo, irradia a brazo izquierdo')
    h = cerrarSintoma(h, 'toracico')
    expect(sintomasAbiertos(h)).toEqual([])
    h = abrirSintoma(h, 'fiebre')
    expect(sintomasAbiertos(h)).toEqual(['fiebre'])
  })
})

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
    expect(t).toContain('IMC 24,2 kg/m²')
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

import { textoParaIA } from './historia'

describe('privacidad', () => {
  it('el texto para la IA no lleva nombre, cédula, HCU ni contacto', () => {
    const h = historiaVacia()
    h.filiacion = { nombre: 'Juana Pérez', cedula: '0102030400', hcu: '12345', acompanante: 'Hija 0991234567', edad: '60', sexo: 'Mujer' }
    const t = textoParaIA(h)
    for (const x of ['Juana', '0102030400', '12345', '0991234567']) expect(t).not.toContain(x)
    expect(t).toContain('Mujer de 60 años')
  })
})

import { enLista } from './historia'
import { casoEjemplo } from '../data/casoEjemplo'
import { relatoSugerido } from '../data/redaccionAyuda'
describe('formato de los textos (revisión 25-nov)', () => {
  it('listas con «y» antes del último', () => {
    expect(enLista(['a'])).toBe('a')
    expect(enLista(['a', 'b', 'c'])).toBe('a, b y c')
  })
  it('redacción: 8/10 sin espacio, numeración seguida, negativos con «y»', () => {
    const t = redactar(casoEjemplo())
    expect(t).toContain('Intensidad: 8/10')
    expect(t).toContain('Dolor torácico: niega dolor desgarrante hacia la espalda, síncope, hipotensión y disnea súbita.')
    const numeros = [...t.matchAll(/^(\d+)\. [A-ZÁÉÍÓÚÑ]/gm)].map((m) => Number(m[1]))
    expect(numeros).toEqual(numeros.map((_, i) => i + 1))
    expect(t).not.toMatch(/ {2}| ,| \.(?!\d)|\.\.(?!\.)/)
  })
  it('relato sugerido: «de localización», sin dobles espacios', () => {
    const r = relatoSugerido(casoEjemplo())!
    expect(r).toContain('de localización retroesternal')
    expect(r).toMatch(/síncope, hipotensión y disnea súbita\.$/)
    expect(r).not.toMatch(/ {2}| ,/)
  })
})

describe('examen físico en la redacción', () => {
  it('signos vitales en una sola línea, con IMC', () => {
    const t = redactar(casoEjemplo())
    expect(t).toContain('Signos vitales: PA 150/95 mmHg, FC 98 lpm, FR 20 rpm, T 36,6 °C, SatO₂ 93 % al aire ambiente, peso 84 kg, talla 168 cm, IMC 29,8 kg/m².')
    expect(t).not.toContain('Presión sistólica:')
  })
})

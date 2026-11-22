import { describe, it, expect } from 'vitest'
import { detectarEnTexto, hallazgosEnLoEscrito, PATRONES } from './detectarHallazgos'
import { HALLAZGOS } from './conocimiento'
import { EXAMEN_NORMAL } from './redaccionAyuda'
import { historiaVacia } from '../lib/historia'
import { diagnosticosEnVivo } from '../lib/motor'

const est = (t: string) => Object.fromEntries(detectarEnTexto(t).map((d) => [d.hallazgo, d.estado]))

describe('leer lo escrito', () => {
  it('todos los patrones apuntan a hallazgos que existen', () => {
    for (const id of Object.keys(PATRONES)) expect(HALLAZGOS.some((x) => x.id === id), id).toBe(true)
  })
  it('detecta presentes en el relato', () => {
    const e = est('Dolor opresivo de inicio súbito, irradiado al brazo izquierdo, que aparece al subir gradas.')
    expect(est('Dolor opresivo mientras subía gradas')).toMatchObject({ dolorEsfuerzo: 'si' })
    expect(e).toMatchObject({ inicioSubito: 'si', irradiaBrazos: 'si', dolorEsfuerzo: 'si' })
  })
  it('lo negado sale como ausente, hasta el final de la oración', () => {
    expect(est('Niega hemoptisis, disnea paroxística nocturna y síncope.')).toMatchObject({ hemoptisis: 'no', dpn: 'no' })
    expect(est('Sin soplos ni roce pericárdico')).toMatchObject({ rocePericardico: 'no' })
  })
  it('«no» solo niega hasta la coma', () => {
    expect(est('Dolor que no cede con reposo, irradiado al brazo izquierdo')).toMatchObject({ irradiaBrazos: 'si' })
    expect(est('El dolor no se irradia al brazo')).toMatchObject({ irradiaBrazos: 'no' })
  })
  it('una oración nueva corta la negación', () => {
    expect(est('Niega fiebre. Refiere tos con sangre.')).toMatchObject({ hemoptisis: 'si' })
  })
  it('signos del examen: solo con positivo o negativo', () => {
    expect(est('Murphy positivo')).toMatchObject({ murphy: 'si' })
    expect(est('Signo de Murphy negativo')).toMatchObject({ murphy: 'no' })
    expect(est('Se busca signo de Murphy')).not.toHaveProperty('murphy')
  })
  it('la plantilla de examen normal no inventa hallazgos anormales', () => {
    // «Mucosas húmedas» es el único hallazgo normal del motor: en la plantilla sí está presente.
    for (const t of Object.values(EXAMEN_NORMAL))
      for (const d of detectarEnTexto(t)) expect(d.estado, `${d.hallazgo}: ${t}`).toBe(d.hallazgo === 'mucosasHumedas' ? 'si' : 'no')
  })
  it('mucosas secas = mucosas húmedas ausente', () => {
    expect(est('Mucosas orales secas')).toMatchObject({ mucosasHumedas: 'no' })
  })
})

describe('en la historia', () => {
  it('solo propone hallazgos de síntomas abiertos y sin marcar; al confirmar, cambia el diagnóstico', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor en el pecho' }
    h.enfermedad = { relato: 'Dolor opresivo irradiado al brazo izquierdo. Niega hemoptisis. Murphy positivo.' }
    const d = hallazgosEnLoEscrito(h)
    expect(d.map((x) => x.hallazgo)).toContain('irradiaBrazos')
    expect(d.map((x) => x.hallazgo)).not.toContain('murphy') // la pestaña de dolor abdominal no está abierta
    expect(d.find((x) => x.hallazgo === 'hemoptisis')?.estado).toBe('no')
    const antes = diagnosticosEnVivo(h).find((x) => x.id === 'sca')!.factor
    h.hallazgos = { irradiaBrazos: 'si' }
    expect(diagnosticosEnVivo(h).find((x) => x.id === 'sca')!.factor).toBeGreaterThan(antes)
    expect(hallazgosEnLoEscrito(h).map((x) => x.hallazgo)).not.toContain('irradiaBrazos')
  })
  it('«No corresponde» lo deja de proponer', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor en el pecho' }
    h.enfermedad = { relato: 'Dolor irradiado al brazo izquierdo' }
    h.diagnosticosVivo = { ignorados: 'irradiaBrazos' }
    expect(hallazgosEnLoEscrito(h)).toEqual([])
  })
})

describe('alcance de la negación (revisión 23-nov)', () => {
  it('«sin…» no niega lo que viene en otra frase tras la coma', () => {
    expect(est('Dolor torácico sin irradiación, de inicio súbito')).toMatchObject({ inicioSubito: 'si' })
    expect(est('Niega fiebre, presenta tos con sangre')).toMatchObject({ hemoptisis: 'si' })
    expect(est('Niega fiebre pero refiere tos con sangre')).toMatchObject({ hemoptisis: 'si' })
  })
  it('la lista negada sigue negada', () => {
    expect(est('Niega fiebre, hemoptisis ni síncope')).toMatchObject({ hemoptisis: 'no' })
    expect(est('Sin soplos, roce pericárdico ni galope')).toMatchObject({ rocePericardico: 'no', s3: 'no' })
  })
  it('«sin embargo» no es negación', () => {
    expect(est('Sin embargo refiere tos con sangre')).toMatchObject({ hemoptisis: 'si' })
  })
})

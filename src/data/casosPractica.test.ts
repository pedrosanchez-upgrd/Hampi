import { describe, it, expect } from 'vitest'
import { CASOS, historiaDePractica, preguntarEnPractica, respuestaDe, resultadoPractica } from './casosPractica'
import { DIAGNOSTICOS, HALLAZGOS } from './conocimiento'
import { sintomasAbiertos } from '../lib/historia'
import { diagnosticosEnVivo } from '../lib/motor'

describe('casos de práctica', () => {
  it('solo usan hallazgos y diagnósticos que existen en el motor', () => {
    for (const c of CASOS) {
      expect(DIAGNOSTICOS.some((d) => d.id === c.diagnostico), c.id).toBe(true)
      for (const id of [...Object.keys(c.respuestas), ...c.clave]) expect(HALLAZGOS.some((h) => h.id === id), `${c.id}: ${id}`).toBe(true)
      for (const id of c.clave) expect(c.respuestas[id], `${c.id}: falta respuesta de ${id}`).toBeDefined()
    }
  })
  it('el motivo del caso abre la pestaña del síntoma y el diagnóstico aparece en la lista', () => {
    for (const c of CASOS) {
      const h = historiaDePractica(c)
      expect(sintomasAbiertos(h).length, c.id).toBeGreaterThan(0)
      expect(diagnosticosEnVivo(h).some((d) => d.id === c.diagnostico), c.id).toBe(true)
    }
  })
  it('con todas las respuestas del caso, su diagnóstico queda entre los 3 primeros', () => {
    for (const c of CASOS) expect(resultadoPractica(historiaDePractica(c))!.motorTop, c.id).toContain(DIAGNOSTICOS.find((d) => d.id === c.diagnostico)!.nombre)
  })
  it('preguntar revela la respuesta y la marca; el resultado cuenta preguntas clave y el diagnóstico', () => {
    const c = CASOS[0]
    let h = historiaDePractica(c)
    expect(respuestaDe(h, 'signosTvp')).toBeNull()
    h = preguntarEnPractica(h, 'signosTvp')
    expect(respuestaDe(h, 'signosTvp')!.dice).toContain('hinchada')
    expect(h.hallazgos!.signosTvp).toBe('si')
    h = { ...h, impresion: { diagnosticos: 'Tromboembolismo pulmonar (presuntivo)\nNeumonía (presuntivo)' } }
    const r = resultadoPractica(h)!
    expect(r).toMatchObject({ acerto: true, primero: true })
    expect(r.claveHechas).toEqual(['signosTvp'])
    expect(r.claveFaltaron.map((x) => x.id)).toEqual(['inmovilizacion', 'hemoptisis', 'tvpPrevia', 'cancer'])
  })
})

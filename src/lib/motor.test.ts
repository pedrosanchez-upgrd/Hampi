import { describe, it, expect } from 'vitest'
import { historiaVacia } from './historia'
import { diagnosticosEnVivo, estadoHallazgos, formatoFactor } from './motor'
import { DIAGNOSTICOS, FUENTES, HALLAZGOS } from '../data/conocimiento'
import { SINTOMAS } from '../data/sintomas'

describe('base de conocimiento', () => {
  it('cada regla apunta a un hallazgo, una fuente y un síntoma que existen', () => {
    const hz = new Set(HALLAZGOS.map((h) => h.id))
    const sx = new Set(SINTOMAS.map((s) => s.id))
    for (const d of DIAGNOSTICOS) {
      for (const s of d.sintomas) expect(sx.has(s), `${d.id}: síntoma ${s}`).toBe(true)
      for (const r of d.reglas) {
        expect(hz.has(r.hallazgo), `${d.id}: hallazgo ${r.hallazgo}`).toBe(true)
        expect(FUENTES[r.fuente], `${d.id}: fuente ${r.fuente}`).toBeDefined()
        expect(r.lrPos !== undefined || r.lrNeg !== undefined || r.cualitativo, `${d.id}: ${r.hallazgo} sin peso`).toBeTruthy()
      }
    }
    for (const h of HALLAZGOS) for (const s of h.sintomas) expect(sx.has(s), `${h.id}: ${s}`).toBe(true)
  })
  it('todas las fuentes tienen PMID', () => {
    for (const f of Object.values(FUENTES)) expect(f.pmid).toMatch(/^\d+$/)
  })
})

describe('motor', () => {
  const conDolorToracico = () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor en el pecho', tiempo: '1 hora' }
    return h
  }

  it('sin síntomas no sugiere nada', () => {
    expect(diagnosticosEnVivo(historiaVacia())).toEqual([])
  })

  it('dolor irradiado y de esfuerzo sube el síndrome coronario', () => {
    const h = conDolorToracico()
    h.hallazgos = { irradiaBrazos: 'si', dolorEsfuerzo: 'si' }
    const r = diagnosticosEnVivo(h)
    expect(r[0].id).toBe('sca')
    expect(r[0].factor).toBeCloseTo(2.3 * 2.3)
    expect(r[0].razones.map((x) => x.fuente.pmid)).toEqual(['16304077', '16304077'])
  })

  it('dolor pleurítico baja el coronario y sube la pericarditis', () => {
    const h = conDolorToracico()
    h.hallazgos = { dolorPleuritico: 'si' }
    const r = diagnosticosEnVivo(h)
    const sca = r.find((x) => x.id === 'sca')!
    expect(sca.factor).toBeCloseTo(0.3)
    expect(r[0].id).toBe('pericarditis')
  })

  it('déficit de pulso pone la disección arriba', () => {
    const h = conDolorToracico()
    h.hallazgos = { deficitPulso: 'si', inicioSubito: 'si' }
    expect(diagnosticosEnVivo(h)[0].id).toBe('diseccion')
  })

  it('usa la frecuencia cardiaca para el TEP de forma automática', () => {
    const h = conDolorToracico()
    h.examen = { fc: '120' }
    expect(estadoHallazgos(h).taquicardia).toBe('si')
    expect(diagnosticosEnVivo(h)[0].id).toBe('tep')
  })

  it('infección urinaria solo en mujeres', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'ardor al orinar', tiempo: '2 días' }
    expect(diagnosticosEnVivo(h).map((x) => x.id)).not.toContain('itu')
    h.filiacion = { sexo: 'Mujer' }
    expect(diagnosticosEnVivo(h).map((x) => x.id)).toContain('itu')
  })

  it('dengue con alarma solo con exposición en zona endémica', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'fiebre', tiempo: '3 días' }
    expect(diagnosticosEnVivo(h).map((x) => x.id)).not.toContain('dengueAlarma')
    h.hallazgos = { viajeEndemico: 'si', vomitoFiebre: 'si' }
    expect(diagnosticosEnVivo(h).map((x) => x.id)).toContain('dengueAlarma')
  })

  it('un descartado baja al final', () => {
    const h = conDolorToracico()
    h.hallazgos = { irradiaBrazos: 'si' }
    h.diagnosticosVivo = { descartados: 'sca' }
    const r = diagnosticosEnVivo(h)
    expect(r[r.length - 1].id).toBe('sca')
  })

  it('formatea el factor', () => {
    expect(formatoFactor(5.29)).toBe('×5,3')
    expect(formatoFactor(0.3)).toBe('×0,30')
    expect(formatoFactor(11)).toBe('×11')
  })
})

describe('reglas por conteo y diagnósticos nuevos', () => {
  const cefalea = () => { const h = historiaVacia(); h.motivo = { motivo: 'dolor de cabeza' }; return h }
  it('migraña: 4 criterios POUND dan LR 24', () => {
    const h = cefalea()
    h.hallazgos = { pulsatil: 'si', dura4a72: 'si', unilateral: 'si', nauseaCefalea: 'si' }
    const m = diagnosticosEnVivo(h).find((x) => x.id === 'migrana')!
    expect(m.factor).toBe(24)
  })
  it('migraña: con 2 presentes y 3 sin responder todavía no concluye', () => {
    const h = cefalea()
    h.hallazgos = { pulsatil: 'si', unilateral: 'si' }
    expect(diagnosticosEnVivo(h).find((x) => x.id === 'migrana')!.razones).toHaveLength(0)
    h.hallazgos = { pulsatil: 'si', unilateral: 'si', dura4a72: 'no', nauseaCefalea: 'no', incapacitante: 'no' }
    expect(diagnosticosEnVivo(h).find((x) => x.id === 'migrana')!.factor).toBe(0.41)
  })
  it('ACV: un hallazgo basta para LR 5,5; ninguno de los tres da 0,39', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'boca torcida' }
    h.hallazgos = { paresiaFacial: 'si' }
    expect(diagnosticosEnVivo(h).find((x) => x.id === 'acv')!.factor).toBe(5.5)
    h.hallazgos = { paresiaFacial: 'no', caidaBrazo: 'no', hablaAnormal: 'no' }
    expect(diagnosticosEnVivo(h).find((x) => x.id === 'acv')!.factor).toBe(0.39)
  })
  it('ectópico solo en mujer con posible embarazo', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor abdominal' }
    h.filiacion = { sexo: 'Mujer' }
    expect(diagnosticosEnVivo(h).map((x) => x.id)).not.toContain('ectopico')
    h.personales = { embarazo: 'No sabe' }
    expect(diagnosticosEnVivo(h).map((x) => x.id)).toContain('ectopico')
  })
})

describe('bacteriemia e hipovolemia', () => {
  it('sin criterios de SIRS la bacteriemia baja a ×0,09', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'fiebre' }
    h.hallazgos = { sirs: 'no' }
    expect(diagnosticosEnVivo(h).find((x) => x.id === 'bacteriemia')!.factor).toBeCloseTo(0.09)
  })
  it('axila seca sube la hipovolemia en diarrea', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'diarrea' }
    h.hallazgos = { axilaSeca: 'si' }
    expect(diagnosticosEnVivo(h)[0].id).toBe('hipovolemia')
  })
})

import { describe, it, expect, afterEach } from 'vitest'
import { reglasParaMotor, validarRegla, type ReglaGuardada, type ReglaPropuesta } from './evidenciaNube'
import { diagnosticosEnVivo, establecerReglasAprobadas } from './motor'
import { historiaVacia } from './historia'

const RESUMEN = 'Hemoptysis had a positive likelihood ratio of 1.6 (95% CI 1.1-2.4) for pulmonary embolism in this cohort.'
const base: ReglaPropuesta = { evidencia_id: 'e1', diagnostico: 'tep', hallazgo: 'hemoptisis', lr_pos: 1.6, lr_neg: null, cualitativo: null, solo_ausente: false,
  cita_textual: 'Hemoptysis had a positive likelihood ratio of 1.6 (95% CI 1.1-2.4)' }

describe('validar regla propuesta', () => {
  it('acepta una cita copiada del resumen que contiene el número', () => {
    expect(validarRegla(base, RESUMEN)).toBeNull()
  })
  it('rechaza una cita que no está en el resumen', () => {
    expect(validarRegla({ ...base, cita_textual: 'Hemoptysis strongly predicts embolism with LR 1.6' }, RESUMEN)).toMatch(/tal cual/)
  })
  it('rechaza un número que no está en la cita', () => {
    expect(validarRegla({ ...base, lr_pos: 2.5 }, RESUMEN)).toMatch(/2,5 no aparece/)
  })
  it('el número debe aparecer completo, no como parte de otro', () => {
    expect(validarRegla({ ...base, lr_pos: 1 }, RESUMEN)).toMatch(/no aparece/) // la cita dice 1.6 y 1.1, no 1
    expect(validarRegla({ ...base, lr_pos: 1.1, cita_textual: base.cita_textual }, RESUMEN)).toBeNull() // 1.1 sí está (IC)
    expect(validarRegla({ ...base, lr_pos: 6 }, RESUMEN)).toMatch(/no aparece/)
  })
  it('exige diagnóstico y hallazgo', () => {
    expect(validarRegla({ ...base, hallazgo: '' }, RESUMEN)).toMatch(/Elige/)
  })
  it('rechaza artículos sin resumen y propuestas vacías', () => {
    expect(validarRegla(base, null)).toMatch(/no trae resumen/)
    expect(validarRegla({ ...base, lr_pos: null }, RESUMEN)).toMatch(/Indica/)
  })
})

describe('reglas aprobadas en el motor', () => {
  afterEach(() => establecerReglasAprobadas([]))
  const fila = (confirmada: string | null): ReglaGuardada => ({ ...base, id: 'r1', aprobada_por: 'a', confirmada_por: confirmada,
    evidencia: { id: 'e1', base: 'scielo', identificador: 'S0000-00002020000100001', doi: null, titulo: 'Artículo', autores: 'Pérez J', revista: 'Rev Méd',
      anio: 2020, resumen: RESUMEN, url: 'https://search.scielo.org/resource/es/S0000-00002020000100001-ecu', consulta: 'tep', calidad: 'Latindex',
      estado: 'aprobada', nota_revision: null, encontrada_en: '' } })

  it('solo pasan las confirmadas por el segundo revisor', () => {
    expect(reglasParaMotor([fila(null)])).toEqual([])
    expect(reglasParaMotor([fila('b')])[0].regla).toMatchObject({ hallazgo: 'hemoptisis', lrPos: 1.6, fuente: 'ev:r1' })
  })
  it('si el artículo deja de estar aprobado, la regla deja de contar', () => {
    const f = fila('b')
    expect(reglasParaMotor([{ ...f, evidencia: { ...f.evidencia!, estado: 'rechazada' } }])).toEqual([])
  })
  it('el motor la usa y muestra su fuente', () => {
    const h = historiaVacia()
    h.motivo = { motivo: 'dolor en el pecho' }
    h.hallazgos = { hemoptisis: 'si' }
    const antes = diagnosticosEnVivo(h).find((x) => x.id === 'tep')!
    establecerReglasAprobadas(reglasParaMotor([fila('b')]))
    const despues = diagnosticosEnVivo(h).find((x) => x.id === 'tep')!
    expect(despues.factor).toBeCloseTo(antes.factor * 1.6)
    expect(despues.fuentes.some((f) => f.base === 'scielo' && f.calidad === 'Latindex')).toBe(true)
  })
  it('ignora reglas con diagnóstico o hallazgo desconocido', () => {
    const r = reglasParaMotor([fila('b')])
    establecerReglasAprobadas([{ ...r[0], diagnostico: 'inventado' }, { ...r[0], regla: { ...r[0].regla, hallazgo: 'nada' } }])
    const h = historiaVacia(); h.motivo = { motivo: 'dolor en el pecho' }; h.hallazgos = { hemoptisis: 'si' }
    expect(diagnosticosEnVivo(h).find((x) => x.id === 'tep')!.fuentes.some((f) => f.id.startsWith('ev:'))).toBe(false)
  })
})

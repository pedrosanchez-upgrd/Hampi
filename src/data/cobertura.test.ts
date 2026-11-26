import { describe, it, expect } from 'vitest'
import { historiaVacia, sintomasAbiertos } from '../lib/historia'
import { diagnosticosEnVivo, estadoHallazgos } from '../lib/motor'
import { CONSIDERAR, aConsiderar, considerarEnHistoria } from './considerar'
import { SINTOMAS, detectarSintomas } from './sintomas'
import { detectarEnTexto } from './detectarHallazgos'

const caso = (motivo: string, relato = '', sexo = 'Hombre', edad = '52') => {
  const h = historiaVacia()
  h.filiacion = { sexo, edad }
  h.motivo = { motivo, tiempo: '1 día' }
  h.enfermedad = { relato }
  return h
}

describe('cobertura de temas', () => {
  it('cada síntoma tiene su lista de «otros a considerar» con al menos un grave', () => {
    for (const s of SINTOMAS) {
      expect(CONSIDERAR[s.id]?.length, s.id).toBeGreaterThanOrEqual(5)
      expect(CONSIDERAR[s.id].some((c) => c.grave), `${s.id} sin grave`).toBe(true)
    }
    const ids = new Set(SINTOMAS.map((s) => s.id))
    for (const k of Object.keys(CONSIDERAR)) expect(ids.has(k), k).toBe(true)
  })

  it('frases comunes abren su pestaña', () => {
    const casos: [string, string][] = [
      ['dolor e hinchazón del dedo gordo del pie desde anoche', 'articular'],
      ['me duele la rodilla y está caliente', 'articular'],
      ['crisis de gota', 'articular'],
      ['dolor de garganta y fiebre', 'garganta'],
      ['se le hincharon los labios después de comer mariscos', 'alergia'],
      ['se cayó de las gradas y se golpeó la cabeza', 'trauma'],
      ['lo mordió una culebra en el pie', 'mordedura'],
      ['sangrado vaginal abundante', 'ginecologico'],
      ['dolor testicular súbito', 'testicular'],
      ['ojo rojo y dolor intenso', 'ojo'],
      ['sangra la nariz desde hace una hora', 'epistaxis'],
      ['ingesta voluntaria de raticida', 'intoxicacion'],
      ['dolor de cuello', 'cuello'],
      ['dolor en la pantorrilla derecha', 'extremidad'],
      ['glucosa baja en el glucómetro', 'glucosaBaja'],
      ['dolor de oído con secreción', 'oido'],
      ['se quemó con agua hirviendo', 'quemadura'],
    ]
    for (const [t, id] of casos) expect(detectarSintomas(t), t).toContain(id)
  })

  it('no abre pestañas por frases que no corresponden', () => {
    expect(detectarSintomas('dolor de cabeza que empezó de golpe')).not.toContain('trauma')
    expect(detectarSintomas('caída del brazo derecho')).not.toContain('trauma')
    expect(detectarSintomas('tomó pastillas para la presión')).not.toContain('intoxicacion')
    expect(detectarSintomas('accidente cerebrovascular previo')).not.toContain('trauma')
    expect(detectarSintomas('buena ingesta de alimentos')).not.toContain('intoxicacion')
    expect(detectarSintomas('niega dolor en el dedo gordo')).not.toContain('articular')
  })
})

describe('gota y artritis séptica', () => {
  const gota = () => caso('dolor e hinchazón del dedo gordo del pie', 'Despertó con el dolor en la madrugada. Dedo gordo rojo y caliente. Ya le había pasado antes.')

  it('el caso de gota muestra gota y artritis séptica (grave) en el motor', () => {
    const ids = diagnosticosEnVivo(gota()).map((d) => d.id)
    expect(ids).toContain('gota')
    expect(ids).toContain('artritisSeptica')
  })

  it('lee del relato los hallazgos de la regla de Janssens', () => {
    const t = 'Despertó con el dolor en la madrugada. Dedo gordo rojo y caliente. Ya le había pasado antes.'
    const enc = detectarEnTexto(t).filter((x) => x.estado === 'si').map((x) => x.hallazgo)
    expect(enc).toEqual(expect.arrayContaining(['mtp1', 'articulacionRoja', 'inicio1dia', 'ataquePrevio']))
  })

  it('con los hallazgos marcados, gota sube por encima de artritis séptica', () => {
    const h = gota()
    h.hallazgos = { mtp1: 'si', articulacionRoja: 'si', inicio1dia: 'si', ataquePrevio: 'si' }
    const lista = diagnosticosEnVivo(h)
    expect(lista[0].id).toBe('gota')
    expect(lista.find((d) => d.id === 'gota')!.razones.some((r) => r.texto.startsWith('Sexo masculino'))).toBe(true)
  })

  it('el líquido sinovial manda: más de 100 000 leucocitos implica los tramos menores (LR 28)', () => {
    const h = gota()
    h.hallazgos = { wbc100: 'si' }
    const e = estadoHallazgos(h)
    expect(e.wbc50).toBe('si')
    expect(e.wbc25).toBe('si')
    const s = diagnosticosEnVivo(h).find((d) => d.id === 'artritisSeptica')!
    expect(s.razones.some((r) => r.factor === 28)).toBe(true)
  })

  it('menos de 25 000 leucocitos baja la artritis séptica (LR 0,32)', () => {
    const h = gota()
    h.hallazgos = { wbc25: 'no' }
    const s = diagnosticosEnVivo(h).find((d) => d.id === 'artritisSeptica')!
    expect(s.razones.some((r) => r.factor === 0.32)).toBe(true)
  })

  it('no aplica: con dolor torácico no aparecen gota ni artritis séptica', () => {
    const ids = diagnosticosEnVivo(caso('dolor en el pecho al caminar')).map((d) => d.id)
    expect(ids).not.toContain('gota')
    expect(ids).not.toContain('artritisSeptica')
  })

  it('en mujer no cuenta el «sexo masculino»', () => {
    const h = caso('dolor del dedo gordo del pie', '', 'Mujer')
    const g = diagnosticosEnVivo(h).find((d) => d.id === 'gota')!
    expect(g.razones.some((r) => r.texto.startsWith('Sexo masculino') && r.factor > 1)).toBe(false)
  })
})

describe('otros a considerar', () => {
  it('las pistas suben la opción y dicen por qué', () => {
    const l = aConsiderar(['articular'], 'dolor del dedo gordo del pie, toma hidroclorotiazida')
    expect(l[0].nombre).toBe('Gota')
    expect(l[0].porque).toEqual(expect.arrayContaining(['dedo gordo', 'hidroclorotiazida']))
  })

  it('lo negado no es pista', () => {
    const l = aConsiderar(['articular'], 'niega dolor en el dedo gordo')
    expect(l.find((x) => x.nombre === 'Gota')!.porque).toEqual([])
  })

  it('sin pistas, lo grave va primero', () => {
    const l = aConsiderar(['cefalea'], 'dolor de cabeza')
    expect(l[0].grave).toBe(true)
  })

  it('la edad y los antecedentes cuentan como pista', () => {
    const h = caso('dolor lumbar')
    h.filiacion!.edad = '70'
    const l = considerarEnHistoria(h, sintomasAbiertos(h))
    expect(l.find((x) => x.nombre === 'Aneurisma de aorta abdominal')!.porque).toContain('mayor de 60')
  })

  it('no repite lo que ya está en el motor', () => {
    const l = aConsiderar(['articular'], '', new Set(['artritis séptica']))
    expect(l.some((x) => x.nombre === 'Artritis séptica')).toBe(false)
  })
})

describe('faringitis estreptocócica y aneurisma de aorta', () => {
  it('placas en amígdalas suben la faringitis estreptocócica (LR 3,4)', () => {
    const h = caso('dolor de garganta', 'Amígdalas con placas blanquecinas.', 'Mujer', '25')
    expect(detectarEnTexto('Amígdalas con placas blanquecinas.').map((x) => x.hallazgo)).toContain('exudadoAmigdalar')
    h.hallazgos = { exudadoAmigdalar: 'si' }
    const d = diagnosticosEnVivo(h).find((x) => x.id === 'faringitisStrep')!
    expect(d.razones[0].factor).toBe(3.4)
  })
  it('sin ganglios dolorosos baja (LR 0,6); no aplica en dolor de pecho', () => {
    const h = caso('dolor de garganta', '', 'Mujer', '25')
    h.hallazgos = { ganglioCervical: 'no' }
    expect(diagnosticosEnVivo(h).find((x) => x.id === 'faringitisStrep')!.razones[0].factor).toBe(0.6)
    expect(diagnosticosEnVivo(caso('dolor en el pecho')).map((x) => x.id)).not.toContain('faringitisStrep')
  })
  it('masa pulsátil sube el aneurisma (LR 12); palpación normal lo baja poco (0,72)', () => {
    const h = caso('dolor lumbar', '', 'Hombre', '72')
    h.hallazgos = { aortaAncha: 'si' }
    expect(diagnosticosEnVivo(h).find((x) => x.id === 'aneurismaAorta')!.razones[0].factor).toBe(12)
    h.hallazgos = { aortaAncha: 'no' }
    expect(diagnosticosEnVivo(h).find((x) => x.id === 'aneurismaAorta')!.razones[0].factor).toBe(0.72)
  })
})

describe('temas de todas las rotaciones', () => {
  it('abre la pestaña que corresponde', () => {
    const casos: [string, string][] = [
      ['embarazada de 34 semanas de gestación con dolor de cabeza', 'embarazo'],
      ['presión baja y piel fría', 'shock'],
      ['bulto en la mama izquierda', 'mama'],
      ['dolor anal al defecar', 'anal'],
      ['hernia inguinal que no se mete', 'hernia'],
      ['gripe con nariz tapada', 'nariz'],
      ['dolor de muela', 'boca'],
      ['no puedo orinar desde ayer', 'orinar'],
      ['dolor muscular y orina oscura', 'muscular'],
      ['temblor en las manos', 'temblor'],
      ['olvida las cosas desde hace un año', 'memoria'],
      ['recién operado de vesícula con fiebre', 'posoperatorio'],
      ['lactante con fiebre que no quiere lactar', 'pediatrico'],
      ['secreción uretral', 'ets'],
      ['síntomas de abstinencia de alcohol', 'sustancias'],
      ['abuso sexual hace 10 horas', 'violencia'],
      ['hipotermia tras pasar la noche en el páramo', 'ambiental'],
      ['paro cardiorrespiratorio en la sala', 'paro'],
    ]
    for (const [t, id] of casos) expect(detectarSintomas(t), t).toContain(id)
  })
  it('no confunde frases de otros temas', () => {
    expect(detectarSintomas('dolor de pecho que irradia al hombro izquierdo')).not.toContain('muscular')
    expect(detectarSintomas('fiebre con rigidez de nuca')).not.toContain('temblor')
    expect(detectarSintomas('viene con su mamá')).not.toContain('mama')
    expect(detectarSintomas('lumbalgia por hernia discal')).not.toContain('hernia')
    expect(detectarSintomas('su hijo refiere que la paciente está confusa')).not.toContain('pediatrico')
    expect(detectarSintomas('diarrea con moco')).not.toContain('nariz')
  })
})

it('la hinchazón de una articulación no abre «Edema»', () => {
  expect(detectarSintomas('dolor e hinchazón del dedo gordo del pie')).not.toContain('edema')
  expect(detectarSintomas('hinchazón de piernas desde hace un mes')).toContain('edema')
})

it('no repite «Gota» si el motor ya muestra «Gota (artritis gotosa aguda)»', () => {
  expect(aConsiderar(['articular'], '', new Set(['gota (artritis gotosa aguda)'])).some((x) => x.nombre === 'Gota')).toBe(false)
})

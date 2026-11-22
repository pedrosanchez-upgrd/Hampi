import { historiaVacia, type Historia } from '../lib/historia'

/** Caso FICTICIO para probar la app (dolor torácico en un hombre con factores de riesgo). */
export function casoEjemplo(): Historia {
  const h = historiaVacia()
  return {
    ...h,
    filiacion: { nombre: 'Caso ficticio', edad: '58', sexo: 'Hombre', residencia: 'Cuenca', zona: 'Urbana', ocupacion: 'Chofer de bus', seguro: 'IESS', fuente: 'Paciente', confiabilidad: 'Buena' },
    motivo: { motivo: 'dolor en el pecho', tiempo: '2 horas' },
    enfermedad: {
      relato: 'Paciente refiere dolor en el pecho de inicio hace 2 horas mientras subía las gradas de su casa. El dolor no cede con el reposo. Se acompaña de sudoración fría y náusea.',
      sintoma: 'Dolor torácico', aparicion: 'Hace 2 horas, durante el esfuerzo', localizacion: 'Retroesternal', intensidad: '8',
      caracter: 'Opresivo', irradiacion: 'Brazo izquierdo y mandíbula', atenuantes: 'No cede con el reposo', evolucion: 'Continuo, sin mejoría',
      acompanantes: 'Sudoración fría, náusea',
    },
    sintomas: { 'toracico.p0': '1', 'toracico.p1': '1', 'toracico.p2': '1', 'toracico.a0': '1', 'toracico.a1': '0', 'toracico.a2': '0', 'toracico.a3': '0', 'toracico.a4': '0' },
    hallazgos: { irradiaBrazos: 'si', dolorEsfuerzo: 'si', dolorPleuritico: 'no', inicioSubito: 'no', deficitPulso: 'no', deficitFocal: 'no', signosTvp: 'no', inmovilizacion: 'no' },
    antecedentes: { 'p.hta': 'si', 'p.hta.det': 'desde 2016, losartán 50 mg al día', 'p.dm': 'si', 'p.dm.det': 'tipo 2 desde 2019, metformina 850 mg dos veces al día', 'p.dislipidemia': 'si', 'p.cardiopatiaIsq': 'no', 'p.ic': 'no', 'p.fa': 'no', 'p.tvp': 'no', 'p.cancer': 'no', 'f.cardioPrecoz': 'Padre', 'f.dm': 'Madre', 'e.viaje': 'no' },
    personales: { alergicos: 'Niega alergias', farmacologicos: 'Losartán 50 mg cada día; metformina 850 mg cada 12 horas', tabaco: 'Fumador activo', tabacoCig: '20', tabacoAnios: '30', alcohol: 'Ocasional' },
    examen: { pas: '150', pad: '95', fc: '98', fr: '20', temp: '36,6', sat: '93', oxigeno: 'Aire ambiente', peso: '84', talla: '168', aspecto: 'Paciente consciente, orientado, diaforético, con facies de dolor.' },
  }
}

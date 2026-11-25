// «Peor caso realista» para break-ui: datos que un interno de Cuenca podría escribir de verdad.
// Se carga por el mismo borde que usa la app (localStorage «hampi.borrador»), sin tocar los componentes.
// Ficticio.

const relato =
  'Paciente refiere que hace aproximadamente 3 semanas y media empezó con dolor en el pecho tipo opresivo 😣, que al inicio aparecía solo al subir las gradas del mercado 10 de Agosto pero desde la madrugada de hoy (aprox. 03:40) es en reposo.\n' +
  'Se acompaña de falta de aire, tos con flema amarillenta, fiebre no cuantificada, dolor de cabeza y mareo al ponerse de pie.   Familiar (hija) refiere que "estaba pálida y sudorosa".\n\n' +
  'Ha tomado paracetamol 500 mg c/8h, aguas de manzanilla y "pastillas para la presión" que no recuerda el nombre; no mejora. Niega síncope, niega convulsiones, niega sangrado. ' +
  'Refiere además que hace 2 años fue hospitalizada en el Hospital Vicente Corral Moscoso por "neumonía" durante 7 días, y que su madre falleció de infarto a los 60 años. '.repeat(2)

module.exports = {
  'hampi.terminos': { version: '0.1-borrador', fecha: '2026-11-25T08:00:00.000Z' },
  'hampi.sinCuenta': true,
  'hampi.visto': true,
  'hampi.borrador': {
    filiacion: {
      nombre: 'María Fernanda de los Ángeles Quizhpi Guamán', edad: '1', sexo: 'Mujer', cedula: '0102030405',
      residencia: 'Parroquia rural San Joaquín, sector Barabón Chico, vía a Soldados km 4', zona: 'Rural',
      ocupacion: 'Comerciante minorista de legumbres en el mercado 10 de Agosto', fuente: 'Familiar',
      acompanante: 'Hija: Jessica Alexandra Quizhpi Guamán, 0987654321 / 07-2834567 (casa)',
    },
    motivo: { motivo: 'ME DUELE MUCHÍSIMO EL PECHO DESDE LA MADRUGADA Y YA NO AGUANTO, SIENTO QUE ME AHOGO CUANDO CAMINO AL BAÑO', tiempo: '3 semanas y media, empeora desde hace 6 horas' },
    enfermedad: {
      relato, sintoma: 'Dolor torácico opresivo con disnea y tos productiva', aparicion: 'Progresiva',
      localizacion: 'Retroesternal con irradiación difusa a todo el hemitórax izquierdo y región interescapular',
      intensidad: '10', caracter: 'Opresivo, a ratos punzante', irradiacion: 'Brazo izquierdo, mandíbula, espalda', atenuantes: 'No cede con el reposo ni con paracetamol',
      evolucion: 'En aumento', acompanantes: 'Disnea, tos, fiebre, cefalea, mareo, náusea, vómito, sudoración',
    },
    personales: {
      alergicos: 'Penicilina (urticaria generalizada y edema de labios en 2019); sulfas (exantema); mariscos (prurito)',
      farmacologicos: 'Losartán 50 mg VO cada 12 h; amlodipino 5 mg VO cada día; metformina 850 mg VO con desayuno y merienda; atorvastatina 20 mg VO en la noche; ácido acetilsalicílico 100 mg VO cada día; omeprazol 20 mg VO en ayunas; levotiroxina 50 mcg VO en ayunas; complejo B; agua de toronjil cuando tiene nervios',
      tabaco: 'Niega', alcohol: 'Niega',
    },
    antecedentes: {
      'p.hta': 'si', 'p.hta.det': 'desde hace 15 años, controles irregulares en el subcentro de salud de San Joaquín, no recuerda últimas tomas',
      'p.dm': 'si', 'p.dm.det': 'tipo 2 desde 2012, última hemoglobina glicosilada «no sabe»',
      'p.dislipidemia': 'si', 'p.tiroides': 'si',
    },
    examen: { pas: '178', pad: '102', fc: '118', fr: '28', temp: '38,4', sat: '84', peso: '91,5', talla: '149', aspecto: 'Paciente álgida, diaforética, con dificultad respiratoria moderada.' },
    impresion: { diagnosticos: 'Síndrome coronario agudo (presuntivo)\nNeumonía adquirida en la comunidad (presuntivo)\nTromboembolismo pulmonar (presuntivo)\nInsuficiencia cardiaca (presuntivo)\nSangrado digestivo alto que requiere intervención urgente (presuntivo)' },
    sintomas: {}, hallazgos: {}, diagnosticosVivo: {}, guia: {},
  },
}

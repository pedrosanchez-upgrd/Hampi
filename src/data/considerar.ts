// Otros diagnósticos a considerar según el síntoma (diagnóstico diferencial clásico de
// medicina interna y emergencias). Lista ORIENTATIVA, sin puntaje ni fuente por regla:
// sirve para no olvidar opciones. PENDIENTE DE REVISIÓN MÉDICA.
//
// Notación de cada entrada (para que el revisor la lea fácil):
//   '!Nombre'                 → grave, «no te lo pierdas» (se muestra primero)
//   'Nombre @ pista, pista'   → pistas: palabras que, si aparecen en lo escrito (sin negar),
//                                suben la opción arriba de la lista y dicen por qué.
// Las pistas se comparan sin tildes ni mayúsculas; no cambian ningún puntaje.

import { normalizar, quitarNegado } from './sintomas'
import { PATOLOGICOS } from './antecedentes'
import { textoClinico, type Historia } from '../lib/historia'

const L: Record<string, string[]> = {
  // General
  fiebre: [
    '!Sepsis @ hipotension, confus, escalofrio', '!Meningitis @ rigidez de nuca, nuca rigida', '!Dengue con signos de alarma @ costa, amazon, petequia',
    '!Malaria @ amazon, esmeraldas, oriente', '!Leptospirosis @ inundac, agua estancada, ratas, arrozal', '!Neutropenia febril @ quimioterapia',
    '!Endocarditis infecciosa @ soplo, valvula, drogas intravenosas', 'Neumonía @ tos, flema, crepitant', 'Pielonefritis @ ardor al orinar, puno percusion, lumbar',
    'Infección de piel y partes blandas @ celulitis, absceso, herida', 'Tuberculosis @ sudor nocturno, tos cronica, perdida de peso', 'Fiebre tifoidea @ agua no tratada, diarrea',
    'Colangitis @ ictericia, hipocondrio derecho', 'Absceso hepático o abdominal', 'Infección viral (influenza, COVID-19) @ mialgia, contacto', 'Brucelosis @ leche cruda, queso fresco',
    'Fiebre por fármacos', 'Enfermedad autoinmune (lupus, Still)', 'Linfoma u otra neoplasia @ ganglio, sudor nocturno',
  ],
  peso: [
    '!Cáncer (digestivo, pulmón, linfoma) @ mayor de 50, sangre, ganglio', 'Diabetes descompensada @ sed, orina mucho', 'Hipertiroidismo @ temblor, palpitacion, calor',
    'Tuberculosis @ tos, sudor nocturno', 'Infección por VIH', 'Depresión @ triste, animo', 'Malabsorción (celiaquía, parásitos) @ diarrea', 'Insuficiencia suprarrenal @ hipotension, piel oscura',
    'Enfermedad inflamatoria intestinal @ diarrea con sangre', 'Problemas dentales o de deglución @ disfagia',
  ],
  cansancio: [
    'Anemia @ palid, sangrado', 'Hipotiroidismo @ frio, estrenimiento, piel seca', 'Depresión @ triste, no duermo', 'Diabetes @ sed, orina mucho',
    '!Insuficiencia cardiaca @ disnea, edema', 'Enfermedad renal crónica', 'Apnea del sueño @ ronca', 'Infección crónica (TB, VIH, hepatitis)', 'Efecto de fármacos',
    '!Cáncer @ perdida de peso', 'Insuficiencia suprarrenal', 'Hipercalcemia',
  ],
  ganglios: [
    'Infección local (faringe, piel, dental) @ garganta, herida', 'Mononucleosis @ garganta, fiebre', '!Tuberculosis ganglionar @ cuello, tb', '!Linfoma @ sudor nocturno, perdida de peso',
    '!Metástasis @ supraclavicular, duro', 'Enfermedad por arañazo de gato @ gato', 'Infección por VIH', 'Toxoplasmosis', 'Lupus o reacción a fármacos',
  ],
  sudor: ['!Tuberculosis @ tos', '!Linfoma @ ganglio', 'Infección crónica (endocarditis, absceso)', 'Hipertiroidismo', 'Menopausia', 'Hipoglucemia nocturna @ insulina', 'Efecto de fármacos o abstinencia de alcohol'],
  // Cardiovascular
  toracico: [
    '!Neumotórax @ subit, alto y delgado, fumador', '!Taponamiento cardiaco @ ingurgitacion, hipotension', '!Rotura esofágica (Boerhaave) @ vomito violento',
    '!Pancreatitis aguda @ epigastr, alcohol', 'Reflujo gastroesofágico @ acidez, agrura', 'Dolor osteomuscular (costocondritis) @ al presionar, palpacion',
    'Espasmo esofágico', 'Crisis de ansiedad @ ansios, nervios', 'Herpes zóster @ vesicula, ampolla, zoster', 'Neumonía con pleuritis @ fiebre, tos',
    'Úlcera péptica @ epigastr, aine', 'Cólico biliar @ hipocondrio derecho, comida grasa', 'Estenosis aórtica @ soplo, sincope',
  ],
  palpitaciones: [
    'Taquicardia sinusal (fiebre, anemia, dolor, ansiedad)', '!Fibrilación auricular @ irregular', '!Taquicardia ventricular @ cardiopatia, sincope', 'Taquicardia supraventricular @ subit, inicio y fin',
    'Extrasístoles', 'Hipertiroidismo @ temblor, calor, perdida de peso', 'Crisis de ansiedad @ ansios', 'Café, alcohol, fármacos o drogas @ cafe, cocaina, salbutamol',
    'Anemia @ palid', '!Chagas (cardiopatía chagásica) @ chagas, chinchorro', 'Hipoglucemia @ insulina', 'Feocromocitoma @ cefalea, sudor',
  ],
  sincope: [
    'Síncope vasovagal @ de pie, calor, sangre, dolor', 'Hipotensión ortostática @ al levantarse, ponerse de pie', '!Arritmia (bloqueo, taquicardia ventricular) @ palpitacion, sin aviso, esfuerzo',
    '!Estenosis aórtica @ esfuerzo, soplo', '!Tromboembolismo pulmonar @ disnea', '!Sangrado oculto (digestivo, ectópico) @ melena, heces negras, embarazo',
    '!Disección aórtica @ desgarr', 'Síncope situacional (al orinar, toser) @ orinar, toser', 'Hipoglucemia @ insulina, diabetes', 'Crisis convulsiva @ mordedura de lengua, movimientos',
    'Efecto de fármacos (antihipertensivos) @ losartan, enalapril, amlodipino', '!Miocardiopatía hipertrófica @ joven, muerte subita',
  ],
  edema: [
    '!Trombosis venosa profunda @ una sola pierna, unilateral', '!Insuficiencia cardiaca @ disnea, ortopnea', 'Insuficiencia venosa crónica @ varices', 'Síndrome nefrótico @ espuma, espumosa, cara',
    'Cirrosis @ alcohol, ascitis, ictericia', 'Celulitis @ rojo, calor, fiebre', 'Edema por fármacos (amlodipino, AINE) @ amlodipino, nifedipino, aine', 'Hipotiroidismo',
    'Linfedema', 'Desnutrición (hipoalbuminemia)', 'Quiste de Baker roto @ rodilla', '!Insuficiencia renal aguda @ orina poco',
  ],
  hta: [
    '!Emergencia hipertensiva con daño de órgano @ dolor de pecho, deficit, confus', '!Preeclampsia @ embaraz, puerper', '!ACV hemorrágico @ cefalea subita, deficit',
    'Urgencia hipertensiva sin daño de órgano', 'Mala adherencia al tratamiento', 'Dolor o ansiedad', 'Enfermedad renal @ creatinina', 'Hiperaldosteronismo @ potasio bajo',
    'Fármacos o drogas (AINE, descongestionantes, cocaína) @ aine, cocaina', 'Apnea del sueño @ ronca', 'Feocromocitoma @ palpitacion, sudor',
  ],
  claudicacion: ['!Isquemia aguda de la pierna @ fria, palida, subit', 'Enfermedad arterial periférica @ fumador, diabetes', 'Estenosis de canal lumbar @ al agacharse, espalda', 'Trombosis venosa profunda', 'Síndrome compartimental crónico'],
  // Respiratorio
  disnea: [
    '!Tromboembolismo pulmonar @ subit, cirugia, inmovil, pierna', '!Insuficiencia cardiaca @ ortopnea, edema, almohadas', '!Síndrome coronario agudo @ dolor de pecho, sudor', '!Neumotórax @ subit, fumador',
    '!Anafilaxia @ alergia, ronchas, labios', '!Taponamiento cardiaco', 'Crisis asmática @ asma, silbido, inhalador', 'Exacerbación de EPOC @ fumador, epoc, lena', 'Neumonía @ fiebre, tos',
    'Derrame pleural', 'Anemia @ palid', 'Acidosis metabólica (cetoacidosis) @ diabetes, glucosa', 'Crisis de ansiedad @ ansios, hormigueo', 'Mal de altura @ altura, viaje a la sierra',
    'Enfermedad neuromuscular (Guillain-Barré, miastenia) @ debilidad',
  ],
  tos: [
    'Infección respiratoria alta @ moco, garganta', 'Bronquitis aguda', 'Neumonía @ fiebre, flema', '!Tuberculosis pulmonar @ dos semanas, sudor nocturno, perdida de peso', 'Asma @ silbido, noche',
    'EPOC @ fumador, lena', 'Goteo posnasal (rinitis, sinusitis) @ nariz, moco', 'Reflujo gastroesofágico @ acidez', 'Tos por IECA @ enalapril, captopril', 'Tos ferina @ accesos, gallo',
    '!Cáncer de pulmón @ fumador, sangre, perdida de peso', '!Insuficiencia cardiaca @ ortopnea, edema', 'Bronquiectasias @ flema abundante',
  ],
  hemoptisis: ['!Tuberculosis pulmonar @ tb, sudor', '!Cáncer de pulmón @ fumador', '!Tromboembolismo pulmonar @ disnea, pierna', 'Bronquiectasias', 'Bronquitis aguda', 'Neumonía', '!Estenosis mitral @ soplo', 'Anticoagulación excesiva @ warfarina', 'Sangrado de nariz o garganta (seudohemoptisis)', 'Vasculitis (Goodpasture, granulomatosis)'],
  sibilancias: ['Crisis asmática', 'Exacerbación de EPOC', '!Anafilaxia @ alergia, ronchas', '!Insuficiencia cardiaca («asma cardiaca») @ edema, ortopnea', 'Bronquiolitis o infección viral', '!Cuerpo extraño @ atragant', 'Disfunción de cuerdas vocales'],
  // Digestivo
  abdominal: [
    '!Apendicitis @ fosa iliaca derecha, fid', '!Embarazo ectópico @ atraso, embaraz', '!Pancreatitis aguda @ epigastr, alcohol, espalda, cinturon', '!Obstrucción intestinal @ no canaliza, gases, distens, vomito',
    '!Perforación de víscera hueca @ tabla, defensa, aine', '!Isquemia mesentérica @ fibrilacion, desproporcion', '!Aneurisma de aorta abdominal roto @ pulsatil, espalda, mayor de 60',
    '!Síndrome coronario agudo (dolor epigástrico) @ diabetes, sudor', '!Cetoacidosis diabética @ glucosa, diabetes', 'Colecistitis aguda @ hipocondrio derecho, murphy',
    'Cólico biliar @ comida grasa', 'Colangitis @ ictericia, fiebre', 'Gastroenteritis aguda @ diarrea', 'Úlcera péptica @ aine, acidez', 'Cólico renal @ lumbar, ingle, orina con sangre',
    'Pielonefritis @ fiebre, ardor al orinar', 'Enfermedad inflamatoria pélvica @ flujo, fiebre', 'Torsión de ovario @ subit', 'Diverticulitis @ fosa iliaca izquierda, mayor de 50',
    'Hernia encarcelada @ hernia, bulto', 'Estreñimiento @ estren', 'Síndrome de intestino irritable', 'Hepatitis aguda @ ictericia', 'Vólvulo de sigmoides (frecuente en la altura) @ distens, sigmoides',
  ],
  vomito: [
    'Gastroenteritis aguda @ diarrea', '!Obstrucción intestinal @ distens, no canaliza, fecaloide', '!Cetoacidosis diabética @ glucosa, diabetes, sed', '!Hipertensión intracraneal (tumor, hemorragia) @ cefalea, deficit',
    '!Síndrome coronario agudo @ dolor de pecho, sudor', '!Pancreatitis aguda @ epigastr, alcohol', 'Embarazo @ atraso, embaraz', 'Efecto de fármacos (metformina, opioides, quimioterapia)',
    'Gastroparesia @ diabetes', 'Vértigo periférico @ vertigo, da vueltas', 'Apendicitis @ fosa iliaca derecha', 'Intoxicación alimentaria @ comida', 'Insuficiencia suprarrenal', 'Uremia @ renal',
  ],
  diarrea: [
    'Gastroenteritis viral', 'Disentería bacteriana (Shigella, Campylobacter) @ sangre, moco, fiebre', 'Parasitosis intestinal (amebas, Giardia) @ agua no tratada', 'Fiebre tifoidea @ fiebre',
    '!Colitis por Clostridioides difficile @ antibiotico', '!Cólera @ agua de arroz, abundante', '!Deshidratación grave @ no orina, sed', 'Intolerancia a la lactosa @ leche',
    'Enfermedad inflamatoria intestinal @ cronica, sangre', 'Efecto de fármacos (metformina, laxantes)', 'Hipertiroidismo', 'Cáncer colorrectal @ mayor de 50, cambio del habito', 'Infección por VIH',
  ],
  estrenimiento: ['!Obstrucción intestinal @ distens, gases, vomito', '!Cáncer colorrectal @ sangre, mayor de 50, perdida de peso', 'Vólvulo de sigmoides @ distens', 'Hábito de dieta pobre en fibra', 'Efecto de fármacos (opioides, hierro, calcioantagonistas) @ tramadol, hierro', 'Hipotiroidismo @ frio', 'Hipercalcemia', 'Síndrome de intestino irritable', 'Fisura anal o hemorroides @ dolor al defecar'],
  sangradoDigestivo: [
    'Úlcera péptica @ aine, ibuprofeno, diclofenaco, aspirina', '!Várices esofágicas @ cirrosis, alcohol', 'Síndrome de Mallory-Weiss @ vomito', 'Esofagitis o gastritis erosiva',
    'Hemorroides @ sangre roja, al defecar', 'Fisura anal @ dolor al defecar', 'Enfermedad diverticular @ mayor de 60', '!Cáncer colorrectal o gástrico @ perdida de peso, anemia',
    'Angiodisplasia', 'Colitis infecciosa o isquémica @ diarrea', 'Enfermedad inflamatoria intestinal', 'Anticoagulación excesiva @ warfarina, rivaroxaban', 'Falsa melena (hierro, bismuto) @ hierro',
  ],
  disfagia: ['!Cáncer de esófago @ progresiva, perdida de peso, fumador', '!Impactación de alimento @ subit, carne, saliva', 'Estenosis péptica @ acidez', 'Acalasia @ liquidos y solidos', '!ACV (disfagia orofaríngea) @ deficit, tos al tragar', 'Esofagitis (Candida, eosinofílica)', 'Chagas (megaesófago) @ chagas', 'Bocio grande @ tiroides', 'Miastenia gravis @ ptosis'],
  ictericia: [
    'Hepatitis viral aguda (A, B) @ contacto, agua', '!Colangitis @ fiebre, dolor, escalofrio', 'Coledocolitiasis @ colico, hipocondrio derecho', 'Hepatitis por alcohol @ alcohol',
    'Hepatitis por fármacos o hierbas @ paracetamol, hierbas', '!Falla hepática aguda @ confus, sangrado', '!Cáncer de páncreas o vía biliar @ indolora, perdida de peso, prurito',
    'Hemólisis @ anemia, orina oscura', 'Cirrosis @ ascitis', 'Leptospirosis @ inundac, ratas', 'Malaria @ amazon', 'Síndrome de Gilbert @ ayuno',
  ],
  distension: ['Cirrosis con ascitis @ alcohol, ictericia', '!Peritonitis bacteriana espontánea @ fiebre, cirrosis', '!Obstrucción intestinal @ vomito, no canaliza', '!Vólvulo de sigmoides @ subit', 'Insuficiencia cardiaca @ edema', 'Carcinomatosis peritoneal o cáncer de ovario @ perdida de peso', 'Tuberculosis peritoneal', 'Síndrome de intestino irritable', 'Embarazo'],
  acidez: ['Reflujo gastroesofágico', 'Gastritis o úlcera péptica @ aine, helicobacter', '!Síndrome coronario agudo @ esfuerzo, sudor, diabetes', '!Cáncer gástrico @ perdida de peso, anemia, mayor de 60', 'Dispepsia funcional', 'Cólico biliar @ comida grasa', 'Esofagitis por fármacos @ doxiciclina, alendronato'],
  // Renal y urinario
  urinario: ['Cistitis', 'Pielonefritis @ fiebre, lumbar, puno percusion', 'Uretritis (ETS) @ secrecion, pareja', 'Vaginitis @ flujo, picazon', 'Prostatitis @ fiebre, perineal', 'Hiperplasia prostática @ chorro debil, goteo', 'Cálculo vesical o ureteral @ colico', '!Urosepsis @ hipotension, confus', 'Diabetes descompensada @ sed', 'Cáncer de vejiga @ sangre, fumador'],
  hematuria: ['Infección urinaria @ ardor', 'Cálculo renal @ colico', '!Cáncer de vejiga o riñón @ indolora, fumador, mayor de 40', 'Hiperplasia prostática', 'Glomerulonefritis @ edema, hipertension, espuma', 'Anticoagulación excesiva @ warfarina', 'Trauma @ golpe', 'Ejercicio intenso', 'Falsa hematuria (menstruación, remolacha, rifampicina)', 'Mordedura de serpiente (coagulopatía) @ serpiente'],
  diuresis: ['!Lesión renal aguda prerrenal (deshidratación) @ vomito, diarrea', '!Retención urinaria @ globo, prostata', '!Obstrucción urinaria @ calculo', 'Necrosis tubular (sepsis, fármacos) @ aine, contraste', '!Rabdomiólisis @ orina oscura, ejercicio, trauma', 'Diabetes descompensada (poliuria) @ sed, glucosa', 'Diabetes insípida', 'Uso de diuréticos @ furosemida', 'Hipercalcemia'],
  colicoRenal: ['Litiasis renal', '!Pielonefritis obstructiva @ fiebre', '!Aneurisma de aorta abdominal @ mayor de 60, pulsatil', 'Apendicitis o diverticulitis @ fosa iliaca', '!Embarazo ectópico @ atraso', 'Torsión testicular u ovárica @ testicul', 'Infarto renal @ fibrilacion', 'Herpes zóster @ vesicula'],
  testicular: ['!Torsión testicular @ subit, joven, vomito', 'Epididimitis u orquitis @ fiebre, ardor, parotid', '!Gangrena de Fournier @ diabetes, perineal, negro', 'Hernia inguinal encarcelada @ bulto, hernia', 'Torsión de apéndice testicular', 'Trauma testicular @ golpe', 'Varicocele o hidrocele', '!Cáncer de testículo @ masa, indolora', 'Cólico renal irradiado @ lumbar'],
  // Neurológico
  cefalea: [
    '!Hemorragia subaracnoidea @ subit, trueno, peor dolor', '!Meningitis @ fiebre, rigidez, nuca', '!Tumor o lesión intracraneal @ progresiv, despierta, vomito', '!Trombosis venosa cerebral @ embaraz, puerper, anticonceptivo',
    '!Intoxicación por monóxido de carbono @ calefon, brasero, varios en casa', '!Arteritis de células gigantes @ mayor de 50, mandibula, temporal', '!Glaucoma agudo @ ojo rojo, halos', '!Hipertensión grave o preeclampsia @ presion alta, embaraz',
    'Migraña @ pulsatil, nausea, luz', 'Cefalea tensional @ opresiva, estres', 'Sinusitis aguda @ nariz, moco', 'Cefalea por abuso de analgésicos @ todos los dias', 'Cefalea en racimos @ ojo, lagrimeo',
    'Hematoma subdural @ golpe, caida, anticoagul, alcohol', 'Hipoglucemia', 'Cefalea pospunción', 'Neurocisticercosis @ convulsion, cerdo',
  ],
  mareo: ['Vértigo posicional paroxístico benigno @ al girar, acostarse', 'Neuritis vestibular @ continuo, dias', 'Enfermedad de Ménière @ zumbido, sordera', '!ACV de circulación posterior @ vision doble, hablar, caminar, subit', 'Hipotensión ortostática @ ponerse de pie', '!Arritmia @ palpitacion', 'Anemia @ palid', 'Hipoglucemia @ insulina', 'Efecto de fármacos @ antihipertens', 'Crisis de ansiedad', '!Sangrado oculto @ melena'],
  deficit: ['!ACV isquémico @ subit, boca torcida, hablar', '!ACV hemorrágico @ cefalea, hipertension', 'Accidente isquémico transitorio @ se recupero, minutos', '!Hipoglucemia @ insulina, glucosa', 'Parálisis posictal (de Todd) @ convulsion', 'Migraña con aura @ aura', '!Hematoma subdural @ caida, anticoagul', '!Guillain-Barré @ ambas piernas, ascendente', '!Compresión medular @ espalda, orina, cancer', 'Parálisis de Bell @ cara, solo la cara', '!Tumor cerebral @ progresiv', 'Neurocisticercosis @ cerdo', 'Esclerosis múltiple @ joven, vision'],
  confusion: ['!Sepsis @ fiebre', '!Hipoglucemia @ insulina, glucosa', '!Meningitis o encefalitis @ fiebre, rigidez', '!ACV @ deficit', '!Hipoxemia @ saturacion', 'Alteración de electrolitos (sodio, calcio)', '!Intoxicación o efecto de fármacos @ benzodiacepin, opioide, alcohol, pastillas', 'Encefalopatía hepática @ cirrosis', 'Uremia @ renal', '!Hematoma subdural @ caida, golpe', 'Abstinencia de alcohol @ alcohol, temblor', 'Retención urinaria o estreñimiento (adulto mayor)', 'Estado posictal @ convulsion', 'Encefalopatía de Wernicke @ alcohol, desnutric'],
  convulsion: ['!Estatus epiléptico @ no despierta, mas de 5', 'Epilepsia con mala adherencia @ epileps, dejo', '!Hipoglucemia @ insulina', 'Neurocisticercosis @ cerdo, rural', '!Meningitis o encefalitis @ fiebre', '!ACV o hemorragia @ deficit, cefalea', '!Eclampsia @ embaraz', 'Abstinencia de alcohol @ alcohol', 'Hiponatremia', '!Trauma craneal @ golpe', 'Síncope convulsivo @ de pie', 'Crisis no epiléptica psicógena', 'Intoxicación (organofosforados, tramadol)'],
  // Musculoesquelético
  articular: [
    '!Artritis séptica @ fiebre, protesis, caliente, inyecc', 'Gota @ dedo gordo, podagra, gota, acido urico, cerveza, diuretic, hidroclorotiazida', 'Seudogota (condrocalcinosis) @ rodilla, mayor de 60',
    'Artritis gonocócica @ pareja, secrecion, tenosinov', 'Artrosis @ mayor de 50, mecanico, al caminar', 'Artritis reumatoide @ manos, rigidez matutina, simetric', 'Artritis reactiva @ diarrea, ardor al orinar',
    'Fiebre chikungunya o dengue @ costa, amazon, fiebre', 'Lupus @ piel, fotosensib', 'Bursitis @ codo, rodilla', 'Celulitis cerca de la articulación @ piel roja', 'Fractura o lesión ligamentaria @ golpe, caida, trauma',
    'Fiebre reumática @ garganta, joven', 'Espondiloartritis @ espalda, joven', 'Hemartrosis @ anticoagul, hemofil',
  ],
  lumbar: ['Lumbalgia mecánica @ esfuerzo, cargar', 'Hernia discal @ pierna, ciatica', '!Síndrome de cauda equina @ orina, silla de montar', '!Aneurisma de aorta abdominal @ mayor de 60, pulsatil, hipotension', '!Metástasis vertebral @ cancer, noche, perdida de peso', '!Espondilodiscitis o absceso epidural @ fiebre, drogas', 'Pielonefritis @ fiebre, ardor al orinar', 'Cólico renal @ ingle', 'Fractura por osteoporosis @ mayor de 65, corticoides', 'Pancreatitis @ epigastr', 'Espondiloartritis @ joven, rigidez matutina', 'Tuberculosis vertebral (mal de Pott) @ tb'],
  extremidad: ['!Isquemia arterial aguda @ fria, palida, sin pulso, fibrilacion', '!Trombosis venosa profunda @ hinchad, pantorrilla, una sola', '!Síndrome compartimental @ trauma, yeso, desproporcion', '!Fascitis necrosante @ dolor desproporcion, fiebre, crepit', 'Celulitis @ rojo, calor', '!Pie diabético infectado @ diabet, herida', 'Fractura @ golpe, caida', 'Desgarro muscular @ esfuerzo', '!Rabdomiólisis @ orina oscura', 'Ciática @ espalda', 'Insuficiencia venosa', '!Síndrome coronario agudo (dolor de brazo) @ izquierdo, esfuerzo, sudor'],
  cuello: ['Contractura muscular', '!Meningitis @ fiebre, rigidez', '!Hemorragia subaracnoidea @ subit, cefalea', '!Lesión cervical por trauma @ golpe, caida, accidente', '!Disección de arteria cervical @ trauma, cefalea, deficit', '!Síndrome coronario agudo @ mandibula, esfuerzo', 'Hernia discal cervical @ brazo', '!Absceso profundo de cuello @ garganta, fiebre, trismus', 'Tiroiditis @ tiroides', 'Ganglio inflamado'],
  // Cabeza y cuello
  garganta: ['Faringitis viral @ tos, moco', 'Faringitis estreptocócica @ placas, fiebre, sin tos', '!Absceso periamigdalino @ trismus, voz, un lado', '!Epiglotitis @ babeo, estridor', 'Mononucleosis @ ganglio, cansancio', '!Absceso retrofaríngeo o de piso de boca (Ludwig) @ muela, cuello hinchado', 'Candidiasis oral @ inmunosup, corticoide inhalado', 'Reflujo gastroesofágico @ acidez', 'Infección de transmisión sexual (gonococo) @ oral', '!Difteria @ membrana, no vacunado', '!Síndrome coronario agudo (dolor referido) @ esfuerzo'],
  oido: ['Otitis media aguda @ fiebre, gripe', 'Otitis externa @ piscina, agua, rascar', 'Tapón de cerumen @ sordera', '!Mastoiditis @ detras de la oreja', '!Otitis externa maligna @ diabet, adulto mayor', 'Herpes zóster ótico (Ramsay Hunt) @ vesicula, cara', 'Dolor referido (dental, articulación temporomandibular) @ muela, mandibula', 'Cuerpo extraño @ insecto', '!Sordera súbita @ subit', 'Perforación timpánica @ golpe, explosion'],
  ojo: ['Conjuntivitis @ lagana, secrecion, picazon', '!Glaucoma agudo de ángulo cerrado @ halos, vomito, dolor intenso', '!Queratitis o úlcera corneal @ lentes de contacto', '!Uveítis @ fotofobia', '!Desprendimiento de retina @ cortina, destellos, moscas', '!Oclusión de arteria de la retina @ subit, indolora', '!Neuritis óptica @ dolor al mover', '!Trauma o quemadura química @ golpe, quimico, cal', '!Celulitis orbitaria @ fiebre, parpado hinchado', 'Hemorragia subconjuntival @ tos, esfuerzo', 'Cuerpo extraño @ basura, esmeril', '!ACV (visión doble) @ vision doble, deficit', 'Retinopatía diabética o hipertensiva @ diabet, presion alta'],
  epistaxis: ['Epistaxis anterior por mucosa seca o rascado @ altura, seco', '!Epistaxis posterior @ ambas, garganta, mayor', 'Hipertensión arterial @ presion alta', 'Anticoagulación excesiva @ warfarina, aspirina', '!Dengue o leptospirosis @ fiebre, costa', '!Trastorno de la coagulación o plaquetas bajas @ moreton, petequia', 'Trauma nasal @ golpe', 'Tumor nasal @ un lado, obstruc', 'Enfermedad de Rendu-Osler'],
  // Urgencias
  alergia: ['!Anafilaxia @ respirar, garganta, hipotension, vomito', '!Angioedema por IECA @ enalapril, captopril, lengua', 'Urticaria aguda @ ronchas', 'Reacción a fármacos @ antibiotico, penicilina, aine, metamizol', 'Alergia alimentaria @ mariscos, mani', 'Picadura de abeja o avispa @ abeja, avispa', '!Síndrome de Stevens-Johnson @ ampollas, boca, ojos', 'Dermatitis de contacto'],
  intoxicacion: ['!Intento suicida @ intencional, voluntari', '!Organofosforados o carbamatos @ plaguicida, fumig, saliva, pupilas', '!Paracetamol (tóxico aunque se vea bien) @ paracetamol, acetaminofen', '!Benzodiacepinas u opioides @ diazepam, clonazepam, tramadol, morfina', '!Monóxido de carbono @ calefon, brasero, cefalea', '!Metanol (alcohol adulterado) @ trago, puntas, vision', 'Intoxicación alcohólica @ alcohol, trago', '!Raticidas (anticoagulantes) @ raticida, sangrado', 'Antidepresivos tricíclicos @ amitriptilina', '!Cáusticos @ cloro, acido, soda', 'Drogas estimulantes (cocaína) @ cocaina'],
  trauma: ['!Traumatismo craneoencefálico @ cabeza, conciencia, vomito', '!Hematoma subdural o epidural @ anticoagul, adulto mayor', '!Lesión de columna cervical @ cuello', '!Neumotórax o hemotórax @ torax, costilla, disnea', '!Lesión de bazo o hígado @ abdomen, hipotension', '!Fractura de cadera @ adulto mayor, cadera', 'Fracturas @ deformidad', 'Esguince', 'Contusión', '!Síncope o arritmia como causa de la caída @ desmay', '!Violencia intrafamiliar o maltrato @ golpes repetidos, no concuerda'],
  quemadura: ['Quemadura superficial', 'Quemadura de espesor parcial (ampollas) @ ampolla', '!Quemadura profunda @ blanca, sin dolor', '!Inhalación de humo @ hollin, ronquera, encerrado', '!Intoxicación por monóxido de carbono o cianuro @ incendio', '!Quemadura eléctrica (daño interno y arritmias) @ electric, cable', '!Quemadura química @ quimico, cal, acido', '!Maltrato (en niños o adultos mayores) @ patron'],
  mordedura: ['!Mordedura de serpiente (Bothrops: equis) @ serpiente, culebra, equis, amazon, costa', '!Riesgo de rabia @ murcielago, perro callejero, gato', 'Mordedura de perro o gato infectada @ perro, gato', '!Mordedura humana @ punetazo, diente', 'Picadura de alacrán @ alacran, escorpion', 'Picadura de araña (Loxosceles) @ arana, necrosis', '!Anafilaxia por picadura @ abeja, avispa, hinchazon', 'Tétanos @ herida sucia, no vacunado'],
  glucosaBaja: ['!Hipoglucemia por insulina @ insulina', '!Hipoglucemia por sulfonilureas (prolongada) @ glibenclamida, glimepirida', '!Sepsis @ fiebre', 'Ayuno o alcohol @ alcohol, no comio', 'Insuficiencia renal o hepática', 'Insuficiencia suprarrenal', 'Insulinoma'],
  // Endocrino
  poliuria: ['Diabetes descompensada', '!Cetoacidosis diabética @ vomito, dolor abdominal, respira', '!Estado hiperosmolar @ confus, adulto mayor', 'Diabetes insípida', 'Hipercalcemia @ cancer', 'Diuréticos o litio @ furosemida, litio', 'Polidipsia primaria', 'Infección urinaria @ ardor'],
  tiroides: ['Hipertiroidismo (Graves) @ ojos saltones, perdida de peso, temblor', '!Tormenta tiroidea @ fiebre, agitacion, taquicardia', 'Hipotiroidismo @ frio, aumento de peso', '!Coma mixedematoso @ somnolien, hipotermia', 'Bocio por déficit de yodo @ sierra', 'Tiroiditis @ dolor de cuello', '!Cáncer de tiroides @ nodulo duro, ronquera'],
  // Hematológico
  sangrados: ['Efecto de anticoagulantes o antiagregantes @ warfarina, aspirina, rivaroxaban', '!Plaquetas bajas (dengue, leucemia, PTI) @ petequia, fiebre', '!Leucemia aguda @ palid, fiebre, ganglio', '!Coagulación intravascular diseminada @ sepsis', 'Hepatopatía @ cirrosis', '!Mordedura de serpiente @ serpiente', 'Enfermedad de von Willebrand @ menstruacion abundante, familia', 'Hemofilia @ familia, articulacion', 'Púrpura senil o por corticoides', 'Maltrato @ golpe'],
  palidez: ['Anemia ferropénica @ menstruacion abundante, dieta', '!Sangrado digestivo oculto @ melena, aine', 'Anemia de enfermedad crónica', 'Anemia por déficit de B12 o folato @ hormigueo, alcohol, vegetarian', 'Hemólisis @ ictericia, orina oscura', '!Leucemia o aplasia medular @ petequia, fiebre', 'Enfermedad renal crónica', 'Hipotiroidismo', 'Parasitosis (anquilostoma) @ descalzo, rural', 'Talasemia @ familia'],
  // Piel
  piel: ['Urticaria @ ronchas', '!Anafilaxia @ labios, respirar', '!Síndrome de Stevens-Johnson o necrólisis epidérmica @ ampollas, boca, ojos, farmaco', '!Meningococcemia @ petequia, fiebre', '!Dengue @ fiebre, costa', 'Celulitis o erisipela @ rojo, calor, fiebre', '!Fascitis necrosante @ dolor desproporcion', 'Herpes zóster @ un lado, vesicula, banda', 'Varicela @ vesicula, fiebre', 'Escabiosis (sarna) @ noche, familia', 'Dermatitis de contacto', 'Reacción a fármacos @ antibiotico', 'Psoriasis', 'Sífilis secundaria @ palmas, plantas', 'Leishmaniasis @ ulcera, amazon'],
  // Ginecológico
  ginecologico: ['!Embarazo ectópico @ atraso, embaraz, prueba positiva', '!Aborto en curso @ embaraz', '!Placenta previa o desprendimiento @ tercer trimestre', '!Torsión de ovario @ subit, vomito', '!Enfermedad inflamatoria pélvica o absceso @ fiebre, flujo', 'Quiste de ovario roto @ subit', 'Sangrado uterino anormal (miomas, pólipos) @ abundante', 'Dismenorrea o endometriosis @ menstruacion', '!Cáncer de cuello uterino o endometrio @ postmenopaus, relaciones', 'Trastorno de coagulación @ moreton'],
  // Más urgencias
  shock: ['!Shock séptico @ fiebre, infeccion', '!Shock hipovolémico por sangrado @ sangr, melena, trauma', '!Deshidratación grave @ vomito, diarrea', '!Shock cardiogénico (infarto) @ dolor de pecho', '!Anafilaxia @ alergia, ronchas', '!Tromboembolismo pulmonar masivo @ disnea subita', '!Taponamiento cardiaco o neumotórax a tensión @ trauma', '!Embarazo ectópico roto @ atraso', 'Insuficiencia suprarrenal @ corticoide', 'Efecto de fármacos antihipertensivos', 'Shock neurogénico @ columna', 'Síncope vasovagal'],
  paro: ['!Hipoxia', '!Hipovolemia', '!Hipo o hiperpotasemia @ renal, dialisis', '!Hipotermia', '!Acidosis', '!Neumotórax a tensión', '!Taponamiento cardiaco', '!Tóxicos @ intoxic, sobredosis', '!Trombosis coronaria (infarto) @ dolor de pecho', '!Trombosis pulmonar (embolia) @ pierna, cirugia'],
  ambiental: ['!Hipotermia @ frio, paramo, agua', '!Golpe de calor @ calor, ejercicio', 'Agotamiento por calor', '!Lesión eléctrica con arritmia @ electr', '!Ahogamiento (lesión pulmonar tardía) @ agua', '!Rabdomiólisis @ orina oscura', '!Trauma asociado @ caida', 'Mal de altura @ altura, cotopaxi, chimborazo'],
  violencia: ['!Violencia sexual (profilaxis en menos de 72 h) @ violacion, abuso sexual', '!Violencia intrafamiliar con riesgo vital @ amenaza, arma', '!Maltrato infantil @ nino, menor', '!Maltrato al adulto mayor @ adulto mayor', '!Riesgo suicida @ suicid', 'Lesiones ocultas (abdomen, cabeza) @ golpe', 'Trastorno de estrés agudo o postraumático', 'Embarazo no deseado o ITS tras la agresión'],
  sustancias: ['!Intoxicación alcohólica grave @ no responde, vomito', '!Abstinencia de alcohol o delirium tremens @ temblor, alucin, sudor', '!Hipoglucemia en alcohólico @ glucosa', '!Hematoma subdural en alcohólico @ caida, golpe', '!Encefalopatía de Wernicke @ confus, ataxia', '!Intoxicación por cocaína (dolor torácico, arritmia) @ cocaina, pecho', '!Metanol (alcohol adulterado) @ puntas, trago, vision', 'Pancreatitis o gastritis alcohólica @ epigastr', 'Trastorno por consumo de sustancias', 'Cetoacidosis alcohólica @ vomito'],
  // Obstetricia
  embarazo: ['!Preeclampsia o eclampsia @ presion, cefalea, vision, epigastr, convulsion', '!Desprendimiento de placenta @ dolor, sangrado, duro', '!Placenta previa @ sangrado indoloro', '!Amenaza de parto pretérmino @ contracciones', '!Rotura prematura de membranas @ liquido', '!Embarazo ectópico @ primer trimestre, dolor', '!Aborto en curso o incompleto @ sangrado, primer trimestre', '!Hemorragia posparto @ posparto, sangrado', '!Infección puerperal o endometritis @ posparto, fiebre', '!Tromboembolismo en el embarazo @ pierna, disnea', '!Óbito fetal @ no siente', 'Infección urinaria o pielonefritis en el embarazo @ ardor, fiebre', 'Hiperémesis gravídica @ vomito', 'Diabetes gestacional @ glucosa', 'Síndrome HELLP @ epigastr, plaquetas', 'Apendicitis en el embarazo @ fosa iliaca', 'Colestasis del embarazo @ picazon'],
  // Genital, mama y región anal
  ets: ['Gonorrea @ secrecion, pus', 'Clamidia', 'Sífilis @ llaga indolora, chancro', 'Herpes genital @ vesicula, dolorosa', 'Chancroide @ llaga dolorosa', 'Vaginosis bacteriana @ olor, pescado', 'Candidiasis vaginal @ picazon, grumos', 'Tricomoniasis @ espuma, verde', 'Virus del papiloma (verrugas) @ verruga', '!Enfermedad inflamatoria pélvica @ fiebre, dolor pelvico', '!Infección por VIH (prueba) @ pareja', '!Abuso sexual @ menor, forzad'],
  mama: ['Mastopatía fibroquística @ ciclica, menstruacion', 'Fibroadenoma @ joven, movil', '!Cáncer de mama @ duro, fijo, piel de naranja, retraccion, familia', 'Mastitis @ lactancia, roja', '!Absceso mamario @ fiebre, fluctua', 'Quiste mamario', 'Papiloma intraductal @ secrecion con sangre', 'Galactorrea por prolactina o fármacos @ leche, metoclopramida', 'Ginecomastia (hombre) @ hombre', 'Dolor de pared torácica'],
  anal: ['Hemorroides @ sangre roja, bulto', 'Fisura anal @ dolor al defecar, cortante', '!Absceso perianal @ fiebre, hinchado', 'Fístula anal @ secrecion', 'Trombosis hemorroidal @ bulto morado', '!Cáncer colorrectal o anal @ mayor de 50, perdida de peso, cambio', 'Prurito anal por oxiuros o higiene @ nino, noche', 'Condilomas @ verruga', 'Proctitis por ITS @ relaciones anales', 'Prolapso rectal'],
  hernia: ['Hernia inguinal reductible', '!Hernia encarcelada o estrangulada @ no se mete, dolor, roja, vomito', 'Hernia umbilical @ ombligo', 'Eventración (hernia en cicatriz) @ cicatriz, operado', 'Hernia femoral (más riesgo de estrangularse) @ mujer', 'Ganglio inguinal @ ganglio', 'Hidrocele o varicocele @ escroto', '!Aneurisma femoral @ pulsatil', 'Lipoma'],
  // Más síntomas comunes
  nariz: ['Resfriado común', 'Influenza @ fiebre alta, dolor de cuerpo', 'COVID-19 @ contacto, olfato', 'Rinitis alérgica @ estornud, picazon, polvo', 'Sinusitis aguda viral', 'Sinusitis bacteriana @ mas de 10 dias, empeora', '!Celulitis orbitaria @ ojo hinchado', '!Neumonía como complicación @ disnea, fiebre', 'Cuerpo extraño nasal @ un lado, nino', 'Rinitis por abuso de descongestionantes @ oximetazolina'],
  boca: ['Caries o pulpitis', '!Absceso dental @ hinchazon, fiebre', '!Angina de Ludwig @ cuello, debajo de la lengua, trismus', 'Aftas', 'Gingivitis', 'Candidiasis oral @ placas blancas, inhalador', 'Herpes labial @ vesicula', '!Cáncer oral @ ulcera, mas de 3 semanas, fumador', 'Boca seca por fármacos o Sjögren', '!Leucemia (encías hinchadas que sangran) @ sangran, palid'],
  orinar: ['Hiperplasia prostática @ hombre, chorro debil', '!Retención urinaria aguda @ globo, no puede', '!Compresión medular o cauda equina @ espalda, piernas, silla de montar', 'Fármacos (anticolinérgicos, opioides, antigripales) @ tramadol, antigripal', 'Infección urinaria @ ardor', 'Incontinencia de esfuerzo @ toser, reir, mujer', 'Vejiga hiperactiva @ urgencia', 'Estreñimiento o fecaloma @ estren, adulto mayor', '!Cáncer de próstata o vejiga @ sangre', 'Diabetes (vejiga neurogénica) @ diabet', 'Estrechez uretral'],
  muscular: ['Dolor muscular por esfuerzo', 'Contractura o desgarro @ esfuerzo', 'Mialgia viral (influenza, dengue) @ fiebre', '!Rabdomiólisis @ orina oscura, ejercicio, estatina', '!Guillain-Barré @ debilidad que sube, ambas piernas', '!Hipopotasemia o hiperpotasemia @ diuretico, renal, vomito', 'Miopatía por estatinas @ atorvastatina, simvastatina', 'Polimialgia reumática @ mayor de 50, hombros', 'Hipotiroidismo @ frio', 'Polimiositis @ levantarse', 'Fibromialgia', '!Miastenia gravis @ ptosis, vision doble, tragar', 'Lesión del manguito rotador @ hombro', 'Capsulitis (hombro congelado) @ hombro, diabet', '!Síndrome coronario agudo (dolor de hombro izquierdo) @ esfuerzo, sudor'],
  temblor: ['Temblor esencial @ familia, al moverse', 'Enfermedad de Parkinson @ reposo, lentitud', 'Hipertiroidismo @ palpitacion, calor', '!Abstinencia de alcohol @ alcohol', '!Hipoglucemia @ insulina', 'Fármacos (salbutamol, valproato, litio) @ salbutamol, litio', 'Ansiedad @ nervios', '!Síndrome serotoninérgico o neuroléptico maligno @ fiebre, rigidez, antidepresivo, haloperidol', 'Encefalopatía hepática (asterixis) @ cirrosis', '!ACV @ un lado, subit'],
  memoria: ['Demencia tipo Alzheimer @ progresiv, mayor de 65', 'Demencia vascular @ hipertension, acv', '!Delirium por causa médica @ subit, fiebre, infeccion', '!Hematoma subdural @ caida, anticoagul', 'Depresión (seudodemencia) @ triste', 'Hipotiroidismo', 'Déficit de vitamina B12 @ hormigueo, vegetarian', 'Efecto de fármacos (benzodiacepinas, anticolinérgicos) @ diazepam, clonazepam', 'Hidrocefalia normotensiva @ camina, orina', 'Neurosífilis o VIH', '!Tumor cerebral @ cefalea'],
  posoperatorio: ['!Infección de la herida @ roja, pus, fiebre', '!Dehiscencia de la herida @ se abrio', '!Tromboembolismo pulmonar o TVP @ pierna, disnea', '!Fuga de anastomosis o peritonitis @ abdomen, fiebre, dolor', '!Sangrado posoperatorio @ hipotension, taquicardia', 'Neumonía o atelectasia @ fiebre, tos', 'Íleo posoperatorio @ sin gases, distens', 'Infección urinaria por sonda @ sonda', 'Fiebre por fármacos o flebitis @ via', '!Colitis por Clostridioides difficile @ diarrea, antibiotico', 'Retención urinaria @ no orina', '!Infarto perioperatorio @ dolor de pecho'],
  // Pediatría
  pediatrico: ['!Sepsis neonatal (menor de 3 meses con fiebre) @ recien nacido, lactante, fiebre', '!Meningitis @ fontanela, rigidez, irritable', '!Deshidratación por gastroenteritis @ diarrea, vomito, panal', '!Bronquiolitis o neumonía @ respira rapido, tiraje', 'Otitis media aguda @ oido', 'Faringoamigdalitis @ garganta', 'Infección urinaria @ fiebre sin foco', 'Infección respiratoria viral @ moco, tos', '!Invaginación intestinal @ llanto, colico, heces con sangre', '!Convulsión febril o estatus @ convulsion', '!Maltrato infantil @ lesiones, no concuerda', 'Cólico del lactante @ llanto, tardes', 'Reflujo del lactante @ vomito', '!Ictericia neonatal grave @ amarillo, recien nacido', 'Desnutrición o anemia @ peso, palid', '!Ingestión de cuerpo extraño o tóxico @ trago, pila, moneda'],
  // Mental
  animo: ['!Riesgo suicida @ suicid, morir, plan', 'Depresión mayor @ triste', 'Trastorno de ansiedad o pánico @ panico, nervios', 'Trastorno bipolar @ euforia, no duerme', '!Psicosis @ voces, persecu', 'Consumo de alcohol o drogas @ alcohol, droga', 'Hipotiroidismo o hipertiroidismo', '!Delirium (causa médica) @ confus, fiebre, adulto mayor', 'Duelo'],
}

export interface Considerar {
  nombre: string
  grave: boolean
  pistas: string[]
}

const parse = (x: string): Considerar => {
  const [cab, p] = x.split(' @ ')
  const grave = cab.startsWith('!')
  return { nombre: (grave ? cab.slice(1) : cab).trim(), grave, pistas: p ? p.split(',').map((s) => normalizar(s.trim())).filter(Boolean) : [] }
}

export const CONSIDERAR: Record<string, Considerar[]> = Object.fromEntries(
  Object.entries(L).map(([k, v]) => [k, v.map(parse)]),
)

export interface Sugerido extends Considerar {
  /** Pistas encontradas en lo escrito, con el texto tal cual se buscó. */
  porque: string[]
  sintomas: string[]
}

/**
 * Diagnósticos a considerar para los síntomas abiertos, sin repetir. Orden: los que tienen
 * pistas en lo escrito, luego los graves, luego el resto (orden de la lista).
 * `texto`: lo escrito (motivo, enfermedad actual, antecedentes); lo negado no cuenta.
 */
export function aConsiderar(sintomas: string[], texto: string, excluir: Set<string> = new Set()): Sugerido[] {
  const t = ' ' + quitarNegado(texto).replace(/[^a-zñ0-9]+/g, ' ') + ' '
  const porNombre = new Map<string, Sugerido>()
  sintomas.forEach((s) => (CONSIDERAR[s] ?? []).forEach((c) => {
    const clave = c.nombre.toLowerCase()
    if (excluir.has(clave) || [...excluir].some((e) => e.startsWith(clave + ' ') || clave.startsWith(e + ' '))) return
    const prev = porNombre.get(clave)
    const porque = c.pistas.filter((p) => t.includes(p.length <= 3 ? ` ${p} ` : p))
    if (prev) {
      prev.sintomas.push(s)
      prev.porque = [...new Set([...prev.porque, ...porque])]
      prev.grave ||= c.grave
    } else porNombre.set(clave, { ...c, porque, sintomas: [s] })
  }))
  const lista = [...porNombre.values()]
  const rango = (x: Sugerido) => (x.porque.length ? 0 : x.grave ? 1 : 2)
  return lista.map((x, i) => ({ x, i })).sort((a, b) => rango(a.x) - rango(b.x) || b.x.porque.length - a.x.porque.length || a.i - b.i).map(({ x }) => x)
}

/** Lo escrito que sirve de pista: motivo, enfermedad actual, antecedentes, hábitos, edad y sexo. */
export function textoParaConsiderar(h: Historia): string {
  const p = h.personales ?? {}
  const a = h.antecedentes ?? {}
  const edad = Number((h.filiacion?.edad ?? '').replace(',', '.'))
  const sexo = h.filiacion?.sexo
  const habito = (v: string | undefined, palabra: string) => (v && !/^\s*(niega|no)\b/i.test(v) ? `${palabra} ${v}` : '')
  return [
    textoClinico(h),
    p.patologicos, p.farmacologicos, p.quirurgicos, p.hospitalizaciones,
    habito(p.alcohol, 'alcohol'), habito(p.tabaco, 'fumador'),
    ...PATOLOGICOS.filter((x) => a[`p.${x.id}`] === 'si').map((x) => `${x.nombre} ${a[`p.${x.id}.det`] ?? ''}`),
    edad >= 50 ? 'mayor de 50' : '', edad >= 60 ? 'mayor de 60' : '', edad >= 65 ? 'mayor de 65 adulto mayor' : '',
    edad > 0 && edad < 40 ? 'joven' : '', sexo === 'Hombre' ? 'hombre' : sexo === 'Mujer' ? 'mujer' : '',
  ].filter(Boolean).join('. ')
}

/** Atajo para la historia: lo que conviene considerar ahora. */
export function considerarEnHistoria(h: Historia, sintomas: string[], excluir?: Set<string>): Sugerido[] {
  return aConsiderar(sintomas, textoParaConsiderar(h), excluir)
}

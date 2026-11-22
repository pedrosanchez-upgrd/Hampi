// Otros diagnósticos a considerar según el síntoma (diagnóstico diferencial clásico de
// medicina interna). Lista ORIENTATIVA, sin puntaje ni fuente por regla: sirve para no
// olvidar opciones. Pendiente de revisión médica.

export const CONSIDERAR: Record<string, string[]> = {
  toracico: ['Neumotórax', 'Reflujo gastroesofágico', 'Dolor osteomuscular (costocondritis)', 'Espasmo esofágico', 'Crisis de ansiedad', 'Herpes zóster'],
  disnea: ['Crisis asmática', 'Exacerbación de EPOC', 'Anemia', 'Derrame pleural', 'Neumotórax', 'Crisis de ansiedad'],
  fiebre: ['Pielonefritis', 'Dengue sin signos de alarma', 'Malaria', 'Leptospirosis', 'Tuberculosis', 'Infección de piel y partes blandas'],
  abdominal: ['Gastroenteritis aguda', 'Pancreatitis aguda', 'Obstrucción intestinal', 'Cólico renal', 'Enfermedad inflamatoria pélvica', 'Isquemia mesentérica'],
  cefalea: ['Cefalea tensional', 'Sinusitis aguda', 'Crisis hipertensiva', 'Trombosis venosa cerebral'],
  sincope: ['Síncope vasovagal', 'Hipotensión ortostática', 'Hipoglucemia', 'Crisis convulsiva'],
  edema: ['Insuficiencia venosa crónica', 'Síndrome nefrótico', 'Cirrosis', 'Celulitis', 'Edema por fármacos (calcioantagonistas)'],
  tos: ['Infección respiratoria alta', 'Bronquitis aguda', 'Tuberculosis pulmonar', 'Goteo posnasal', 'Tos por IECA'],
  urinario: ['Pielonefritis', 'Uretritis', 'Vaginitis', 'Prostatitis'],
  vomito: ['Gastroenteritis aguda', 'Embarazo', 'Obstrucción intestinal', 'Cetoacidosis diabética', 'Efecto de fármacos'],
  diarrea: ['Gastroenteritis viral', 'Disentería bacteriana', 'Parasitosis intestinal', 'Colitis por Clostridioides difficile'],
  mareo: ['Vértigo posicional paroxístico benigno', 'Neuritis vestibular', 'Hipotensión ortostática', 'ACV de circulación posterior'],
  deficit: ['Accidente isquémico transitorio', 'Hipoglucemia', 'Parálisis posictal (de Todd)', 'Migraña con aura'],
  confusion: ['Sepsis', 'Hipoglucemia', 'Alteración de electrolitos', 'Intoxicación o efecto de fármacos', 'Encefalopatía hepática'],
  sangradoDigestivo: ['Úlcera péptica', 'Várices esofágicas', 'Síndrome de Mallory-Weiss', 'Hemorroides', 'Enfermedad diverticular'],
  ictericia: ['Hepatitis viral aguda', 'Coledocolitiasis', 'Hepatitis por fármacos o alcohol', 'Hemólisis'],
  palidez: ['Anemia ferropénica', 'Sangrado digestivo oculto', 'Anemia de enfermedad crónica'],
  poliuria: ['Diabetes descompensada', 'Diabetes insípida', 'Hipercalcemia'],
  articular: ['Gota', 'Artritis séptica', 'Artritis reumatoide', 'Artrosis'],
  lumbar: ['Lumbalgia mecánica', 'Hernia discal', 'Pielonefritis', 'Aneurisma de aorta abdominal', 'Metástasis vertebral'],
  palpitaciones: ['Taquicardia sinusal', 'Fibrilación auricular', 'Hipertiroidismo', 'Crisis de ansiedad'],
  hemoptisis: ['Tuberculosis pulmonar', 'Bronquiectasias', 'Cáncer de pulmón', 'Bronquitis aguda'],
}

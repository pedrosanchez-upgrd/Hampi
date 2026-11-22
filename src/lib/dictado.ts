// Dictado por voz con el reconocimiento del propio navegador (Safari en iPad/iPhone, Chrome en Android).
// Hampi no graba ni guarda audio. Aviso: el navegador puede enviar la voz a Apple o Google para
// convertirla en texto; en la Fase 1 solo se usan casos ficticios.

import { useEffect, useRef, useState } from 'react'

interface Reconocedor {
  lang: string; continuous: boolean; interimResults: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> ; resultIndex: number }) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
  start(): void; stop(): void
}
type Constructor = new () => Reconocedor

const constructor = (): Constructor | null => {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: Constructor; webkitSpeechRecognition?: Constructor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
export const dictadoDisponible = () => constructor() !== null

// «Coma» como palabra médica no es puntuación: «en coma», «estado de coma», «coma diabético».
const ANTES_DE_COMA_MEDICO = new Set(['en', 'de', 'el', 'un', 'al', 'del', 'su'])
const DESPUES_DE_COMA_MEDICO = /^(diabetico|hiperosmolar|etilico|mixedematoso|hepatico|barbiturico|vigil|inducido|profundo|metabolico|uremico)/
const sinTilde = (w: string) => w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

function comas(t: string): string {
  const w = t.split(/(\s+)/)
  for (let i = 0; i < w.length; i++) {
    if (sinTilde(w[i]) !== 'coma') continue
    const antes = sinTilde(w[i - 2] ?? ''), despues = sinTilde(w[i + 2] ?? '')
    if (ANTES_DE_COMA_MEDICO.has(antes) || DESPUES_DE_COMA_MEDICO.test(despues)) continue
    w[i] = ','
    if (i >= 1 && /^\s+$/.test(w[i - 1])) w[i - 1] = ''
  }
  return w.join('')
}

/** Puntuación dicha en voz alta. «Punto» solo no se cambia (puede ser «punto de McBurney»). */
export function puntuarDictado(t: string): string {
  return comas(t
    .replace(/\s*\b(punto y aparte|nueva l[ií]nea)\b\s*/gi, '.\n')
    .replace(/\s*\bpunto y seguido\b\s*/gi, '. ')
    .replace(/\s*\bdos puntos\b\s*/gi, ': ')
    .replace(/\s*\bpunto y coma\b\s*/gi, '; '))
    .replace(/[ \t]+\n/g, '\n').replace(/[ \t]{2,}/g, ' ')
    .replace(/(^|[.\n]\s*)([a-záéíóúñ])/g, (_, a: string, b: string) => a + b.toUpperCase())
    .trim()
}

/** Une lo dictado al texto que ya había en el campo. */
export function agregarDictado(actual: string, dicho: string): string {
  const d = puntuarDictado(dicho)
  if (!d) return actual
  const a = actual.replace(/\s+$/, '')
  if (!a) return d
  return /[.\n:]$/.test(a) ? `${a}${a.endsWith('\n') ? '' : ' '}${d}` : `${a} ${d.charAt(0).toLowerCase()}${d.slice(1)}`
}

export function useDictado(onTexto: (t: string) => void) {
  const [escuchando, setEscuchando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rec = useRef<Reconocedor | null>(null)
  useEffect(() => () => rec.current?.stop(), [])
  const alternar = () => {
    if (escuchando) { rec.current?.stop(); return }
    const C = constructor()
    if (!C) return
    const r = new C()
    r.lang = 'es-EC'; r.continuous = true; r.interimResults = false
    r.onresult = (e) => {
      let t = ''
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript + ' '
      if (t.trim()) onTexto(t)
    }
    r.onerror = (e) => setError(e.error === 'not-allowed' ? 'Permita el uso del micrófono para dictar.' : e.error === 'no-speech' ? 'No se escuchó nada. Intente de nuevo.' : 'El dictado se detuvo. Intente de nuevo.')
    r.onend = () => setEscuchando(false)
    rec.current = r
    setError(null); setEscuchando(true)
    try { r.start() } catch { setEscuchando(false) }
  }
  return { escuchando, error, alternar, disponible: dictadoDisponible() }
}

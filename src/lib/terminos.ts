// Opciones de semiología mientras se escribe: si la última palabra empieza un término, se ofrece
// completarlo; si no, se ofrecen los que aún no están escritos.

const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** El trozo que se está escribiendo: lo que va después de la última coma, «y» o punto. */
function trozoActual(v: string): { antes: string; trozo: string } {
  const m = v.match(/^(.*?(?:[,;.]\s*|\sy\s))?([^,;.]*)$/s)
  return { antes: m?.[1] ?? '', trozo: (m?.[2] ?? '').trimStart() }
}

/** Términos a ofrecer (máximo `max`), primero los que completan lo que se está escribiendo. */
export function terminosPara(v: string, terminos: string[], max = 6): { termino: string; completa: boolean }[] {
  const ya = norm(v)
  const libres = terminos.filter((t) => !ya.includes(norm(t)))
  const { trozo } = trozoActual(v)
  const t = norm(trozo.trim())
  if (t.length >= 2) {
    const completan = libres.filter((x) => norm(x).startsWith(t) || norm(x).split(' ').some((w) => w.startsWith(t)))
    if (completan.length) return completan.slice(0, max).map((termino) => ({ termino, completa: true }))
  }
  return libres.slice(0, max).map((termino) => ({ termino, completa: false }))
}

/** Escribe el término: completa el trozo actual o lo agrega al final con coma. */
export function usarTermino(v: string, termino: string, completa: boolean): string {
  const base = v.replace(/\s+$/, '')
  if (!base) return termino
  if (completa) {
    const { antes } = trozoActual(v)
    return antes ? `${antes.replace(/\s*$/, ' ').replace(/^\s+/, '')}${termino.charAt(0).toLowerCase()}${termino.slice(1)}`.replace(/ ,/g, ',') : termino
  }
  return `${base.replace(/[,;]$/, '')}, ${termino.charAt(0).toLowerCase()}${termino.slice(1)}`
}

import { useEffect, useState } from 'react'

export type Tema = 'sistema' | 'claro' | 'oscuro'
const CLAVE = 'hampi.tema'

function leer(): Tema {
  try { const v = localStorage.getItem(CLAVE); return v === 'claro' || v === 'oscuro' ? v : 'sistema' } catch { return 'sistema' }
}

/** Tema de la app: sigue al sistema o se fija en claro u oscuro (guardias nocturnas). */
export function useTema(): [Tema, () => void] {
  const [tema, setTema] = useState<Tema>(leer)
  useEffect(() => {
    const raiz = document.documentElement
    if (tema === 'sistema') raiz.removeAttribute('data-theme')
    else raiz.setAttribute('data-theme', tema === 'oscuro' ? 'dark' : 'light')
    try { localStorage.setItem(CLAVE, tema) } catch { /* sin almacenamiento */ }
  }, [tema])
  const siguiente = () => setTema((t) => (t === 'sistema' ? 'claro' : t === 'claro' ? 'oscuro' : 'sistema'))
  return [tema, siguiente]
}

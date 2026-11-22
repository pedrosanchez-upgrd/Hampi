// Íconos propios en línea (trazo de 1,75 px, 24×24). Sin dependencias externas.
const RUTAS: Record<string, string> = {
  check: 'M5 12.5l4.2 4.2L19 7',
  alerta: 'M12 4l9 16H3L12 4zM12 10v4.5M12 17.5v.01',
  mas: 'M12 5v14M5 12h14',
  cerrar: 'M6 6l12 12M18 6L6 18',
  flecha: 'M5 12h14M13 6l6 6-6 6',
  atras: 'M19 12H5M11 6l-6 6 6 6',
  copiar: 'M9 9h10v10H9zM5 15V5h10',
  luna: 'M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z',
  sol: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6L4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 8a4 4 0 100 8 4 4 0 000-8z',
  sistema: 'M4 5h16v11H4zM9 20h6M12 16v4',
  lista: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  pulso: 'M3 12h4l2-5 4 10 2-5h6',
  libro: 'M5 4h10a4 4 0 014 4v12H9a4 4 0 01-4-4V4zM5 16a4 4 0 014-4h10',
  documento: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  papelera: 'M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V4h6v3',
  info: 'M12 8v.01M11 12h1v5h1M12 3a9 9 0 100 18 9 9 0 000-18z',
  enlace: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  persona: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
}

export function Icono({ nombre, className = 'h-5 w-5', titulo }: { nombre: keyof typeof RUTAS | string; className?: string; titulo?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden={titulo ? undefined : true} role={titulo ? 'img' : undefined}>
      {titulo && <title>{titulo}</title>}
      <path d={RUTAS[nombre] ?? ''} />
    </svg>
  )
}

/** Monograma de Hampi: hoja con un trazo de pulso. */
export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="var(--brand)" />
      <path d="M8 22c0-8 6-13 16-14-1 10-6 16-14 16" fill="none" stroke="var(--on-brand)" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 17h4l1.6-3.2 2.4 6 1.6-2.8H22" fill="none" stroke="var(--on-brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

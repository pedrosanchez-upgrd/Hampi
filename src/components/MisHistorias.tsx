import { useEffect, useState } from 'react'
import { borrarHistoria, listarHistorias, mensajeError, resumenHistoria, type HistoriaGuardada } from '../lib/nube'
import { Icono } from './Icono'

interface Props {
  abierto: boolean
  actualId: string | null
  onCerrar: () => void
  onAbrir: (h: HistoriaGuardada) => void
  onNueva: () => void
}

const fecha = (iso: string) =>
  new Date(iso).toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

/** Hoja lateral con las historias guardadas en la cuenta. */
export function MisHistorias({ abierto, actualId, onCerrar, onAbrir, onNueva }: Props) {
  const [lista, setLista] = useState<HistoriaGuardada[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [borrando, setBorrando] = useState<string | null>(null)

  const cargar = () => { setError(null); listarHistorias().then(setLista).catch((e) => setError(mensajeError(e))) }
  useEffect(() => { if (abierto) cargar() }, [abierto])
  useEffect(() => {
    if (!abierto) return
    const t = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar() }
    addEventListener('keydown', t)
    return () => removeEventListener('keydown', t)
  }, [abierto, onCerrar])
  if (!abierto) return null

  return (
    <div className="no-imprimir fixed inset-0 z-30 flex justify-end bg-ink/30 backdrop-blur-[2px]" onClick={onCerrar}>
      <aside role="dialog" aria-label="Mis historias" onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-md overflow-y-auto bg-bg p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-[calc(1rem+env(safe-area-inset-top,0px))] shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Mis historias</h2>
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-2" onClick={onCerrar} aria-label="Cerrar mis historias">
            <Icono nombre="cerrar" className="h-5 w-5" />
          </button>
        </div>
        <button onClick={onNueva} className="mb-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-on-brand hover:bg-brand-strong">
          <Icono nombre="mas" className="h-5 w-5" /> Nueva historia
        </button>
        {error && <p role="alert" className="rounded-xl bg-alarm-soft p-3 text-sm text-alarm">{error}</p>}
        {lista === null && !error && <p className="p-4 text-center text-sm text-ink-soft">Cargando…</p>}
        {lista?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-6 text-center">
            <Icono nombre="documento" className="mx-auto h-7 w-7 text-ink-faint" />
            <p className="mt-2 font-medium text-ink">Todavía no tienes historias guardadas</p>
            <p className="mt-1 text-sm text-ink-soft">Lo que escribas se guarda solo en tu cuenta mientras trabajas.</p>
          </div>
        )}
        <ul className="grid gap-2">
          {lista?.map((h) => (
            <li key={h.id} className={`rounded-2xl border p-3.5 ${h.id === actualId ? 'border-brand bg-brand-soft/50' : 'border-line bg-surface'}`}>
              <button className="w-full text-left" onClick={() => onAbrir(h)}>
                <p className="font-semibold text-ink">{resumenHistoria(h.contenido)}</p>
                <p className="cifra mt-0.5 text-xs text-ink-faint">{fecha(h.actualizada_en)}{h.id === actualId ? ' · abierta' : ''}</p>
              </button>
              <div className="mt-2 flex justify-end">
                {borrando === h.id ? (
                  <span className="flex items-center gap-2 text-sm">
                    <span className="text-ink-soft">¿Borrar?</span>
                    <button className="min-h-9 rounded-lg bg-alarm px-3 font-semibold text-on-alarm"
                      onClick={async () => { try { await borrarHistoria(h.id); setBorrando(null); cargar() } catch (e) { setError(mensajeError(e)) } }}>Sí, borrar</button>
                    <button className="min-h-9 rounded-lg px-3 text-ink-soft hover:bg-surface-2" onClick={() => setBorrando(null)}>Cancelar</button>
                  </span>
                ) : (
                  <button className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-sm text-ink-soft hover:bg-surface-2" onClick={() => setBorrando(h.id)}>
                    <Icono nombre="papelera" className="h-4 w-4" /> Borrar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { IconWifiOff } from './icons'

/**
 * Barra di stato fissa in cima allo schermo: avvisa quando manca la
 * connessione (le modifiche fatte offline restano in coda e vengono
 * sincronizzate automaticamente da Firestore alla riconnessione) e conferma
 * brevemente quando la sincronizzazione riparte. Sta sopra a tutto (anche ai
 * modali) così resta visibile mentre si aggiunge una spesa offline.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const [showReconnected, setShowReconnected] = useState(false)
  const wasOffline = useRef(false)

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true
      return
    }
    if (!wasOffline.current) return
    wasOffline.current = false
    setShowReconnected(true)
    const timer = setTimeout(() => setShowReconnected(false), 3000)
    return () => clearTimeout(timer)
  }, [isOnline])

  if (!isOnline) {
    return (
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-expense px-4 pb-2 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] text-center text-xs font-medium text-white">
        <IconWifiOff size={14} className="shrink-0" />
        Sei offline: puoi continuare ad aggiungere spese, verranno sincronizzate alla riconnessione
      </div>
    )
  }

  if (showReconnected) {
    return (
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-income px-4 pb-2 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] text-center text-xs font-medium text-white">
        Connessione ripristinata: sincronizzazione in corso…
      </div>
    )
  }

  return null
}

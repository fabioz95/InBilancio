import { useEffect, useState } from 'react'

/**
 * Quanti pixel della viewport sono attualmente coperti dalla tastiera
 * virtuale (0 quando la tastiera è chiusa). Confrontiamo `window.innerHeight`
 * (la viewport "di layout", che iOS Safari NON restringe quando appare la
 * tastiera) con `visualViewport.height` (che invece si restringe): la
 * differenza è, con buona approssimazione, l'altezza della tastiera.
 *
 * Usiamo una soglia (120px) per ignorare le piccole variazioni dovute alla
 * sola barra degli indirizzi/toolbar del browser che comprime o espande, così
 * il valore resta 0 (nessun aggiustamento) quando non c'è davvero una
 * tastiera aperta — evitando di alterare il layout dei modali in tutti i
 * casi "normali" (incluso quando l'app è installata come PWA, dove non c'è
 * comunque alcuna toolbar da confondere con la tastiera).
 */
export function useKeyboardInset() {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    function update() {
      const gap = window.innerHeight - vv!.height - vv!.offsetTop
      setInset(gap > 120 ? gap : 0)
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return inset
}

import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { ensureUserDocument, subscribeGroupMembers, subscribeUserProfile } from '../lib/firestore'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'

/** Collega lo stato di Firebase Auth agli store globali e alle sottoscrizioni Firestore. */
export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser)
  const setSettings = useAuthStore((s) => s.setSettings)
  const setDataOwnerUid = useAuthStore((s) => s.setDataOwnerUid)
  const setGroupMembers = useAuthStore((s) => s.setGroupMembers)
  const setInitializing = useAuthStore((s) => s.setInitializing)
  const subscribeData = useDataStore((s) => s.subscribe)
  const unsubscribeData = useDataStore((s) => s.unsubscribe)

  useEffect(() => {
    let unsubProfile: (() => void) | null = null
    let unsubMembers: (() => void) | null = null
    let lastDataOwnerUid: string | null = null

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubProfile?.()
      unsubProfile = null
      unsubMembers?.()
      unsubMembers = null
      lastDataOwnerUid = null

      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          await ensureUserDocument(firebaseUser.uid, {
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          })
        } catch (e) {
          console.error('Errore inizializzazione utente', e)
        }

        unsubProfile = subscribeUserProfile(firebaseUser.uid, (profile) => {
          setSettings(profile.settings)
          setDataOwnerUid(profile.dataOwnerUid)

          // Le sottoscrizioni dati (e alla lista membri) puntano allo spazio dati
          // condiviso: si riavviano solo quando cambia davvero (collegamento/scollegamento).
          if (profile.dataOwnerUid !== lastDataOwnerUid) {
            lastDataOwnerUid = profile.dataOwnerUid
            subscribeData(profile.dataOwnerUid)
            unsubMembers?.()
            unsubMembers = subscribeGroupMembers(profile.dataOwnerUid, setGroupMembers)
          }
        })
      } else {
        setUser(null)
        setDataOwnerUid(null)
        setGroupMembers([])
        unsubscribeData()
      }
      setInitializing(false)
    })

    return () => {
      unsubAuth()
      unsubProfile?.()
      unsubMembers?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

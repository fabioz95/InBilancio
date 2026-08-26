import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
)

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

/**
 * Cache locale persistente (IndexedDB) con supporto multi-tab: le letture
 * vengono servite dalla cache quando offline e le scritture (nuove spese,
 * modifiche, ecc.) vengono accodate localmente e inviate automaticamente al
 * backend appena torna la connessione, senza bisogno di logica di sync manuale.
 * Se il browser non supporta IndexedDB (es. modalità privata su alcuni
 * browser), ripieghiamo sulla cache in memoria di default: l'app resta
 * utilizzabile, semplicemente senza persistenza tra un riavvio e l'altro.
 */
export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
  } catch (e) {
    console.warn('Persistenza offline Firestore non disponibile, uso la cache in memoria.', e)
    return getFirestore(app)
  }
})()

const googleProvider = new GoogleAuthProvider()

/**
 * Usa sempre il popup: a differenza del redirect, non richiede di lasciare la
 * pagina e riportare lo stato tramite lo storage dell'authDomain (che è un
 * dominio diverso da quello di hosting: inbilancio.firebaseapp.com vs
 * inbilancio.web.app). Sui browser mobile, con i cookie/lo storage di terze
 * parti sempre più limitati, quel passaggio spesso si perde silenziosamente:
 * l'utente completa il login su Google ma torna alla schermata di accesso.
 * Il redirect resta solo come fallback per i (rari) browser che bloccano i popup.
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (e) {
    const code = (e as { code?: string }).code
    const popupUnavailable =
      code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment'
    if (!popupUnavailable) throw e
    await signInWithRedirect(auth, googleProvider)
    return null
  }
}

export async function completeRedirectSignIn() {
  const result = await getRedirectResult(auth)
  return result?.user ?? null
}

export async function signOut() {
  await firebaseSignOut(auth)
}

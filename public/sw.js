// Service worker minimale per l'uso offline di InBilancio: mette in cache la
// "shell" dell'app (HTML/JS/CSS/icone) così l'app si apre anche senza rete.
// I dati (spese, categorie, ecc.) restano gestiti dalla cache locale di
// Firestore (vedi src/lib/firebase.ts), non da questo file.
//
// Cambiare CACHE_VERSION forza tutti i client a scaricare i nuovi asset e a
// scartare la cache precedente al prossimo avvio.
const CACHE_VERSION = 'v6'
const CACHE_NAME = `inbilancio-${CACHE_VERSION}`
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {})
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

function isSameOrigin(url) {
  try {
    return new URL(url).origin === self.location.origin
  } catch {
    return false
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  // Lascia passare le richieste verso Firebase/Google (auth, Firestore, ecc.)
  // senza intercettarle: la gestione offline di quei dati è già del SDK.
  if (!isSameOrigin(request.url)) return

  // Navigazione (apertura pagina, refresh, cambio rotta): prova la rete e
  // aggiorna la cache; se non c'è connessione, serve la shell salvata in
  // cache così l'app (e il suo router client-side) si apre comunque.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(async () => (await caches.match('/index.html')) || (await caches.match('/')))
    )
    return
  }

  // Asset statici (bundle JS/CSS con hash nel nome, font, icone): li serve
  // subito dalla cache se presenti (stale) e in parallelo li aggiorna dalla
  // rete per la prossima volta (revalidate).
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request)
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone())
          return response
        })
        .catch(() => cached)
      return cached || network
    })
  )
})

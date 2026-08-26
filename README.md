# InBilancio

App di gestione delle finanze personali (spese ed entrate), responsive, con backend su **Firebase** (Authentication + Firestore).

- **Frontend**: React 18 + Vite + TypeScript, Tailwind CSS, Recharts, React Router, Zustand
- **Backend**: Firebase Authentication (Google Sign-In) + Firestore
- **Icone**: componenti SVG interamente custom (`src/components/icons/index.tsx`), nessuna libreria a pagamento

---

## 1. Requisiti

- Node.js 18+ e npm
- Un progetto Firebase (gratuito, piano Spark va bene)

---

## 2. Setup del progetto Firebase

### 2.1 Crea il progetto

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. **Aggiungi progetto** → dai un nome (es. `inbilancio`) → segui la procedura guidata

### 2.2 Abilita Authentication → Google

1. Nel menu laterale vai su **Build → Authentication**
2. Tab **Sign-in method** → **Aggiungi nuovo provider** → **Google**
3. Attiva il provider, imposta un'email di supporto → **Salva**
4. (Se pensi di fare il deploy) in **Settings → Authorized domains** aggiungi il dominio dove ospiterai l'app (es. `<progetto>.web.app`)

### 2.3 Crea il database Firestore

1. **Build → Firestore Database** → **Crea database**
2. Scegli **Modalità produzione** (le regole di sicurezza partono chiuse) → scegli la region più vicina
3. Vai su **Regole** e incolla il contenuto del file [`firestore.rules`](./firestore.rules) di questo repo:

   Il contenuto aggiornato (che include il meccanismo di account collegati, vedi [§9](#9-account-collegati)) è nel file [`firestore.rules`](./firestore.rules) del repo: garantisce che ogni utente possa leggere/scrivere solo i documenti sotto `users/{uid}` propri o dell'account a cui si è eventualmente collegato.

4. **Pubblica**

### 2.4 Recupera le chiavi di configurazione

1. **Impostazioni progetto** (icona ingranaggio) → **Generali**
2. In fondo a "Le tue app" clicca l'icona **Web** (`</>`) per registrare una nuova web app (nome a piacere, non serve Firebase Hosting in questo passaggio)
3. Copia i valori dell'oggetto `firebaseConfig` mostrato

---

## 3. Configurazione locale

1. Copia `.env.example` in `.env`:

   ```bash
   cp .env.example .env
   ```

2. Incolla i valori recuperati al passo 2.4:

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

---

## 4. Avvio in locale

```bash
npm install
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173) e accedi con il tuo account Google.

Al primo accesso l'app crea automaticamente, per il nuovo utente:
- il documento `users/{uid}` con le impostazioni di default (valuta EUR, tema scuro, ecc.)
- le 15 categorie predefinite (`users/{uid}/categories`)
- 2 conti di default: "Conto corrente" e "Contanti" (`users/{uid}/accounts`)

---

## 5. Dati di esempio (facoltativo)

Per popolare l'app con transazioni fittizie e testare subito grafici e liste:

1. Scarica una chiave di servizio: **Impostazioni progetto → Account di servizio → Genera nuova chiave privata**. Salva il file JSON nella root del progetto (es. `firebase-service-account.json` — è già escluso da `.gitignore`).
2. Aggiungi in `.env`:

   ```env
   SEED_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   SEED_USER_UID=<uid del tuo utente>
   ```

   L'uid lo trovi in **Authentication → Users** dopo aver effettuato il primo login nell'app, oppure nella console del browser (`firebase.auth().currentUser.uid`).

3. Esegui:

   ```bash
   npm run seed
   ```

   Lo script crea categorie/conti (se mancanti) e ~35 transazioni distribuite negli ultimi due mesi, più una transazione ricorrente "Mutuo" in evidenza.

---

## 6. Build e deploy (facoltativo, Firebase Hosting)

```bash
npm run build
```

Per pubblicare su Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # seleziona il progetto, cartella pubblica "dist", configura come SPA
firebase deploy
```

Il repo include già un [`firebase.json`](./firebase.json) con la configurazione hosting (cartella `dist`, rewrite SPA) pronta all'uso.

---

## 7. Struttura del progetto

```
src/
  components/         Componenti riutilizzabili (TransactionRow, MonthSelector, FAB, ...)
    icons/            Tutte le icone SVG come componenti React
    layout/           Sidebar, BottomNav, AppShell
    settings/         Sezioni della pagina Impostazioni
  hooks/              Hook custom (auth listener)
  lib/                Client Firebase e funzioni Firestore (CRUD)
  pages/              Pagine principali (Overview, Charts, Settings, Login)
  store/              Stato globale con Zustand (auth, dati, UI)
  types/              Tipi TypeScript condivisi
  utils/              Date, valuta, CSV, categorie/conti di default
scripts/seed.ts       Script di seed dati di esempio (firebase-admin)
firestore.rules       Security rules da incollare in Firebase Console
firebase.json         Configurazione Firebase Hosting
```

## 8. Modello dati Firestore

```
users/{uid}
  displayName, email, photoURL, currency, settings { currency, firstDayOfMonth, theme }
  dataOwnerUid   // uid sotto cui vivono i dati effettivi: il proprio, o quello dell'account a cui ci si è collegati
  lastInviteCode // campo tecnico usato solo durante il collegamento (vedi §9)

users/{dataOwnerUid}/accounts/{accountId}
  name, type ("checking" | "cash" | "card" | "other"), balance, createdAt

users/{dataOwnerUid}/categories/{categoryId}
  name, icon, color, type ("expense" | "income" | "both"), isDefault, hidden

users/{dataOwnerUid}/transactions/{transactionId}
  amount, type ("expense" | "income" | "transfer"),
  categoryId, accountId, toAccountId, description,
  date, isRecurring, recurrenceRule,
  recurringTemplateId, recurringOccurrenceDate,  // presenti solo se generata da una ricorrenza (vedi sotto)
  createdAt, updatedAt

users/{dataOwnerUid}/recurringTemplates/{templateId}
  amount, type ("expense" | "income"), categoryId, accountId, description,
  recurrenceRule ("daily" | "weekly" | "monthly" | "yearly"), startDate, active, createdAt, updatedAt

users/{dataOwnerUid}/customCharts/{chartId}
  title, kind ("pie" | "bar"), groupBy ("category" | "account"),
  transactionFilter ("expense" | "income" | "both"), period ("month" | "all"), createdAt

linkCodes/{code}
  ownerUid, expiresAt   // codice invito temporaneo (15 min) per collegare un account
```

Tutte le sottocollezioni sotto `users/{uid}` in realtà vivono sotto `users/{dataOwnerUid}`: ogni
client legge/scrive sempre lo spazio dati indicato dal proprio `dataOwnerUid` (di default il
proprio uid), non necessariamente il proprio `uid`. Questo è il meccanismo alla base degli
account collegati (§9).

## 9. Account collegati

In Impostazioni → **Account collegati**, un utente può generare un codice invito valido 15 minuti
(`Genera codice invito`). Un secondo account, inserendo quel codice (`Ho ricevuto un codice`),
imposta il proprio `dataOwnerUid` su quello di chi ha generato il codice: da quel momento entrambi
gli account leggono/scrivono esattamente gli stessi conti, categorie, transazioni e ricorrenze.
Si può collegare più di un account allo stesso spazio dati (es. una famiglia intera), e ciascuno
può scollegarsi in autonomia in qualsiasi momento (`Scollega il mio account`), tornando a vedere
solo i propri dati precedenti (se esistenti — il collegamento **non** unisce automaticamente dati
preesistenti dei due account).

## 10. Spese e entrate ricorrenti

Una "ricorrenza" (`recurringTemplates`) proietta automaticamente un'occorrenza per periodo
(giornaliera/settimanale/mensile/annuale) a partire da una data di inizio. In Panoramica, per il
mese selezionato, le occorrenze non ancora registrate come transazione compaiono come promemoria
("aggiungi"); registrandole si crea una transazione collegata alla ricorrenza (`recurringTemplateId`
+ `recurringOccurrenceDate`) e il promemoria sparisce per quel periodo, per poi ripresentarsi al
periodo successivo. Le ricorrenze si gestiscono in Impostazioni → **Spese e entrate ricorrenti**
(si possono anche mettere in pausa o eliminare); si possono anche creare al volo spuntando
"Transazione ricorrente" quando si aggiunge una nuova spesa/entrata.

## 11. Note

- Il login usa popup su desktop e redirect su mobile (rilevato da user-agent/larghezza viewport).
- Le categorie predefinite non possono essere eliminate, solo nascoste; possono essere eliminate solo le categorie personalizzate non collegate a transazioni.
- L'esportazione dati (Impostazioni → Dati) genera un CSV con tutte le transazioni.

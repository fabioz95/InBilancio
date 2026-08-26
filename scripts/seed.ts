/**
 * Script di seed: popola Firestore con categorie, conti e transazioni di
 * esempio per un utente esistente, cosi da poter provare subito la UI.
 *
 * Uso:
 *   1. Scarica una chiave account di servizio da Firebase Console
 *      (Impostazioni progetto > Account di servizio > Genera nuova chiave privata)
 *   2. Imposta in .env:
 *        SEED_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
 *        SEED_USER_UID=<uid dell'utente Firebase Auth da popolare>
 *   3. npm run seed
 */
import 'dotenv/config'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { DEFAULT_CATEGORIES } from '../src/utils/defaultCategories'
import { DEFAULT_ACCOUNTS } from '../src/utils/defaultAccounts'

const serviceAccountPath = process.env.SEED_SERVICE_ACCOUNT_PATH ?? './firebase-service-account.json'
const uid = process.env.SEED_USER_UID

if (!uid) {
  console.error('Errore: imposta SEED_USER_UID nel file .env (uid dell\'utente da popolare).')
  process.exit(1)
}

const resolvedPath = resolve(process.cwd(), serviceAccountPath)
if (!existsSync(resolvedPath)) {
  console.error(`Errore: file service account non trovato in ${resolvedPath}.`)
  console.error('Scaricalo da Firebase Console > Impostazioni progetto > Account di servizio.')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(resolvedPath, 'utf-8'))

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

async function seedCategoriesAndAccounts() {
  const batch = db.batch()

  for (const category of DEFAULT_CATEGORIES) {
    const ref = db.collection('users').doc(uid!).collection('categories').doc(category.id)
    batch.set(ref, {
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      isDefault: category.isDefault,
      hidden: false,
    })
  }

  for (const account of DEFAULT_ACCOUNTS) {
    const ref = db.collection('users').doc(uid!).collection('accounts').doc(account.id)
    batch.set(ref, {
      name: account.name,
      type: account.type,
      balance: account.balance,
      createdAt: Timestamp.now(),
    })
  }

  await batch.commit()
  console.log(`✓ ${DEFAULT_CATEGORIES.length} categorie e ${DEFAULT_ACCOUNTS.length} conti creati.`)
}

const EXPENSE_CATEGORY_IDS = DEFAULT_CATEGORIES.filter((c) => c.type !== 'income').map((c) => c.id)
const ACCOUNT_IDS = DEFAULT_ACCOUNTS.map((a) => a.id)

const SAMPLE_DESCRIPTIONS: Record<string, string[]> = {
  cibo: ['Pranzo veloce', 'Panino', ''],
  spesa: ['Spesa settimanale', 'Esselunga', ''],
  ristoranti: ['Cena fuori', 'Aperitivo', ''],
  trasporti: ['Benzina', 'Biglietto treno', ''],
  shopping: ['Vestiti', 'Regalo', ''],
  hobby: ['Materiale disegno', ''],
  videogiochi: ['Nuovo gioco', 'Abbonamento online', ''],
  abbonamenti: ['Streaming', 'Palestra', ''],
  salute: ['Farmacia', 'Visita medica', ''],
  sport: ['Attrezzatura', ''],
  casa: ['Manutenzione', ''],
  'bollette-gas': ['Bolletta gas', ''],
  'bollette-elettrico': ['Bolletta luce', ''],
  varie: ['', ''],
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function seedTransactions() {
  const batch = db.batch()
  const now = new Date()
  let count = 0

  // ~35 transazioni di spesa/entrata negli ultimi 2 mesi.
  for (let i = 0; i < 35; i++) {
    const daysAgo = Math.floor(Math.random() * 60)
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo)
    const isIncome = Math.random() < 0.1

    const categoryId = isIncome ? 'stipendio' : randomFrom(EXPENSE_CATEGORY_IDS)
    const description = randomFrom(SAMPLE_DESCRIPTIONS[categoryId] ?? [''])
    const amount = isIncome
      ? Math.round((1200 + Math.random() * 800) * 100) / 100
      : Math.round((3 + Math.random() * 80) * 100) / 100

    const ref = db.collection('users').doc(uid!).collection('transactions').doc()
    batch.set(ref, {
      amount,
      type: isIncome ? 'income' : 'expense',
      categoryId,
      accountId: randomFrom(ACCOUNT_IDS),
      toAccountId: null,
      description,
      date: Timestamp.fromDate(date),
      isRecurring: false,
      recurrenceRule: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    count++
  }

  // Transazione ricorrente di esempio: "Mutuo", futura nel mese corrente.
  const mutuoDate = new Date(now.getFullYear(), now.getMonth(), Math.min(27, now.getDate() + 5))
  const mutuoRef = db.collection('users').doc(uid!).collection('transactions').doc()
  batch.set(mutuoRef, {
    amount: 650,
    type: 'expense',
    categoryId: 'casa',
    accountId: 'conto-corrente',
    toAccountId: null,
    description: 'Mutuo',
    date: Timestamp.fromDate(mutuoDate),
    isRecurring: true,
    recurrenceRule: 'monthly',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  count++

  await batch.commit()
  console.log(`✓ ${count} transazioni di esempio create.`)
}

async function main() {
  console.log(`Seeding dati per l'utente ${uid}…`)
  await seedCategoriesAndAccounts()
  await seedTransactions()
  console.log('Fatto! Apri l\'app e accedi con lo stesso account Google per vedere i dati.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { DEFAULT_CATEGORIES } from '../utils/defaultCategories'
import { DEFAULT_ACCOUNTS } from '../utils/defaultAccounts'
import type {
  Account,
  Category,
  CustomChart,
  CustomChartDraft,
  GroupMember,
  RecurringTemplate,
  RecurringTemplateDraft,
  Transaction,
  TransactionDraft,
  UserSettings,
} from '../types'

const DEFAULT_SETTINGS: UserSettings = {
  currency: 'EUR',
  firstDayOfMonth: 1,
  theme: 'dark',
}

/* ------------------------------- Utenti ---------------------------------- */

export async function ensureUserDocument(
  uid: string,
  profile: { displayName: string | null; email: string | null; photoURL: string | null }
) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)

  if (!snap.exists()) {
    await setDoc(userRef, {
      displayName: profile.displayName,
      email: profile.email,
      photoURL: profile.photoURL,
      currency: DEFAULT_SETTINGS.currency,
      settings: DEFAULT_SETTINGS,
      dataOwnerUid: uid,
      createdAt: serverTimestamp(),
    })

    await Promise.all([
      ...DEFAULT_CATEGORIES.map((c) =>
        setDoc(doc(db, 'users', uid, 'categories', c.id), {
          name: c.name,
          icon: c.icon,
          color: c.color,
          type: c.type,
          isDefault: c.isDefault,
          hidden: false,
        })
      ),
      ...DEFAULT_ACCOUNTS.map((a) =>
        setDoc(doc(db, 'users', uid, 'accounts', a.id), {
          name: a.name,
          type: a.type,
          balance: a.balance,
          createdAt: serverTimestamp(),
        })
      ),
    ])
  } else {
    const data = snap.data()
    const patch: Record<string, unknown> = {
      displayName: profile.displayName,
      email: profile.email,
      photoURL: profile.photoURL,
    }
    // Backfill per gli account creati prima dell'introduzione degli account collegati.
    if (!data?.dataOwnerUid) patch.dataOwnerUid = uid
    await updateDoc(userRef, patch)
  }
}

export interface UserProfile {
  displayName: string | null
  email: string | null
  photoURL: string | null
  dataOwnerUid: string
  settings: UserSettings
}

/** Sottoscrive il documento profilo dell'utente autenticato: impostazioni + a quale spazio dati (dataOwnerUid) attinge. */
export function subscribeUserProfile(uid: string, onChange: (profile: UserProfile) => void): Unsubscribe {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    const data = snap.data()
    onChange({
      displayName: data?.displayName ?? null,
      email: data?.email ?? null,
      photoURL: data?.photoURL ?? null,
      dataOwnerUid: data?.dataOwnerUid || uid,
      settings: { ...DEFAULT_SETTINGS, ...(data?.settings ?? {}) },
    })
  })
}

export async function updateUserSettings(uid: string, settings: Partial<UserSettings>) {
  await updateDoc(doc(db, 'users', uid), {
    settings,
    ...(settings.currency ? { currency: settings.currency } : {}),
  })
}

/* ------------------------------ Categorie --------------------------------- */

function categoryFromDoc(id: string, data: any): Category {
  return {
    id,
    name: data.name,
    icon: data.icon,
    color: data.color,
    type: data.type,
    isDefault: Boolean(data.isDefault),
    hidden: Boolean(data.hidden),
  }
}

export function subscribeCategories(uid: string, onChange: (categories: Category[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'users', uid, 'categories'), (snap) => {
    onChange(snap.docs.map((d) => categoryFromDoc(d.id, d.data())))
  })
}

export async function addCategory(uid: string, category: Omit<Category, 'id' | 'isDefault'>) {
  const ref = await addDoc(collection(db, 'users', uid, 'categories'), {
    ...category,
    isDefault: false,
    hidden: false,
  })
  return ref.id
}

export async function updateCategory(uid: string, id: string, patch: Partial<Category>) {
  await updateDoc(doc(db, 'users', uid, 'categories', id), patch)
}

export async function deleteCategory(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'categories', id))
}

/* -------------------------------- Conti ------------------------------------ */

function accountFromDoc(id: string, data: any): Account {
  return {
    id,
    name: data.name,
    type: data.type,
    balance: data.balance ?? 0,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
  }
}

export function subscribeAccounts(uid: string, onChange: (accounts: Account[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'users', uid, 'accounts'), (snap) => {
    onChange(snap.docs.map((d) => accountFromDoc(d.id, d.data())))
  })
}

export async function addAccount(uid: string, account: Pick<Account, 'name' | 'type' | 'balance'>) {
  const ref = await addDoc(collection(db, 'users', uid, 'accounts'), {
    ...account,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateAccount(uid: string, id: string, patch: Partial<Account>) {
  await updateDoc(doc(db, 'users', uid, 'accounts', id), patch)
}

export async function deleteAccount(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'accounts', id))
}

/* ---------------------------- Transazioni ----------------------------------- */

function transactionFromDoc(id: string, data: any): Transaction {
  const toMillis = (v: any) => (v instanceof Timestamp ? v.toMillis() : v ?? Date.now())
  return {
    id,
    amount: data.amount,
    type: data.type,
    categoryId: data.categoryId ?? null,
    accountId: data.accountId,
    toAccountId: data.toAccountId ?? null,
    description: data.description ?? '',
    date: toMillis(data.date),
    isRecurring: Boolean(data.isRecurring),
    recurrenceRule: data.recurrenceRule ?? null,
    isAdjustment: Boolean(data.isAdjustment),
    recurringTemplateId: data.recurringTemplateId ?? null,
    recurringOccurrenceDate: data.recurringOccurrenceDate ?? null,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  }
}

export function subscribeTransactions(
  uid: string,
  onChange: (transactions: Transaction[]) => void
): Unsubscribe {
  // Nessun filtro server-side su range di date: il dataset personale è piccolo
  // e il filtro per mese/ricerca avviene lato client per semplicità e reattività.
  return onSnapshot(collection(db, 'users', uid, 'transactions'), (snap) => {
    onChange(snap.docs.map((d) => transactionFromDoc(d.id, d.data())))
  })
}

export async function addTransaction(uid: string, draft: TransactionDraft) {
  await addDoc(collection(db, 'users', uid, 'transactions'), {
    ...draft,
    date: Timestamp.fromMillis(draft.date),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateTransaction(uid: string, id: string, patch: Partial<TransactionDraft>) {
  const { date, ...rest } = patch
  await updateDoc(doc(db, 'users', uid, 'transactions', id), {
    ...rest,
    ...(date ? { date: Timestamp.fromMillis(date) } : {}),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTransaction(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'transactions', id))
}

/**
 * Crea (o, se già esiste, sostituisce senza duplicare) la transazione che salda
 * una specifica occorrenza di una ricorrenza. Usa un ID deterministico invece
 * di uno casuale apposta per essere idempotente: se due account collegati la
 * registrano/auto-inseriscono nello stesso istante, non nascono doppioni.
 */
export async function setTransactionForOccurrence(
  uid: string,
  templateId: string,
  occurrenceDate: number,
  draft: TransactionDraft
) {
  const ref = doc(db, 'users', uid, 'transactions', `rec_${templateId}_${occurrenceDate}`)
  await setDoc(ref, {
    ...draft,
    date: Timestamp.fromMillis(draft.date),
    recurringTemplateId: templateId,
    recurringOccurrenceDate: occurrenceDate,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getAllTransactionsOnce(uid: string): Promise<Transaction[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'transactions'))
  return snap.docs.map((d) => transactionFromDoc(d.id, d.data()))
}

/* ------------------------------ Grafici custom ----------------------------- */

function customChartFromDoc(id: string, data: any): CustomChart {
  return {
    id,
    title: data.title,
    kind: data.kind,
    groupBy: data.groupBy,
    transactionFilter: data.transactionFilter,
    period: data.period,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
  }
}

export function subscribeCustomCharts(
  uid: string,
  onChange: (charts: CustomChart[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, 'users', uid, 'customCharts'), (snap) => {
    onChange(
      snap.docs
        .map((d) => customChartFromDoc(d.id, d.data()))
        .sort((a, b) => a.createdAt - b.createdAt)
    )
  })
}

export async function addCustomChart(uid: string, chart: CustomChartDraft) {
  const ref = await addDoc(collection(db, 'users', uid, 'customCharts'), {
    ...chart,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteCustomChart(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'customCharts', id))
}

/* --------------------------- Ricorrenze (template) -------------------------- */

function recurringTemplateFromDoc(id: string, data: any): RecurringTemplate {
  const toMillis = (v: any) => (v instanceof Timestamp ? v.toMillis() : v ?? Date.now())
  return {
    id,
    amount: data.amount,
    type: data.type,
    categoryId: data.categoryId ?? null,
    accountId: data.accountId,
    description: data.description ?? '',
    recurrenceRule: data.recurrenceRule,
    startDate: toMillis(data.startDate),
    active: data.active !== false,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  }
}

export function subscribeRecurringTemplates(
  uid: string,
  onChange: (templates: RecurringTemplate[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, 'users', uid, 'recurringTemplates'), (snap) => {
    onChange(snap.docs.map((d) => recurringTemplateFromDoc(d.id, d.data())))
  })
}

export async function addRecurringTemplate(uid: string, draft: RecurringTemplateDraft) {
  const ref = await addDoc(collection(db, 'users', uid, 'recurringTemplates'), {
    ...draft,
    startDate: Timestamp.fromMillis(draft.startDate),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateRecurringTemplate(
  uid: string,
  id: string,
  patch: Partial<RecurringTemplateDraft>
) {
  const { startDate, ...rest } = patch
  await updateDoc(doc(db, 'users', uid, 'recurringTemplates', id), {
    ...rest,
    ...(startDate ? { startDate: Timestamp.fromMillis(startDate) } : {}),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteRecurringTemplate(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'recurringTemplates', id))
}

/* ----------------------------- Account collegati ---------------------------- */

const LINK_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // esclusi caratteri ambigui (0/O, 1/I/L)
const LINK_CODE_TTL_MS = 15 * 60 * 1000

function generateLinkCode(length = 6): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += LINK_CODE_CHARS[Math.floor(Math.random() * LINK_CODE_CHARS.length)]
  }
  return code
}

/** Crea un codice invito valido 15 minuti per collegare un altro account allo spazio dati `ownerUid`. */
export async function createLinkInvite(ownerUid: string): Promise<{ code: string; expiresAt: number }> {
  const code = generateLinkCode()
  const expiresAt = Date.now() + LINK_CODE_TTL_MS
  await setDoc(doc(db, 'linkCodes', code), {
    ownerUid,
    expiresAt: Timestamp.fromMillis(expiresAt),
  })
  return { code, expiresAt }
}

/** Collega l'account `myUid` allo stesso spazio dati del proprietario del codice. Ritorna il nuovo dataOwnerUid. */
export async function redeemLinkInvite(code: string, myUid: string): Promise<string> {
  const normalized = code.trim().toUpperCase()
  const inviteRef = doc(db, 'linkCodes', normalized)
  const snap = await getDoc(inviteRef)
  if (!snap.exists()) throw new Error('Codice non valido o già utilizzato.')

  const data = snap.data()
  const expiresAt = data.expiresAt?.toMillis?.() ?? 0
  if (expiresAt < Date.now()) throw new Error('Codice scaduto: chiedi un nuovo codice.')

  const ownerUid = data.ownerUid as string
  if (ownerUid === myUid) throw new Error('Non puoi collegarti al tuo stesso account.')

  await updateDoc(doc(db, 'users', myUid), {
    dataOwnerUid: ownerUid,
    lastInviteCode: normalized,
  })
  await deleteDoc(inviteRef).catch(() => {})
  return ownerUid
}

/** Scollega l'account `myUid`: torna a vedere solo i propri dati. */
export async function leaveLinkedGroup(myUid: string) {
  await updateDoc(doc(db, 'users', myUid), { dataOwnerUid: myUid })
}

/** Sottoscrive l'elenco di tutti gli account collegati allo stesso spazio dati (incluso l'owner). */
export function subscribeGroupMembers(
  dataOwnerUid: string,
  onChange: (members: GroupMember[]) => void
): Unsubscribe {
  const q = query(collection(db, 'users'), where('dataOwnerUid', '==', dataOwnerUid))
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => ({
        uid: d.id,
        displayName: d.data().displayName ?? null,
        email: d.data().email ?? null,
        photoURL: d.data().photoURL ?? null,
      }))
    )
  })
}

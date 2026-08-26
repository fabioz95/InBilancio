import { startOfDay } from './date'
import type { RecurrenceRule, RecurringTemplate, Transaction, TransactionDraft } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export interface OccurrenceSource {
  recurrenceRule: RecurrenceRule
  startDate: number
}

/**
 * Calcola tutte le occorrenze (mezzanotte locale, epoch ms) di una ricorrenza
 * che cadono nell'intervallo [rangeStart, rangeEnd] (inclusi), a partire da
 * `startDate`. Occorrenze precedenti a `startDate` non vengono mai generate.
 */
export function getOccurrencesInRange(
  template: OccurrenceSource,
  rangeStart: number,
  rangeEnd: number
): number[] {
  const start = startOfDay(template.startDate)
  const rStart = startOfDay(rangeStart)
  const rEnd = startOfDay(rangeEnd)
  if (start > rEnd || rStart > rEnd) return []

  const results: number[] = []

  if (template.recurrenceRule === 'daily') {
    let cursor = Math.max(start, rStart)
    while (cursor <= rEnd) {
      results.push(cursor)
      cursor += DAY_MS
    }
    return results
  }

  if (template.recurrenceRule === 'weekly') {
    const cursorDate = new Date(start)
    while (cursorDate.getTime() < rStart) cursorDate.setDate(cursorDate.getDate() + 7)
    while (cursorDate.getTime() <= rEnd) {
      results.push(cursorDate.getTime())
      cursorDate.setDate(cursorDate.getDate() + 7)
    }
    return results
  }

  if (template.recurrenceRule === 'monthly') {
    const day = new Date(start).getDate()
    const cursor = new Date(rStart)
    cursor.setDate(1)
    while (cursor.getTime() <= rEnd) {
      const year = cursor.getFullYear()
      const month = cursor.getMonth()
      const occurrence = new Date(year, month, Math.min(day, lastDayOfMonth(year, month))).getTime()
      if (occurrence >= start && occurrence >= rStart && occurrence <= rEnd) results.push(occurrence)
      cursor.setMonth(cursor.getMonth() + 1)
    }
    return results
  }

  // yearly
  const anchor = new Date(start)
  const month = anchor.getMonth()
  const day = anchor.getDate()
  for (let year = new Date(rStart).getFullYear(); year <= new Date(rEnd).getFullYear(); year++) {
    const occurrence = new Date(year, month, Math.min(day, lastDayOfMonth(year, month))).getTime()
    if (occurrence >= start && occurrence >= rStart && occurrence <= rEnd) results.push(occurrence)
  }
  return results
}

/** Prima occorrenza da `fromDate` in avanti (entro ~1 anno), o null se non ce ne sono. */
export function getNextOccurrence(template: OccurrenceSource, fromDate: number = Date.now()): number | null {
  const occurrences = getOccurrencesInRange(template, fromDate, fromDate + 366 * DAY_MS)
  return occurrences[0] ?? null
}

export interface UpcomingOccurrence {
  template: RecurringTemplate
  occurrenceDate: number
}

function paidOccurrenceKeys(transactions: Transaction[]): Set<string> {
  return new Set(
    transactions
      .filter((t) => t.recurringTemplateId && t.recurringOccurrenceDate != null)
      .map((t) => `${t.recurringTemplateId}:${t.recurringOccurrenceDate}`)
  )
}

/**
 * Tra tutte le occorrenze dei template attivi nell'intervallo dato, restituisce
 * quelle non ancora "saldate" da una transazione collegata (recurringTemplateId +
 * recurringOccurrenceDate corrispondenti).
 */
export function getUnpaidOccurrences(
  templates: RecurringTemplate[],
  transactions: Transaction[],
  rangeStart: number,
  rangeEnd: number
): UpcomingOccurrence[] {
  const paidKeys = paidOccurrenceKeys(transactions)

  const result: UpcomingOccurrence[] = []
  for (const template of templates) {
    if (!template.active) continue
    for (const occurrenceDate of getOccurrencesInRange(template, rangeStart, rangeEnd)) {
      if (!paidKeys.has(`${template.id}:${occurrenceDate}`)) {
        result.push({ template, occurrenceDate })
      }
    }
  }
  return result.sort((a, b) => a.occurrenceDate - b.occurrenceDate)
}

/**
 * Occorrenze non ancora saldate la cui data è arrivata (oggi o prima): quelle
 * che vanno inserite in automatico come transazione appena si apre l'app.
 * A differenza di getUnpaidOccurrences guarda dall'inizio di ogni ricorrenza
 * (non un singolo mese), per recuperare anche eventuali arretrati.
 */
export function getDueOccurrences(
  templates: RecurringTemplate[],
  transactions: Transaction[],
  now: number = Date.now()
): UpcomingOccurrence[] {
  const paidKeys = paidOccurrenceKeys(transactions)
  const upTo = startOfDay(now)

  const result: UpcomingOccurrence[] = []
  for (const template of templates) {
    if (!template.active) continue
    for (const occurrenceDate of getOccurrencesInRange(template, template.startDate, upTo)) {
      if (!paidKeys.has(`${template.id}:${occurrenceDate}`)) {
        result.push({ template, occurrenceDate })
      }
    }
  }
  return result.sort((a, b) => a.occurrenceDate - b.occurrenceDate)
}

/** Bozza di transazione che salda esattamente un'occorrenza, coi valori del template. */
export function buildDraftFromTemplate(template: RecurringTemplate, occurrenceDate: number): TransactionDraft {
  return {
    amount: template.amount,
    type: template.type,
    categoryId: template.categoryId,
    accountId: template.accountId,
    toAccountId: null,
    description: template.description ?? '',
    date: occurrenceDate,
    isRecurring: true,
    recurrenceRule: template.recurrenceRule,
  }
}

export const RECURRENCE_LABELS: Record<RecurrenceRule, string> = {
  daily: 'Giornaliera',
  weekly: 'Settimanale',
  monthly: 'Mensile',
  yearly: 'Annuale',
}

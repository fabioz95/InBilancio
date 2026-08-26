import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import { setTransactionForOccurrence } from '../lib/firestore'
import { buildDraftFromTemplate, getDueOccurrences } from '../utils/recurring'

/**
 * Appena i dati sono caricati, registra automaticamente come transazione ogni
 * occorrenza di ricorrenza la cui data è arrivata (oggi o prima) e non è
 * ancora stata saldata. L'ID deterministico usato da setTransactionForOccurrence
 * rende l'operazione sicura anche se più account collegati la eseguono insieme.
 */
export function useAutoInsertRecurring() {
  const dataOwnerUid = useAuthStore((s) => s.dataOwnerUid)
  const templates = useDataStore((s) => s.recurringTemplates)
  const transactions = useDataStore((s) => s.transactions)
  const loading = useDataStore((s) => s.loading)

  // Evita di rilanciare lo stesso inserimento più volte mentre si aspetta che
  // Firestore confermi la scrittura e aggiorni la lista transazioni in locale.
  const inFlight = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!dataOwnerUid || loading) return

    const due = getDueOccurrences(templates, transactions)
    for (const { template, occurrenceDate } of due) {
      const key = `${template.id}:${occurrenceDate}`
      if (inFlight.current.has(key)) continue
      inFlight.current.add(key)

      setTransactionForOccurrence(dataOwnerUid, template.id, occurrenceDate, buildDraftFromTemplate(template, occurrenceDate)).catch(
        (e) => {
          console.error('Auto-inserimento ricorrenza fallito', e)
          inFlight.current.delete(key)
        }
      )
    }
  }, [dataOwnerUid, templates, transactions, loading])
}

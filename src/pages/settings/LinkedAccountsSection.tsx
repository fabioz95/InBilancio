import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { createLinkInvite, leaveLinkedGroup, redeemLinkInvite } from '../../lib/firestore'
import { IconLink, IconUser } from '../../components/icons'

export function LinkedAccountsSection() {
  const user = useAuthStore((s) => s.user)
  const dataOwnerUid = useAuthStore((s) => s.dataOwnerUid)
  const groupMembers = useAuthStore((s) => s.groupMembers)

  const [invite, setInvite] = useState<{ code: string; expiresAt: number } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [joining, setJoining] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const isLinked = groupMembers.length > 1
  const others = groupMembers.filter((m) => m.uid !== user?.uid)

  async function handleGenerateInvite() {
    if (!dataOwnerUid) return
    setGenerating(true)
    setError(null)
    try {
      const result = await createLinkInvite(dataOwnerUid)
      setInvite(result)
      setCopied(false)
    } catch (e) {
      console.error(e)
      setError('Impossibile generare il codice.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy() {
    if (!invite) return
    try {
      await navigator.clipboard.writeText(invite.code)
      setCopied(true)
    } catch {
      // clipboard non disponibile: l'utente può comunque copiare il codice a mano
    }
  }

  async function handleJoin() {
    if (!user || !codeInput.trim()) return
    setJoining(true)
    setError(null)
    try {
      await redeemLinkInvite(codeInput, user.uid)
      setCodeInput('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossibile collegare l\'account.')
    } finally {
      setJoining(false)
    }
  }

  async function handleLeave() {
    if (!user) return
    setLeaving(true)
    setError(null)
    try {
      await leaveLinkedGroup(user.uid)
      setInvite(null)
    } catch (e) {
      console.error(e)
      setError('Impossibile scollegarsi.')
    } finally {
      setLeaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
        <IconLink size={16} />
        Account collegati
      </h2>
      <p className="mb-4 text-xs text-muted">
        Collega il tuo account a un'altra persona (es. partner) per condividere la stessa vista:
        conti, categorie, transazioni e ricorrenze diventano comuni a tutti gli account collegati.
      </p>

      <div className="mb-4 flex flex-col gap-2">
        {groupMembers.map((member) => (
          <div key={member.uid} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2">
            {member.photoURL ? (
              <img src={member.photoURL} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent">
                <IconUser size={14} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-fg">
                {member.displayName ?? member.email ?? 'Account'}
                {member.uid === user?.uid && ' (tu)'}
              </p>
              {member.email && <p className="truncate text-xs text-muted">{member.email}</p>}
            </div>
          </div>
        ))}
      </div>

      {isLinked ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Il tuo account è collegato con {others.map((m) => m.displayName ?? m.email ?? 'un altro account').join(', ')}.
            Vedete e modificate tutti gli stessi dati.
          </p>
          <button
            type="button"
            onClick={handleLeave}
            disabled={leaving}
            className="self-start rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-expense transition-colors hover:bg-expense/10 disabled:opacity-50"
          >
            {leaving ? 'Scollegamento…' : 'Scollega il mio account'}
          </button>
          <p className="text-xs text-muted">
            Dopo lo scollegamento tornerai a vedere solo i tuoi dati personali (quelli che avevi
            prima di collegarti, se esistenti).
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-medium text-fg">Invita qualcuno</p>
            {invite ? (
              <div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
                <p className="text-center text-2xl font-bold tracking-[0.3em] text-accent">{invite.code}</p>
                <p className="mt-2 text-center text-xs text-muted">
                  Valido fino alle{' '}
                  {new Date(invite.expiresAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  . Condividilo con chi vuoi collegare.
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25"
                  >
                    {copied ? 'Copiato ✓' : 'Copia codice'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateInvite}
                    disabled={generating}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-fg"
                  >
                    Nuovo codice
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerateInvite}
                disabled={generating}
                className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {generating ? 'Generazione…' : 'Genera codice invito'}
              </button>
            )}
          </div>

          <div className="border-t border-border/60 pt-4">
            <p className="mb-2 text-sm font-medium text-fg">Ho ricevuto un codice</p>
            <p className="mb-2 text-xs text-muted">
              Collegandoti vedrai i dati dell'account che ti ha invitato: i tuoi dati attuali
              resteranno salvati ma non saranno più visibili finché non ti scolleghi.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="Codice invito"
                maxLength={6}
                className="flex-1 rounded-xl border border-border bg-fg/5 px-3 py-2.5 text-sm uppercase tracking-widest text-fg placeholder:normal-case placeholder:tracking-normal placeholder:text-muted outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={handleJoin}
                disabled={joining || !codeInput.trim()}
                className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {joining ? 'Collegamento…' : 'Collega'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-expense">{error}</p>}
    </section>
  )
}

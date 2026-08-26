import { create } from 'zustand'
import type { User } from 'firebase/auth'
import type { GroupMember, UserSettings } from '../types'

const DEFAULT_SETTINGS: UserSettings = {
  currency: 'EUR',
  firstDayOfMonth: 1,
  theme: 'dark',
}

interface AuthState {
  user: User | null
  settings: UserSettings
  /** Spazio dati effettivo (uid sotto cui vivono transazioni/conti/categorie): il proprio, o quello di chi si è collegato. */
  dataOwnerUid: string | null
  /** Tutti gli account collegati allo stesso spazio dati (incluso il proprio). */
  groupMembers: GroupMember[]
  initializing: boolean
  /** Errore di un accesso Google avviato via redirect (es. su mobile) e completato dopo il reload. */
  redirectError: string | null
  setUser: (user: User | null) => void
  setSettings: (settings: UserSettings) => void
  setDataOwnerUid: (uid: string | null) => void
  setGroupMembers: (members: GroupMember[]) => void
  setInitializing: (value: boolean) => void
  setRedirectError: (value: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  settings: DEFAULT_SETTINGS,
  dataOwnerUid: null,
  groupMembers: [],
  initializing: true,
  redirectError: null,
  setUser: (user) => set({ user }),
  setSettings: (settings) => set({ settings }),
  setDataOwnerUid: (dataOwnerUid) => set({ dataOwnerUid }),
  setGroupMembers: (groupMembers) => set({ groupMembers }),
  setInitializing: (value) => set({ initializing: value }),
  setRedirectError: (value) => set({ redirectError: value }),
}))

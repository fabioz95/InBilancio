import type { Category } from '../types'

/**
 * Categorie precaricate per ogni nuovo utente. `id` è stabile e viene usato
 * anche come chiave del documento Firestore in `users/{uid}/categories/{id}`.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cibo', name: 'Cibo', icon: 'IconCibo', color: '#5AC8FA', type: 'expense', isDefault: true },
  { id: 'casa', name: 'Casa', icon: 'IconCasa', color: '#FF9F43', type: 'expense', isDefault: true },
  { id: 'bollette-gas', name: 'Bollette Gas', icon: 'IconBolletteGas', color: '#F4B400', type: 'expense', isDefault: true },
  { id: 'bollette-elettrico', name: 'Bollette Elettrico', icon: 'IconBolletteElettrico', color: '#FFD60A', type: 'expense', isDefault: true },
  { id: 'spesa', name: 'Spesa', icon: 'IconSpesa', color: '#34C759', type: 'expense', isDefault: true },
  { id: 'shopping', name: 'Shopping', icon: 'IconShopping', color: '#FF6FA5', type: 'expense', isDefault: true },
  { id: 'hobby', name: 'Hobby', icon: 'IconHobby', color: '#AF7DFF', type: 'expense', isDefault: true },
  { id: 'sport', name: 'Sport', icon: 'IconSport', color: '#FF5A5F', type: 'expense', isDefault: true },
  { id: 'videogiochi', name: 'Videogiochi', icon: 'IconVideogiochi', color: '#3B4FCB', type: 'expense', isDefault: true },
  { id: 'trasporti', name: 'Trasporti', icon: 'IconTrasporti', color: '#8E97A8', type: 'expense', isDefault: true },
  { id: 'salute', name: 'Salute', icon: 'IconSalute', color: '#FF8A8A', type: 'expense', isDefault: true },
  { id: 'ristoranti', name: 'Ristoranti', icon: 'IconRistoranti', color: '#E0A73A', type: 'expense', isDefault: true },
  { id: 'abbonamenti', name: 'Abbonamenti', icon: 'IconAbbonamenti', color: '#6C63FF', type: 'expense', isDefault: true },
  { id: 'stipendio', name: 'Stipendio', icon: 'IconStipendio', color: '#2ECC71', type: 'income', isDefault: true },
  { id: 'varie', name: 'Varie', icon: 'IconVarie', color: '#9497A3', type: 'both', isDefault: true },
]

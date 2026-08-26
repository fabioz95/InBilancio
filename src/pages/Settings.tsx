import { ProfileSection } from './settings/ProfileSection'
import { LinkedAccountsSection } from './settings/LinkedAccountsSection'
import { CategoriesSection } from './settings/CategoriesSection'
import { AccountsSection } from './settings/AccountsSection'
import { PreferencesSection } from './settings/PreferencesSection'
import { DataSection } from './settings/DataSection'
import { RecurringSection } from './settings/RecurringSection'

export function Settings() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-fg md:text-2xl">Impostazioni</h1>

      {/*
        Da desktop le card hanno altezze molto diverse tra loro: una griglia a
        righe (grid-cols-2) forzerebbe ogni riga all'altezza della card più
        alta, lasciando vuoti sotto quelle più basse. Le colonne CSS invece
        scorrono il contenuto in ordine naturale riempiendo una colonna alla
        volta (bilanciandole), senza vincolare le altezze tra loro: da mobile
        restano semplicemente impilate in un'unica colonna, come prima.
      */}
      <div className="flex flex-col gap-6 md:block md:columns-2 md:gap-6">
        <div className="md:mb-6 md:break-inside-avoid">
          <ProfileSection />
        </div>
        <div className="md:mb-6 md:break-inside-avoid">
          <LinkedAccountsSection />
        </div>
        <div className="md:mb-6 md:break-inside-avoid">
          <PreferencesSection />
        </div>
        <div className="md:mb-6 md:break-inside-avoid">
          <CategoriesSection />
        </div>
        <div className="md:mb-6 md:break-inside-avoid">
          <AccountsSection />
        </div>
      </div>

      <DataSection />
      <RecurringSection />
    </div>
  )
}

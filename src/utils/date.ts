const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

const WEEKDAYS_IT = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']

export function formatMonthYear(date: Date): string {
  return `${MONTHS_IT[date.getMonth()]} ${date.getFullYear()}`
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

export function startOfDay(date: Date | number): number {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Etichetta di gruppo per una data: "Oggi", "Ieri" o "16 Ago". */
export function dayGroupLabel(date: Date): string {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  if (isSameDay(date, now)) return 'Oggi'
  if (isSameDay(date, yesterday)) return 'Ieri'

  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
  return `${date.getDate()} ${months[date.getMonth()]}`
}

export function dayGroupKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function weekdayShort(date: Date): string {
  return WEEKDAYS_IT[date.getDay()]
}

export function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fromDateInputValue(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

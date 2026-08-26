export function formatCurrency(amount: number, currency = 'EUR', locale = 'it-IT'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatSignedCurrency(amount: number, currency = 'EUR'): string {
  const formatted = formatCurrency(Math.abs(amount), currency)
  return amount < 0 ? `-${formatted}` : amount > 0 ? `+${formatted}` : formatted
}

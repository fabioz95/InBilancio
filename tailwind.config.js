/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Ognuno di questi legge una CSS custom property definita in index.css,
        // che cambia valore in base al tema (scuro/chiaro) applicato su <html>.
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        income: 'rgb(var(--color-income) / <alpha-value>)',
        expense: 'rgb(var(--color-expense) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        fab: '0 8px 24px rgba(109, 93, 252, 0.45)',
      },
    },
  },
  plugins: [],
}

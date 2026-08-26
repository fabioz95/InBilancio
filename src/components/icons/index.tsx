import type { SVGProps } from 'react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function base({ size = 22, strokeWidth = 1.8, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  }
}

/* ---------------------------- Navigazione UI ---------------------------- */

export function IconEye(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconSettings(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h11M4 12h16M4 17h11" />
      <circle cx="18" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  )
}

export function IconBriefcase(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  )
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  )
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-1 0v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function IconEdit(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

export function IconLogout(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

export function IconDownload(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  )
}

export function IconArrowUp(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  )
}

export function IconArrowDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  )
}

export function IconTransfer(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 7h13l-4-4" />
      <path d="M17 17H4l4 4" />
    </svg>
  )
}

export function IconRepeat(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M17 2 21 6l-4 4" />
      <path d="M3 12v-2a4 4 0 0 1 4-4h14" />
      <path d="M7 22 3 18l4-4" />
      <path d="M21 12v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

export function IconLink(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 12h6" />
      <path d="M10.5 6H8a6 6 0 0 0 0 12h2.5" />
      <path d="M13.5 6H16a6 6 0 0 1 0 12h-2.5" />
    </svg>
  )
}

export function IconWallet(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="16" cy="14" r="1.5" />
    </svg>
  )
}

export function IconBank(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 10 12 4l9 6" />
      <path d="M5 10v9M10 10v9M14 10v9M19 10v9" />
      <path d="M3 21h18" />
    </svg>
  )
}

export function IconCard(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  )
}

export function IconUser(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

export function IconArrowLeft(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 12H6" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  )
}

export function IconChartBar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
      <path d="M3 20h18" />
    </svg>
  )
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function IconGoogle(props: IconProps) {
  const { size = 20 } = props
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.28 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.26a12 12 0 0 0 0 10.75l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.63l4.01 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}

/* ------------------------------ Categorie -------------------------------- */

export function IconCibo(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 2v8M5 2v5a2 2 0 0 0 4 0V2M7 10v12" />
      <path d="M17 2c-1.5 1-2.5 3-2.5 5.5 0 2 1 3.5 2.5 4v10.5" />
    </svg>
  )
}

export function IconCasa(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m3 11 9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  )
}

export function IconBolletteGas(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2s-5 5.5-5 10a5 5 0 0 0 10 0c0-1.5-.8-2.7-1.6-3.7.1 1.3-.4 2-1 2.3.3-2.2-.8-4-2.4-5.6-.2 1-.7 1.7-1.4 2.1.2-1.9-.4-3.5-1.6-5.1Z" />
    </svg>
  )
}

export function IconBolletteElettrico(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  )
}

export function IconSpesa(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6" />
      <circle cx="9" cy="21" r="1.4" />
      <circle cx="18" cy="21" r="1.4" />
    </svg>
  )
}

export function IconShopping(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

export function IconHobby(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1 .8-1.5 1.8-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z" />
      <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconSport(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="19" cy="12" r="2.5" />
      <path d="M7.5 12h9" />
      <path d="M3 9v6M21 9v6" />
    </svg>
  )
}

export function IconVideogiochi(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 9h12a4 4 0 0 1 4 4v2a3 3 0 0 1-5.5 1.7L15 15H9l-1.5 1.7A3 3 0 0 1 2 15v-2a4 4 0 0 1 4-4Z" />
      <path d="M8 11v3M6.5 12.5h3" />
      <circle cx="16" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconTrasporti(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 16V9a2 2 0 0 1 1.4-1.9L7 6.5h10l1.6.6A2 2 0 0 1 20 9v7" />
      <path d="M4 16h16v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Z" />
      <circle cx="7.5" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconSalute(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

export function IconRistoranti(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 3v6a3 3 0 0 0 6 0V3" />
      <path d="M8 9v12" />
      <path d="M17 3s-2 2-2 5 2 4 2 4v9" />
    </svg>
  )
}

export function IconAbbonamenti(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="m10.5 8 4 2.2-4 2.2V8Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconStipendio(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 6v.01M18 18v-.01" />
    </svg>
  )
}

export function IconVarie(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  )
}

export const CATEGORY_ICONS = {
  IconCibo,
  IconCasa,
  IconBolletteGas,
  IconBolletteElettrico,
  IconSpesa,
  IconShopping,
  IconHobby,
  IconSport,
  IconVideogiochi,
  IconTrasporti,
  IconSalute,
  IconRistoranti,
  IconAbbonamenti,
  IconStipendio,
  IconVarie,
} as const

export type CategoryIconName = keyof typeof CATEGORY_ICONS

import { IconEye, IconBriefcase, IconChartBar, type IconProps } from '../icons'
import type { ComponentType } from 'react'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<IconProps>
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Quadro generale', icon: IconEye },
  { to: '/grafici', label: 'Grafici', icon: IconChartBar },
  { to: '/impostazioni', label: 'Impostazioni', icon: IconBriefcase },
]

import { CATEGORY_ICONS, IconVarie, type CategoryIconName } from './icons'

interface CategoryIconProps {
  icon: string
  color: string
  size?: number
  circleSize?: number
}

export function CategoryIcon({ icon, color, size = 20, circleSize = 40 }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[icon as CategoryIconName] ?? IconVarie
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: circleSize,
        height: circleSize,
        backgroundColor: `${color}26`,
        color,
      }}
    >
      <Icon size={size} />
    </span>
  )
}

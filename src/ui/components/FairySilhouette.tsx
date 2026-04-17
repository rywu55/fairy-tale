import type { Element } from '../../game/types'

const ELEMENT_COLORS: Record<Element, string> = {
  fire: '#FF6B35',
  water: '#4ECDC4',
  earth: '#8B7355',
  wind: '#A8E6CF',
  light: '#FFE66D',
}

interface Props {
  element: Element
  size?: number
}

export function FairySilhouette({ element, size = 80 }: Props) {
  const color = ELEMENT_COLORS[element]
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Body */}
      <ellipse cx="40" cy="52" rx="12" ry="16" fill={color} opacity="0.9" />
      {/* Head */}
      <circle cx="40" cy="30" r="10" fill={color} />
      {/* Left wing */}
      <ellipse cx="22" cy="44" rx="14" ry="8" fill={color} opacity="0.6" transform="rotate(-20 22 44)" />
      {/* Right wing */}
      <ellipse cx="58" cy="44" rx="14" ry="8" fill={color} opacity="0.6" transform="rotate(20 58 44)" />
      {/* Glow */}
      <circle cx="40" cy="40" r="36" fill={color} opacity="0.08" />
    </svg>
  )
}

export function getElementColor(element: Element): string {
  return ELEMENT_COLORS[element]
}

import type { Attributes, AttributeKey, Element } from '../../game/types'
import { ATTRIBUTE_KEYS, ATTRIBUTE_LABELS } from '../../game/types'
import { getSpriteCeiling } from '../../game/fairy'

interface Props {
  element: Element
  points: Attributes
  remainingPoints: number
  onAllocate: (key: AttributeKey, delta: number) => void
}

const BASE = 15
const POINT_VALUE = 5

export function AttributeAllocator({ element, points, remainingPoints, onAllocate }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: '#9ca3af', fontSize: 13 }}>Points remaining</span>
        <span style={{ color: '#facc15', fontWeight: 'bold' }}>{remainingPoints}</span>
      </div>
      {ATTRIBUTE_KEYS.map((key) => {
        const ceiling = getSpriteCeiling(element, key)
        const currentValue = BASE + points[key] * POINT_VALUE
        const atCeiling = currentValue >= ceiling
        const canAdd = remainingPoints > 0 && !atCeiling
        const canRemove = points[key] > 0

        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 100, fontSize: 13 }}>{ATTRIBUTE_LABELS[key]}</span>
            <button
              onClick={() => canRemove && onAllocate(key, -1)}
              disabled={!canRemove}
              style={btnStyle(!canRemove)}
            >−</button>
            <span style={{ width: 28, textAlign: 'center', fontSize: 14, fontWeight: 'bold' }}>
              {currentValue}
            </span>
            <button
              onClick={() => canAdd && onAllocate(key, 1)}
              disabled={!canAdd}
              style={btnStyle(!canAdd)}
            >+</button>
            <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 4 }}>
              / {ceiling}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function btnStyle(disabled: boolean) {
  return {
    width: 28,
    height: 28,
    background: disabled ? '#1f2937' : '#374151',
    color: disabled ? '#4b5563' : '#f9fafb',
    border: '1px solid #4b5563',
    borderRadius: 4,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 16,
    lineHeight: 1,
  } as React.CSSProperties
}

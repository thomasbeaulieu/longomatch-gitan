import type { ReactElement, MouseEvent } from 'react'

export interface ShotPoint {
  x: number
  y: number
  made: boolean | null
}

interface Props {
  shots?: ShotPoint[]
  onPick?: (x: number, y: number) => void
}

const W = 500
const H = 470
const LINE = '#c7cedb'
const COURT_FILL = '#132038'

function ShotChartCourt({ shots = [], onPick }: Props): ReactElement {
  function handleClick(evt: MouseEvent<SVGSVGElement>): void {
    if (!onPick) return
    const rect = evt.currentTarget.getBoundingClientRect()
    const x = (evt.clientX - rect.left) / rect.width
    const y = (evt.clientY - rect.top) / rect.height
    onPick(x, y)
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={onPick ? 'court-svg court-svg-clickable' : 'court-svg'}
      onClick={handleClick}
    >
      {/* terrain */}
      <rect x={10} y={10} width={W - 20} height={H - 20} fill={COURT_FILL} stroke={LINE} strokeWidth={2} />
      {/* ligne médiane (haut du demi-terrain) */}
      <line x1={10} y1={10} x2={W - 10} y2={10} stroke={LINE} strokeWidth={2} />
      {/* raquette */}
      <rect
        x={W / 2 - 80}
        y={H - 10 - 190}
        width={160}
        height={190}
        fill="none"
        stroke={LINE}
        strokeWidth={2}
      />
      {/* cercle lancer-francs */}
      <circle cx={W / 2} cy={H - 10 - 190} r={60} fill="none" stroke={LINE} strokeWidth={2} />
      {/* zone restrictive */}
      <path
        d={`M ${W / 2 - 40} ${H - 10} A 40 40 0 0 1 ${W / 2 + 40} ${H - 10}`}
        fill="none"
        stroke={LINE}
        strokeWidth={2}
      />
      {/* panier */}
      <circle cx={W / 2} cy={H - 10 - 40} r={7} fill="none" stroke="#3a86d1" strokeWidth={2} />
      {/* ligne à 3 points (arc simplifié) */}
      <path
        d={`M 30 ${H - 10} L 30 ${H - 10 - 90} A 220 220 0 0 1 ${W - 30} ${H - 10 - 90} L ${W - 30} ${H - 10}`}
        fill="none"
        stroke={LINE}
        strokeWidth={2}
      />

      {shots.map((s, i) => (
        <circle
          key={i}
          cx={s.x * W}
          cy={s.y * H}
          r={7}
          fill={s.made === null ? '#5a6478' : s.made ? '#2fa96a' : '#e5484d'}
          stroke="#0a0e16"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  )
}

export default ShotChartCourt

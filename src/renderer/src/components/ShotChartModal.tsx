import type { ReactElement } from 'react'
import ShotChartCourt from './ShotChartCourt'

interface Props {
  onPick: (x: number, y: number) => void
  onCancel: () => void
}

function ShotChartModal({ onPick, onCancel }: Props): ReactElement {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Position du tir</h3>
        <p className="modal-hint">Clique l'endroit du terrain d'où le tir a été pris.</p>
        <ShotChartCourt onPick={onPick} />
        <button className="modal-cancel" onClick={onCancel}>
          Passer (sans position)
        </button>
      </div>
    </div>
  )
}

export default ShotChartModal

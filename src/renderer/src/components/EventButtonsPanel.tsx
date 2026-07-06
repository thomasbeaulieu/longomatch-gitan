import { useState, type ReactElement } from 'react'
import { useAppStore } from '../state/store'
import { isPositiveEventType } from '@shared/event-classification'

interface Props {
  onTag: (eventTypeId: number) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  SHOT: 'Tirs',
  REBOUND: 'Rebonds',
  PASS: 'Passes',
  STEAL: 'Interceptions',
  BLOCK: 'Contres',
  TURNOVER: 'Pertes de balle',
  FOUL: 'Fautes',
  CUSTOM: 'Personnalisé'
}

const MERGED_ROWS: { label: string; categories: string[] }[] = [
  { label: 'Rebonds · Passes · Interceptions · Contres', categories: ['REBOUND', 'PASS', 'STEAL', 'BLOCK'] },
  { label: 'Pertes de balle · Fautes', categories: ['TURNOVER', 'FOUL'] }
]
const MERGED_CATEGORIES = new Set(MERGED_ROWS.flatMap((row) => row.categories))

function EventButtonsPanel({ onTag }: Props): ReactElement {
  const eventTypes = useAppStore((s) => s.eventTypes)
  const activePlayerId = useAppStore((s) => s.activePlayerId)
  const players = useAppStore((s) => s.players)
  const currentProject = useAppStore((s) => s.currentProject)
  const addEventType = useAppStore((s) => s.addEventType)
  const activePlayer = players.find((p) => p.id === activePlayerId)

  const [customLabel, setCustomLabel] = useState('')
  const [customColor, setCustomColor] = useState('#3a86d1')

  const categories = Array.from(new Set(eventTypes.map((t) => t.category)))
  const shotTypes = eventTypes.filter((t) => t.category === 'SHOT')
  const customTypes = eventTypes.filter((t) => t.category === 'CUSTOM')
  const otherCategories = categories.filter(
    (c) => c !== 'SHOT' && c !== 'CUSTOM' && !MERGED_CATEGORIES.has(c)
  )

  function renderButton(t: (typeof eventTypes)[number]): ReactElement {
    const isShot = t.category === 'SHOT'
    if (isShot) {
      const positive = isPositiveEventType(t.category, t.isMade)
      return (
        <button
          key={t.id}
          className={`event-btn ${positive ? 'event-btn-positive' : 'event-btn-negative'}`}
          onClick={() => onTag(t.id)}
        >
          {t.label}
          {t.hotkey && <span className="event-btn-hotkey">{t.hotkey}</span>}
        </button>
      )
    }
    return (
      <button
        key={t.id}
        className="event-btn"
        style={{ borderLeftColor: t.color ?? '#8993a8' }}
        onClick={() => onTag(t.id)}
      >
        {t.label}
        {t.hotkey && <span className="event-btn-hotkey">{t.hotkey}</span>}
      </button>
    )
  }

  async function handleAddCustom(): Promise<void> {
    if (!currentProject || !customLabel.trim()) return
    const created = await window.houd.eventTypeCreate({
      projectId: currentProject.id,
      label: customLabel.trim(),
      color: customColor
    })
    addEventType(created)
    setCustomLabel('')
  }

  return (
    <div className="event-buttons-panel">
      <p className="active-player-hint">
        {activePlayer
          ? `Joueur actif : ${activePlayer.firstName} ${activePlayer.lastName}`
          : "Aucun joueur sélectionné — l'event sera créé sans joueur"}
      </p>

      {shotTypes.length > 0 && (
        <div className="event-category-group">
          <div className="event-category-label">{CATEGORY_LABELS.SHOT}</div>
          <div className="event-buttons-grid">{shotTypes.map(renderButton)}</div>
        </div>
      )}

      {MERGED_ROWS.map((row) => {
        const rowTypes = eventTypes.filter((t) => row.categories.includes(t.category))
        if (rowTypes.length === 0) return null
        return (
          <div key={row.label} className="event-category-group">
            <div className="event-category-label">{row.label}</div>
            <div className="event-buttons-grid">{rowTypes.map(renderButton)}</div>
          </div>
        )
      })}

      {otherCategories.map((category) => (
        <div key={category} className="event-category-group">
          <div className="event-category-label">{CATEGORY_LABELS[category] ?? category}</div>
          <div className="event-buttons-grid">
            {eventTypes.filter((t) => t.category === category).map(renderButton)}
          </div>
        </div>
      ))}

      {customTypes.length > 0 && (
        <div className="event-category-group">
          <div className="event-category-label">{CATEGORY_LABELS.CUSTOM}</div>
          <div className="event-buttons-grid">{customTypes.map(renderButton)}</div>
        </div>
      )}

      <div className="event-category-group custom-action-form">
        <div className="event-category-label">Ajouter une action personnalisée</div>
        <div className="add-custom-action-row">
          <input
            type="text"
            placeholder="Nom de l'action (ex: Ballon perdu sorti)"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
          />
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            title="Couleur de l'action"
          />
          <button onClick={handleAddCustom}>Ajouter</button>
        </div>
      </div>
    </div>
  )
}

export default EventButtonsPanel

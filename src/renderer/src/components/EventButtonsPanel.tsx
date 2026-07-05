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
      {categories.map((category) => (
        <div key={category} className="event-category-group">
          <div className="event-category-label">{CATEGORY_LABELS[category] ?? category}</div>
          <div className="event-buttons-grid">
            {eventTypes
              .filter((t) => t.category === category)
              .map((t) => {
                const isCustom = t.category === 'CUSTOM'
                const positive = isPositiveEventType(t.category, t.isMade)
                return (
                  <button
                    key={t.id}
                    className={
                      isCustom
                        ? 'event-btn'
                        : `event-btn ${positive ? 'event-btn-positive' : 'event-btn-negative'}`
                    }
                    style={isCustom ? { borderLeftColor: t.color ?? '#8993a8' } : undefined}
                    onClick={() => onTag(t.id)}
                  >
                    {t.label}
                    {t.hotkey && <span className="event-btn-hotkey">{t.hotkey}</span>}
                  </button>
                )
              })}
          </div>
        </div>
      ))}

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

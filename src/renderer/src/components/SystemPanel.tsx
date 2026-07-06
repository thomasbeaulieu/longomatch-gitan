import { useState, type ReactElement } from 'react'
import { useAppStore } from '../state/store'

interface Props {
  onToggleSystem: (systemId: number) => void
}

function SystemPanel({ onToggleSystem }: Props): ReactElement {
  const systems = useAppStore((s) => s.systems)
  const activeSystemId = useAppStore((s) => s.activeSystemId)
  const addSystem = useAppStore((s) => s.addSystem)
  const removeSystem = useAppStore((s) => s.removeSystem)
  const clearActiveSystem = useAppStore((s) => s.clearActiveSystem)
  const currentProject = useAppStore((s) => s.currentProject)

  const [name, setName] = useState('')

  async function handleAdd(): Promise<void> {
    if (!currentProject || !name.trim()) return
    const sys = await window.houd.systemCreate({ projectId: currentProject.id, name: name.trim() })
    addSystem(sys)
    setName('')
  }

  async function handleRemove(id: number): Promise<void> {
    await window.houd.systemDelete(id)
    removeSystem(id)
  }

  return (
    <div className="system-panel">
      <span className="system-panel-label">Systèmes</span>

      {activeSystemId != null && (
        <button className="system-clear-btn" onClick={clearActiveSystem}>
          Jeu libre
        </button>
      )}

      <ul className="system-list">
        {systems.map((s) => (
          <li key={s.id} className="system-list-item">
            <button
              className={s.id === activeSystemId ? 'system-btn active' : 'system-btn'}
              onClick={() => onToggleSystem(s.id)}
            >
              {s.id === activeSystemId && <span className="system-recording-dot" />}
              {s.name}
            </button>
            <button
              className="system-remove-btn"
              title="Retirer ce système"
              onClick={() => handleRemove(s.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="add-system-form">
        <input
          type="text"
          placeholder="Nom du système"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleAdd} title="Ajouter système">
          +
        </button>
      </div>
    </div>
  )
}

export default SystemPanel

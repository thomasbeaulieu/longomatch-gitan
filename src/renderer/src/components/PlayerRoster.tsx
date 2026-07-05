import { useMemo, useState, type ReactElement } from 'react'
import { POSITION_ORDER, positionSortIndex } from '@shared/position-order'
import { useAppStore } from '../state/store'
import { toFileUrl } from '../lib/file-url'

function PlayerRoster(): ReactElement {
  const players = useAppStore((s) => s.players)
  const activePlayerId = useAppStore((s) => s.activePlayerId)
  const setActivePlayer = useAppStore((s) => s.setActivePlayer)
  const addPlayer = useAppStore((s) => s.addPlayer)
  const removePlayer = useAppStore((s) => s.removePlayer)
  const addPlaylist = useAppStore((s) => s.addPlaylist)
  const currentProject = useAppStore((s) => s.currentProject)
  const currentTeamId = useAppStore((s) => s.currentTeamId)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [jerseyNumber, setJerseyNumber] = useState('')
  const [position, setPosition] = useState('')
  const [photoPath, setPhotoPath] = useState<string | null>(null)

  const sortedPlayers = useMemo(
    () =>
      [...players].sort(
        (a, b) =>
          positionSortIndex(a.position) - positionSortIndex(b.position) ||
          (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999)
      ),
    [players]
  )

  async function handlePickPhoto(): Promise<void> {
    const path = await window.houd.imageSelectFile()
    if (path) setPhotoPath(path)
  }

  async function handleAddPlayer(): Promise<void> {
    if (!currentProject || !currentTeamId || !firstName.trim() || !lastName.trim()) return
    const result = await window.houd.playerCreate({
      projectId: currentProject.id,
      teamId: currentTeamId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      jerseyNumber: jerseyNumber ? Number(jerseyNumber) : null,
      position: position || null,
      photoPath
    })
    addPlayer(result.player)
    addPlaylist(result.playlist)
    setFirstName('')
    setLastName('')
    setJerseyNumber('')
    setPosition('')
    setPhotoPath(null)
  }

  async function handleRemovePlayer(id: number): Promise<void> {
    await window.houd.playerDelete(id)
    removePlayer(id)
    if (activePlayerId === id) setActivePlayer(null)
  }

  return (
    <div className="player-roster">
      <h3>Roster</h3>
      <ul className="player-list">
        {sortedPlayers.map((p) => (
          <li key={p.id} className="player-list-item">
            <button
              className={p.id === activePlayerId ? 'player-btn active' : 'player-btn'}
              onClick={() => setActivePlayer(p.id === activePlayerId ? null : p.id)}
            >
              {p.photoPath && (
                <img className="player-thumb" src={toFileUrl(p.photoPath)} alt="" />
              )}
              {p.jerseyNumber != null ? `#${p.jerseyNumber} ` : ''}
              {p.firstName} {p.lastName}
              {p.position ? ` (${p.position})` : ''}
            </button>
            <button
              className="player-remove-btn"
              title="Retirer du roster"
              onClick={() => handleRemovePlayer(p.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="add-player-form">
        <input
          type="text"
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="number"
          placeholder="N°"
          value={jerseyNumber}
          onChange={(e) => setJerseyNumber(e.target.value)}
        />
        <select value={position} onChange={(e) => setPosition(e.target.value)}>
          <option value="">Poste</option>
          {POSITION_ORDER.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
        <button type="button" onClick={handlePickPhoto}>
          {photoPath ? 'Photo ✓' : 'Choisir photo (optionnel)'}
        </button>
        <button onClick={handleAddPlayer}>Ajouter joueur</button>
      </div>
    </div>
  )
}

export default PlayerRoster

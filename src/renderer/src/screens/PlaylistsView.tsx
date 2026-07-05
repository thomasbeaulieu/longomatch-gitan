import { useState, type ReactElement } from 'react'
import { useAppStore } from '../state/store'
import { formatMs } from '../lib/format'
import { isPositiveEventType } from '@shared/event-classification'
import ClipPreviewModal from '../components/ClipPreviewModal'

function PlaylistsView(): ReactElement {
  const project = useAppStore((s) => s.currentProject)
  const events = useAppStore((s) => s.events)
  const playlists = useAppStore((s) => s.playlists)
  const playlistItems = useAppStore((s) => s.playlistItems)
  const addPlaylist = useAppStore((s) => s.addPlaylist)
  const removePlaylist = useAppStore((s) => s.removePlaylist)
  const addPlaylistItem = useAppStore((s) => s.addPlaylistItem)
  const removePlaylistItem = useAppStore((s) => s.removePlaylistItem)

  const [newName, setNewName] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportedPath, setExportedPath] = useState<string | null>(null)
  const [previewEventId, setPreviewEventId] = useState<number | null>(null)

  const selectedItems = playlistItems
    .filter((i) => i.playlistId === selectedId)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  async function handleCreate(): Promise<void> {
    if (!project || !newName.trim()) return
    const playlist = await window.houd.playlistCreate({ projectId: project.id, name: newName.trim() })
    addPlaylist(playlist)
    setSelectedId(playlist.id)
    setNewName('')
  }

  async function handleDelete(id: number): Promise<void> {
    await window.houd.playlistDelete(id)
    removePlaylist(id)
    if (selectedId === id) setSelectedId(null)
  }

  async function handleAddEvent(eventId: number): Promise<void> {
    if (!selectedId) return
    const item = await window.houd.playlistAddItem({ playlistId: selectedId, eventId })
    addPlaylistItem(item)
  }

  async function handleRemoveItem(itemId: number): Promise<void> {
    await window.houd.playlistRemoveItem(itemId)
    removePlaylistItem(itemId)
  }

  async function handleExport(): Promise<void> {
    if (!selectedId) return
    setExporting(true)
    setExportedPath(null)
    try {
      const result = await window.houd.playlistExport({ playlistId: selectedId })
      setExportedPath(result.filePath)
    } catch (err) {
      alert(`Erreur export playlist : ${err}`)
    } finally {
      setExporting(false)
    }
  }

  function eventDotProps(e: {
    eventTypeCategory: string
    eventTypeIsMade: boolean | null
    eventTypeColor: string | null
  }): { className: string; style?: { background: string } } {
    if (e.eventTypeCategory === 'CUSTOM') {
      return { className: 'timeline-dot', style: { background: e.eventTypeColor ?? '#8993a8' } }
    }
    const positive = isPositiveEventType(e.eventTypeCategory, e.eventTypeIsMade)
    return { className: `timeline-dot ${positive ? 'timeline-dot-positive' : 'timeline-dot-negative'}` }
  }

  const previewEvent = previewEventId != null ? events.find((e) => e.id === previewEventId) : null

  return (
    <div className="playlists-view">
      <div className="playlists-sidebar">
        <h3>Playlists</h3>
        <div className="new-playlist-form">
          <input
            type="text"
            placeholder="Nom playlist (ex: Paniers Tony)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button onClick={handleCreate}>Créer</button>
        </div>
        <ul className="playlist-list">
          {playlists.map((p) => {
            const count = playlistItems.filter((i) => i.playlistId === p.id).length
            return (
              <li key={p.id}>
                <button
                  className={selectedId === p.id ? 'playlist-select-btn active' : 'playlist-select-btn'}
                  onClick={() => setSelectedId(p.id)}
                >
                  {p.name} ({count})
                </button>
                <button className="playlist-delete-btn" onClick={() => handleDelete(p.id)}>
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="playlists-main">
        {!selectedId && <p>Sélectionne ou crée une playlist.</p>}

        {selectedId && (
          <>
            <div className="playlist-content-header">
              <h3>Contenu ({selectedItems.length})</h3>
              <button disabled={exporting || selectedItems.length === 0} onClick={handleExport}>
                {exporting ? 'Export...' : 'Exporter la playlist'}
              </button>
            </div>
            {exportedPath && <p className="export-success">Exporté : {exportedPath}</p>}

            <ul className="playlist-items-list">
              {selectedItems.map((item) => {
                const event = events.find((e) => e.id === item.eventId)
                if (!event) return null
                const dot = eventDotProps(event)
                return (
                  <li key={item.id} className="playlist-item-clickable" onClick={() => setPreviewEventId(event.id)}>
                    <span className={dot.className} style={dot.style} />
                    <span>{formatMs(event.videoTimestampMs)}</span>
                    <span>{event.eventTypeLabel}</span>
                    <span className="timeline-player">{event.playerLabel ?? '—'}</span>
                    {event.systemName && <span className="timeline-system">{event.systemName}</span>}
                    <button
                      className="timeline-delete"
                      onClick={(evt) => {
                        evt.stopPropagation()
                        handleRemoveItem(item.id)
                      }}
                    >
                      ✕
                    </button>
                  </li>
                )
              })}
            </ul>

            <h4>Ajouter un event à la playlist</h4>
            <ul className="playlist-add-list">
              {events.map((e) => {
                const dot = eventDotProps(e)
                return (
                  <li key={e.id}>
                    <span className={dot.className} style={dot.style} />
                    <span>{formatMs(e.videoTimestampMs)}</span>
                    <span>{e.eventTypeLabel}</span>
                    <span className="timeline-player">{e.playerLabel ?? '—'}</span>
                    {e.systemName && <span className="timeline-system">{e.systemName}</span>}
                    <button onClick={() => handleAddEvent(e.id)}>+ Ajouter</button>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>

      {previewEvent && (
        <ClipPreviewModal event={previewEvent} onClose={() => setPreviewEventId(null)} />
      )}
    </div>
  )
}

export default PlaylistsView

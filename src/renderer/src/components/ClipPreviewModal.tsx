import { useEffect, useRef, useState, type ReactElement } from 'react'
import type { GameEventDto } from '@shared/types'
import { useAppStore } from '../state/store'
import { toFileUrl } from '../lib/file-url'
import { formatMs } from '../lib/format'
import PlaybackSpeedControl from './PlaybackSpeedControl'

interface Props {
  event: GameEventDto
  onClose: () => void
}

function ClipPreviewModal({ event, onClose }: Props): ReactElement | null {
  const project = useAppStore((s) => s.currentProject)
  const updateEvent = useAppStore((s) => s.updateEvent)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [start, setStart] = useState(
    event.clipStartMs ?? Math.max(0, event.videoTimestampMs - 5000)
  )
  const [end, setEnd] = useState(event.clipEndMs ?? event.videoTimestampMs + 3000)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function seekAndPlay(): void {
      video!.currentTime = start / 1000
      video!.play().catch(() => {})
    }

    if (video.readyState >= 1) {
      seekAndPlay()
      return undefined
    }
    video.addEventListener('loadedmetadata', seekAndPlay, { once: true })
    return () => video.removeEventListener('loadedmetadata', seekAndPlay)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function markStart(): void {
    if (videoRef.current) setStart(Math.round(videoRef.current.currentTime * 1000))
  }

  function markEnd(): void {
    if (videoRef.current) setEnd(Math.round(videoRef.current.currentTime * 1000))
  }

  async function handleSave(): Promise<void> {
    setSaving(true)
    try {
      const updated = await window.houd.eventUpdateClip({
        id: event.id,
        clipStartMs: start,
        clipEndMs: end
      })
      updateEvent(updated)
      onClose()
    } catch (err) {
      alert(`Erreur sauvegarde bornes : ${err}`)
    } finally {
      setSaving(false)
    }
  }

  if (!project) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content clip-preview-modal">
        <h3>
          {event.eventTypeLabel}
          {event.playerLabel ? ` — ${event.playerLabel}` : ''}
          {event.systemName ? ` (${event.systemName})` : ''}
        </h3>
        <video ref={videoRef} src={toFileUrl(project.videoPath)} controls className="clip-preview-video" />
        <PlaybackSpeedControl videoRef={videoRef} />

        <div className="clip-bounds-info">
          Début : <strong>{formatMs(start)}</strong> — Fin : <strong>{formatMs(end)}</strong>
        </div>
        <p className="modal-hint">
          Navigue librement dans la vidéo (avant/après l'extrait actuel), puis utilise les boutons
          ci-dessous pour redéfinir les bornes à la position courante.
        </p>
        <div className="clip-bounds-controls">
          <button onClick={markStart}>Nouveau début ici</button>
          <button onClick={markEnd}>Nouvelle fin ici</button>
        </div>

        <div className="modal-actions">
          <button className="btn-primary" disabled={saving || end <= start} onClick={handleSave}>
            {saving ? 'Sauvegarde...' : 'Enregistrer les bornes'}
          </button>
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}

export default ClipPreviewModal

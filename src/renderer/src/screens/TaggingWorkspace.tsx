import { useEffect, useRef, useState, type ReactElement } from 'react'
import { useAppStore } from '../state/store'
import { toFileUrl } from '../lib/file-url'
import PlayerRoster from '../components/PlayerRoster'
import SystemPanel from '../components/SystemPanel'
import EventButtonsPanel from '../components/EventButtonsPanel'
import EventsTimeline from '../components/EventsTimeline'
import ShotChartModal from '../components/ShotChartModal'
import DrawingEditorModal from '../components/DrawingEditorModal'
import ClipPreviewModal from '../components/ClipPreviewModal'
import PlaybackSpeedControl from '../components/PlaybackSpeedControl'
import StatsView from './StatsView'
import PlaylistsView from './PlaylistsView'

type Tab = 'tagging' | 'stats' | 'playlists'

function TaggingWorkspace(): ReactElement {
  const project = useAppStore((s) => s.currentProject)
  const activePlayerId = useAppStore((s) => s.activePlayerId)
  const activeSystemId = useAppStore((s) => s.activeSystemId)
  const systemStartMs = useAppStore((s) => s.systemStartMs)
  const startSystem = useAppStore((s) => s.startSystem)
  const clearActiveSystem = useAppStore((s) => s.clearActiveSystem)
  const currentQuarter = useAppStore((s) => s.currentQuarter)
  const setQuarter = useAppStore((s) => s.setQuarter)
  const addEvent = useAppStore((s) => s.addEvent)
  const addShot = useAppStore((s) => s.addShot)
  const addPlaylistItem = useAppStore((s) => s.addPlaylistItem)
  const events = useAppStore((s) => s.events)
  const eventTypes = useAppStore((s) => s.eventTypes)
  const goHome = useAppStore((s) => s.goHome)

  const videoRef = useRef<HTMLVideoElement>(null)
  const [tab, setTab] = useState<Tab>('tagging')
  const [pendingShotEventId, setPendingShotEventId] = useState<number | null>(null)
  const [drawingEventId, setDrawingEventId] = useState<number | null>(null)
  const [previewEventId, setPreviewEventId] = useState<number | null>(null)

  async function handleTag(eventTypeId: number): Promise<void> {
    if (!project || !videoRef.current) return
    const videoTimestampMs = Math.round(videoRef.current.currentTime * 1000)

    const result = await window.houd.eventCreate({
      projectId: project.id,
      eventTypeId,
      playerId: activePlayerId,
      systemId: activeSystemId,
      clipStartMsOverride: activeSystemId != null ? systemStartMs : null,
      quarter: currentQuarter,
      videoTimestampMs
    })
    addEvent(result.event)
    if (result.autoPlaylistItem) addPlaylistItem(result.autoPlaylistItem)
    if (activeSystemId != null) clearActiveSystem()

    const eventType = eventTypes.find((t) => t.id === eventTypeId)
    if (eventType?.requiresShotLocation) {
      videoRef.current.pause()
      setPendingShotEventId(result.event.id)
    }
  }

  function handleToggleSystem(systemId: number): void {
    if (activeSystemId === systemId) {
      clearActiveSystem()
      return
    }
    const video = videoRef.current
    if (!video) return
    startSystem(systemId, Math.round(video.currentTime * 1000))
  }

  // Raccourcis clavier de tagging — inactifs pendant la saisie dans un input/select
  // ou pendant qu'une modale (shot chart / dessin / preview) est ouverte.
  useEffect(() => {
    if (tab !== 'tagging' || !project?.videoExists) return
    if (pendingShotEventId != null || drawingEventId != null || previewEventId != null) return

    function onKeyDown(e: KeyboardEvent): void {
      const target = e.target as HTMLElement
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return

      const eventType = eventTypes.find((t) => t.hotkey?.toLowerCase() === e.key.toLowerCase())
      if (eventType) {
        e.preventDefault()
        void handleTag(eventType.id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tab,
    project?.videoExists,
    pendingShotEventId,
    drawingEventId,
    previewEventId,
    eventTypes,
    activePlayerId,
    activeSystemId,
    systemStartMs,
    currentQuarter
  ])

  if (!project) return <p>Aucun projet ouvert.</p>

  async function handleShotPick(x: number, y: number): Promise<void> {
    if (pendingShotEventId == null) return
    const shot = await window.houd.shotCreate({ eventId: pendingShotEventId, x, y })
    addShot(shot)
    setPendingShotEventId(null)
  }

  function handleAnnotate(eventId: number): void {
    const event = events.find((e) => e.id === eventId)
    const video = videoRef.current
    if (!event || !video) return

    video.pause()

    const onSeeked = (): void => {
      video.removeEventListener('seeked', onSeeked)
      setDrawingEventId(eventId)
    }
    video.addEventListener('seeked', onSeeked)
    video.currentTime = event.videoTimestampMs / 1000
  }

  const previewEvent = previewEventId != null ? events.find((e) => e.id === previewEventId) : null

  return (
    <div className="tagging-workspace">
      <header className="workspace-header">
        <button className="back-btn" onClick={goHome}>
          ← Projets
        </button>
        <h2>{project.name}</h2>
        <div className="tab-selector">
          <button
            className={tab === 'tagging' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setTab('tagging')}
          >
            Tagging
          </button>
          <button
            className={tab === 'stats' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setTab('stats')}
          >
            Stats
          </button>
          <button
            className={tab === 'playlists' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setTab('playlists')}
          >
            Playlists
          </button>
        </div>
        {tab === 'tagging' && (
          <div className="quarter-selector">
            {[1, 2, 3, 4].map((q) => (
              <button
                key={q}
                className={q === currentQuarter ? 'quarter-btn active' : 'quarter-btn'}
                onClick={() => setQuarter(q)}
              >
                Q{q}
              </button>
            ))}
          </div>
        )}
      </header>

      {tab === 'tagging' && !project.videoExists && (
        <div className="video-missing-banner">
          <p>
            Fichier vidéo introuvable : <code>{project.videoPath}</code>
          </p>
          <p>
            Le fichier a peut-être été déplacé ou supprimé. Remets-le à cet emplacement pour
            reprendre le tagging.
          </p>
        </div>
      )}

      {tab === 'tagging' && project.videoExists && (
        <>
          <div className="workspace-body">
            <div className="workspace-main">
              <video
                ref={videoRef}
                src={toFileUrl(project.videoPath)}
                controls
                className="video-player"
              />
              <PlaybackSpeedControl videoRef={videoRef} />
              <EventButtonsPanel onTag={handleTag} />
            </div>

            <div className="workspace-sidebar">
              <PlayerRoster />
              <SystemPanel onToggleSystem={handleToggleSystem} />
            </div>
          </div>

          <EventsTimeline onOpenPreview={setPreviewEventId} onAnnotate={handleAnnotate} />
        </>
      )}

      {tab === 'stats' && <StatsView />}
      {tab === 'playlists' && <PlaylistsView />}

      {pendingShotEventId != null && (
        <ShotChartModal onPick={handleShotPick} onCancel={() => setPendingShotEventId(null)} />
      )}

      {drawingEventId != null && (
        <DrawingEditorModal
          eventId={drawingEventId}
          videoRef={videoRef}
          onClose={() => setDrawingEventId(null)}
        />
      )}

      {previewEvent && <ClipPreviewModal event={previewEvent} onClose={() => setPreviewEventId(null)} />}
    </div>
  )
}

export default TaggingWorkspace

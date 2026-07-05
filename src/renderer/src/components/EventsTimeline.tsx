import { useState, type ReactElement, type MouseEvent } from 'react'
import { useAppStore } from '../state/store'
import { formatMs } from '../lib/format'
import { renderOverlayPng } from '../lib/render-overlay-png'
import { isPositiveEventType } from '@shared/event-classification'

interface Props {
  onOpenPreview: (eventId: number) => void
  onAnnotate: (eventId: number) => void
}

function EventsTimeline({ onOpenPreview, onAnnotate }: Props): ReactElement {
  const project = useAppStore((s) => s.currentProject)
  const events = useAppStore((s) => s.events)
  const drawings = useAppStore((s) => s.drawings)
  const removeEvent = useAppStore((s) => s.removeEvent)
  const [exportingId, setExportingId] = useState<number | null>(null)
  const [exportedPaths, setExportedPaths] = useState<Record<number, string>>({})

  async function handleExport(eventId: number): Promise<void> {
    setExportingId(eventId)
    try {
      const eventDrawings = drawings.filter((d) => d.eventId === eventId)
      let overlayPngBase64: string | undefined
      if (eventDrawings.length > 0 && project?.videoWidth && project?.videoHeight) {
        overlayPngBase64 = renderOverlayPng(eventDrawings, project.videoWidth, project.videoHeight)
      }
      const clip = await window.houd.exportClip({ eventId, overlayPngBase64 })
      setExportedPaths((prev) => ({ ...prev, [eventId]: clip.filePath }))
    } catch (err) {
      alert(`Erreur export clip : ${err}`)
    } finally {
      setExportingId(null)
    }
  }

  async function handleDelete(eventId: number): Promise<void> {
    await window.houd.eventDelete(eventId)
    removeEvent(eventId)
  }

  function stop(e: MouseEvent): void {
    e.stopPropagation()
  }

  return (
    <div className="events-timeline">
      <h3>Timeline ({events.length})</h3>
      {events.length === 0 && <p>Aucun event tagué pour l'instant.</p>}
      <ul>
        {events.map((e) => {
          const hasDrawing = drawings.some((d) => d.eventId === e.id)
          const isCustom = e.eventTypeCategory === 'CUSTOM'
          const positive = isPositiveEventType(e.eventTypeCategory, e.eventTypeIsMade)
          return (
            <li
              key={e.id}
              className="timeline-item timeline-item-clickable"
              onClick={() => onOpenPreview(e.id)}
            >
              <span className="timeline-time">{formatMs(e.videoTimestampMs)}</span>
              <span
                className={
                  isCustom ? 'timeline-dot' : `timeline-dot ${positive ? 'timeline-dot-positive' : 'timeline-dot-negative'}`
                }
                style={isCustom ? { background: e.eventTypeColor ?? '#8993a8' } : undefined}
              />
              <span className="timeline-label">{e.eventTypeLabel}</span>
              <span className="timeline-player">{e.playerLabel ?? '—'}</span>
              {e.systemName && <span className="timeline-system">{e.systemName}</span>}
              <span className="timeline-quarter">Q{e.quarter}</span>
              <button
                className="timeline-annotate"
                onClick={(evt) => {
                  stop(evt)
                  onAnnotate(e.id)
                }}
              >
                {hasDrawing ? 'Annoté ✓' : 'Annoter'}
              </button>
              <button
                className="timeline-export"
                disabled={exportingId === e.id}
                onClick={(evt) => {
                  stop(evt)
                  handleExport(e.id)
                }}
              >
                {exportingId === e.id ? 'Export...' : exportedPaths[e.id] ? 'Exporté ✓' : 'Exporter clip'}
              </button>
              <button
                className="timeline-delete"
                onClick={(evt) => {
                  stop(evt)
                  handleDelete(e.id)
                }}
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default EventsTimeline

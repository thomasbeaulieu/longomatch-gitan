import { useEffect, useState, type ReactElement, type RefObject } from 'react'
import { Stage, Layer, Image as KonvaImage, Arrow, Circle } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useAppStore } from '../state/store'

interface Props {
  eventId: number
  videoRef: RefObject<HTMLVideoElement | null>
  onClose: () => void
}

const STAGE_WIDTH = 480

function DrawingEditorModal({ eventId, videoRef, onClose }: Props): ReactElement {
  const drawings = useAppStore((s) => s.drawings.filter((d) => d.eventId === eventId))
  const addDrawing = useAppStore((s) => s.addDrawing)

  const [tool, setTool] = useState<'ARROW' | 'CIRCLE'>('ARROW')
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [preview, setPreview] = useState<number[] | null>(null)
  const [saving, setSaving] = useState(false)

  const stageHeight = image ? (image.height / image.width) * STAGE_WIDTH : 270

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const img = new window.Image()
    img.onload = () => setImage(img)
    img.src = canvas.toDataURL('image/png')
  }, [videoRef])

  function handleMouseDown(e: KonvaEventObject<MouseEvent>): void {
    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return
    setDragStart(pos)
    setPreview([pos.x, pos.y, pos.x, pos.y])
  }

  function handleMouseMove(e: KonvaEventObject<MouseEvent>): void {
    if (!dragStart) return
    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return
    setPreview([dragStart.x, dragStart.y, pos.x, pos.y])
  }

  async function handleMouseUp(e: KonvaEventObject<MouseEvent>): Promise<void> {
    if (!dragStart) return
    const pos = e.target.getStage()?.getPointerPosition()
    setDragStart(null)
    setPreview(null)
    if (!pos) return

    const dx = pos.x - dragStart.x
    const dy = pos.y - dragStart.y
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return // clic sans drag, ignore

    let dataJson: string
    let color: string
    if (tool === 'ARROW') {
      dataJson = JSON.stringify({
        points: [
          dragStart.x / STAGE_WIDTH,
          dragStart.y / stageHeight,
          pos.x / STAGE_WIDTH,
          pos.y / stageHeight
        ]
      })
      color = '#ff3b30'
    } else {
      const r = Math.sqrt(dx * dx + dy * dy)
      dataJson = JSON.stringify({
        points: [dragStart.x / STAGE_WIDTH, dragStart.y / stageHeight, r / STAGE_WIDTH]
      })
      color = '#3498db'
    }

    setSaving(true)
    try {
      const created = await window.houd.drawingCreate({
        eventId,
        shapeType: tool,
        dataJson,
        color,
        strokeWidth: 4
      })
      addDrawing(created)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Annoter l'action</h3>
        <div className="drawing-tools">
          <button
            className={tool === 'ARROW' ? 'tool-btn active' : 'tool-btn'}
            onClick={() => setTool('ARROW')}
          >
            Flèche
          </button>
          <button
            className={tool === 'CIRCLE' ? 'tool-btn active' : 'tool-btn'}
            onClick={() => setTool('CIRCLE')}
          >
            Cercle
          </button>
          {saving && <span className="saving-hint">Sauvegarde...</span>}
        </div>

        {image && (
          <Stage
            width={STAGE_WIDTH}
            height={stageHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="drawing-stage"
          >
            <Layer>
              <KonvaImage image={image} width={STAGE_WIDTH} height={stageHeight} />

              {drawings.map((d) => {
                const data = JSON.parse(d.dataJson) as { points: number[] }
                if (d.shapeType === 'ARROW') {
                  const [x1, y1, x2, y2] = data.points
                  return (
                    <Arrow
                      key={d.id}
                      points={[x1 * STAGE_WIDTH, y1 * stageHeight, x2 * STAGE_WIDTH, y2 * stageHeight]}
                      stroke={d.color}
                      fill={d.color}
                      strokeWidth={d.strokeWidth}
                      pointerLength={14}
                      pointerWidth={14}
                    />
                  )
                }
                const [cx, cy, r] = data.points
                return (
                  <Circle
                    key={d.id}
                    x={cx * STAGE_WIDTH}
                    y={cy * stageHeight}
                    radius={r * STAGE_WIDTH}
                    stroke={d.color}
                    strokeWidth={d.strokeWidth}
                  />
                )
              })}

              {preview &&
                (tool === 'ARROW' ? (
                  <Arrow
                    points={preview}
                    stroke="#ff3b30"
                    fill="#ff3b30"
                    strokeWidth={4}
                    pointerLength={14}
                    pointerWidth={14}
                  />
                ) : (
                  <Circle
                    x={preview[0]}
                    y={preview[1]}
                    radius={Math.sqrt((preview[2] - preview[0]) ** 2 + (preview[3] - preview[1]) ** 2)}
                    stroke="#3498db"
                    strokeWidth={4}
                  />
                ))}
            </Layer>
          </Stage>
        )}

        <button className="modal-cancel" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  )
}

export default DrawingEditorModal

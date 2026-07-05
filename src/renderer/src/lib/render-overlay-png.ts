import Konva from 'konva'
import type { DrawingDto } from '@shared/types'

export function renderOverlayPng(drawings: DrawingDto[], width: number, height: number): string {
  const container = document.createElement('div')
  const stage = new Konva.Stage({ container, width, height })
  const layer = new Konva.Layer()
  stage.add(layer)

  for (const d of drawings) {
    const data = JSON.parse(d.dataJson) as { points: number[] }

    if (d.shapeType === 'ARROW') {
      const [x1, y1, x2, y2] = data.points
      layer.add(
        new Konva.Arrow({
          points: [x1 * width, y1 * height, x2 * width, y2 * height],
          stroke: d.color,
          fill: d.color,
          strokeWidth: d.strokeWidth,
          pointerLength: 16,
          pointerWidth: 16
        })
      )
    } else if (d.shapeType === 'CIRCLE') {
      const [cx, cy, r] = data.points
      layer.add(
        new Konva.Circle({
          x: cx * width,
          y: cy * height,
          radius: r * width,
          stroke: d.color,
          strokeWidth: d.strokeWidth
        })
      )
    }
  }

  layer.draw()
  const dataUrl = stage.toDataURL({ mimeType: 'image/png' })
  stage.destroy()
  return dataUrl.replace(/^data:image\/png;base64,/, '')
}

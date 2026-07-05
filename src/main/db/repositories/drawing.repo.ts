import { getDb } from '../connection'

export interface DrawingRow {
  id: number
  event_id: number
  shape_type: string
  data_json: string
  color: string
  stroke_width: number
}

export function createDrawing(input: {
  eventId: number
  shapeType: string
  dataJson: string
  color: string
  strokeWidth: number
}): DrawingRow {
  const db = getDb()
  const info = db
    .prepare(
      `INSERT INTO drawings (event_id, shape_type, data_json, color, stroke_width)
       VALUES (@eventId, @shapeType, @dataJson, @color, @strokeWidth)`
    )
    .run(input)
  return db.prepare('SELECT * FROM drawings WHERE id = ?').get(info.lastInsertRowid) as DrawingRow
}

export function listDrawingsByProject(projectId: number): DrawingRow[] {
  return getDb()
    .prepare(
      `SELECT d.* FROM drawings d JOIN events e ON e.id = d.event_id WHERE e.project_id = ?`
    )
    .all(projectId) as DrawingRow[]
}

export function listDrawingsByEvent(eventId: number): DrawingRow[] {
  return getDb().prepare('SELECT * FROM drawings WHERE event_id = ?').all(eventId) as DrawingRow[]
}

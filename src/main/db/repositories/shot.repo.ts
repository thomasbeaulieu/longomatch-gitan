import { getDb } from '../connection'

export interface ShotRow {
  id: number
  event_id: number
  x: number
  y: number
  distance_ft: number | null
}

export function createShot(input: { eventId: number; x: number; y: number }): ShotRow {
  const db = getDb()
  const info = db
    .prepare('INSERT INTO shots (event_id, x, y) VALUES (@eventId, @x, @y)')
    .run(input)
  return db.prepare('SELECT * FROM shots WHERE id = ?').get(info.lastInsertRowid) as ShotRow
}

export function listShotsByProject(projectId: number): ShotRow[] {
  return getDb()
    .prepare(
      `SELECT s.* FROM shots s JOIN events e ON e.id = s.event_id WHERE e.project_id = ?`
    )
    .all(projectId) as ShotRow[]
}

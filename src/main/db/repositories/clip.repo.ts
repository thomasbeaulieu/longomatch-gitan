import { getDb } from '../connection'

export interface ClipRow {
  id: number
  project_id: number
  event_id: number | null
  file_path: string
  start_ms: number
  end_ms: number
  has_overlay: number
  created_at: string
}

export function createClip(input: {
  projectId: number
  eventId: number | null
  filePath: string
  startMs: number
  endMs: number
  hasOverlay: boolean
}): ClipRow {
  const db = getDb()
  const info = db
    .prepare(
      `INSERT INTO clips (project_id, event_id, file_path, start_ms, end_ms, has_overlay)
       VALUES (@projectId, @eventId, @filePath, @startMs, @endMs, @hasOverlay)`
    )
    .run({ ...input, hasOverlay: input.hasOverlay ? 1 : 0 })
  return db.prepare('SELECT * FROM clips WHERE id = ?').get(info.lastInsertRowid) as ClipRow
}

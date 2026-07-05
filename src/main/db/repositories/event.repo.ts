import { getDb } from '../connection'

export interface EventRow {
  id: number
  project_id: number
  event_type_id: number
  player_id: number | null
  system_id: number | null
  quarter: number
  video_timestamp_ms: number
  clip_start_ms: number | null
  clip_end_ms: number | null
  notes: string | null
  created_at: string
}

export interface EventJoinedRow extends EventRow {
  event_type_code: string
  event_type_label: string
  event_type_color: string | null
  event_type_category: string
  event_type_points: number
  event_type_is_made: number | null
  event_type_requires_shot_location: number
  player_first_name: string | null
  player_last_name: string | null
  player_jersey_number: number | null
  system_name: string | null
}

const JOIN_SELECT = `
  SELECT e.*, et.code as event_type_code, et.label as event_type_label, et.color as event_type_color,
         et.category as event_type_category, et.points as event_type_points, et.is_made as event_type_is_made,
         et.requires_shot_location as event_type_requires_shot_location,
         p.first_name as player_first_name, p.last_name as player_last_name, p.jersey_number as player_jersey_number,
         sy.name as system_name
  FROM events e
  JOIN event_types et ON et.id = e.event_type_id
  LEFT JOIN players p ON p.id = e.player_id
  LEFT JOIN systems sy ON sy.id = e.system_id
`

export function createEvent(input: {
  projectId: number
  eventTypeId: number
  playerId: number | null
  systemId: number | null
  quarter: number
  videoTimestampMs: number
  clipStartMs: number
  clipEndMs: number
}): EventRow {
  const db = getDb()
  const info = db
    .prepare(
      `INSERT INTO events (project_id, event_type_id, player_id, system_id, quarter, video_timestamp_ms, clip_start_ms, clip_end_ms)
       VALUES (@projectId, @eventTypeId, @playerId, @systemId, @quarter, @videoTimestampMs, @clipStartMs, @clipEndMs)`
    )
    .run(input)
  return db.prepare('SELECT * FROM events WHERE id = ?').get(info.lastInsertRowid) as EventRow
}

export function getEventJoined(id: number): EventJoinedRow | undefined {
  return getDb().prepare(`${JOIN_SELECT} WHERE e.id = ?`).get(id) as EventJoinedRow | undefined
}

export function listEventsByProject(projectId: number): EventJoinedRow[] {
  return getDb()
    .prepare(`${JOIN_SELECT} WHERE e.project_id = ? ORDER BY e.video_timestamp_ms ASC`)
    .all(projectId) as EventJoinedRow[]
}

export function deleteEvent(id: number): void {
  getDb().prepare('DELETE FROM events WHERE id = ?').run(id)
}

export function updateEventClip(id: number, clipStartMs: number, clipEndMs: number): void {
  getDb()
    .prepare('UPDATE events SET clip_start_ms = ?, clip_end_ms = ? WHERE id = ?')
    .run(Math.max(0, clipStartMs), clipEndMs, id)
}

import { getDb } from '../connection'
import { DEFAULT_EVENT_TYPES } from '@shared/event-types.default'

export interface EventTypeRow {
  id: number
  project_id: number | null
  code: string
  label: string
  category: string
  points: number
  is_made: number | null
  requires_shot_location: number
  hotkey: string | null
  color: string | null
  sort_order: number
}

export function seedDefaultEventTypes(projectId: number): void {
  const db = getDb()
  const insert = db.prepare(`
    INSERT INTO event_types (project_id, code, label, category, points, is_made, requires_shot_location, color, hotkey, sort_order)
    VALUES (@projectId, @code, @label, @category, @points, @isMade, @requiresShotLocation, @color, @hotkey, @sortOrder)
  `)
  const tx = db.transaction(() => {
    DEFAULT_EVENT_TYPES.forEach((t, i) => {
      insert.run({ projectId, ...t, sortOrder: i })
    })
  })
  tx()
}

export function listEventTypes(projectId: number): EventTypeRow[] {
  return getDb()
    .prepare('SELECT * FROM event_types WHERE project_id = ? ORDER BY sort_order')
    .all(projectId) as EventTypeRow[]
}

export function createCustomEventType(input: {
  projectId: number
  label: string
  color: string
}): EventTypeRow {
  const db = getDb()
  const maxSortOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) as maxOrder FROM event_types WHERE project_id = ?')
    .get(input.projectId) as { maxOrder: number }

  const code = `CUSTOM_${Date.now()}`
  const info = db
    .prepare(
      `INSERT INTO event_types (project_id, code, label, category, points, is_made, requires_shot_location, color, hotkey, sort_order)
       VALUES (@projectId, @code, @label, 'CUSTOM', 0, NULL, 0, @color, NULL, @sortOrder)`
    )
    .run({
      projectId: input.projectId,
      code,
      label: input.label,
      color: input.color,
      sortOrder: maxSortOrder.maxOrder + 1
    })
  return db.prepare('SELECT * FROM event_types WHERE id = ?').get(info.lastInsertRowid) as EventTypeRow
}

import { getDb } from '../connection'

export interface SeasonEventRow {
  event_id: number
  project_id: number
  first_name: string
  last_name: string
  event_type_code: string
  event_type_points: number
  event_type_is_made: number | null
  event_type_category: string
}

export interface SeasonShotRow {
  first_name: string
  last_name: string
  x: number
  y: number
  event_type_is_made: number | null
}

export function listAllPlayerEvents(): SeasonEventRow[] {
  return getDb()
    .prepare(
      `SELECT e.id as event_id, e.project_id, p.first_name, p.last_name,
              et.code as event_type_code, et.points as event_type_points,
              et.is_made as event_type_is_made, et.category as event_type_category
       FROM events e
       JOIN players p ON p.id = e.player_id
       JOIN event_types et ON et.id = e.event_type_id
       WHERE e.player_id IS NOT NULL`
    )
    .all() as SeasonEventRow[]
}

export function listAllPlayerShots(): SeasonShotRow[] {
  return getDb()
    .prepare(
      `SELECT p.first_name, p.last_name, s.x, s.y, et.is_made as event_type_is_made
       FROM shots s
       JOIN events e ON e.id = s.event_id
       JOIN players p ON p.id = e.player_id
       JOIN event_types et ON et.id = e.event_type_id
       WHERE e.player_id IS NOT NULL`
    )
    .all() as SeasonShotRow[]
}

import { getDb } from '../connection'

export interface PlayerRow {
  id: number
  team_id: number
  first_name: string
  last_name: string
  jersey_number: number | null
  position: string | null
  photo_path: string | null
  is_active: number
}

export function createPlayer(input: {
  teamId: number
  firstName: string
  lastName: string
  jerseyNumber: number | null
  position: string | null
  photoPath: string | null
}): PlayerRow {
  const db = getDb()
  const info = db
    .prepare(
      `INSERT INTO players (team_id, first_name, last_name, jersey_number, position, photo_path)
       VALUES (@teamId, @firstName, @lastName, @jerseyNumber, @position, @photoPath)`
    )
    .run(input)
  return db.prepare('SELECT * FROM players WHERE id = ?').get(info.lastInsertRowid) as PlayerRow
}

export function listPlayersByTeam(teamId: number): PlayerRow[] {
  return getDb()
    .prepare('SELECT * FROM players WHERE team_id = ? AND is_active = 1 ORDER BY jersey_number')
    .all(teamId) as PlayerRow[]
}

export function deactivatePlayer(id: number): void {
  getDb().prepare('UPDATE players SET is_active = 0 WHERE id = ?').run(id)
}

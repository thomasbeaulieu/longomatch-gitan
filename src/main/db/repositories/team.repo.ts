import { getDb } from '../connection'

export interface TeamRow {
  id: number
  project_id: number
  name: string
  is_home: number
}

export function createTeam(input: { projectId: number; name: string }): TeamRow {
  const db = getDb()
  const info = db
    .prepare('INSERT INTO teams (project_id, name, is_home) VALUES (?, ?, 1)')
    .run(input.projectId, input.name)
  return db.prepare('SELECT * FROM teams WHERE id = ?').get(info.lastInsertRowid) as TeamRow
}

export function listTeamsByProject(projectId: number): TeamRow[] {
  return getDb().prepare('SELECT * FROM teams WHERE project_id = ?').all(projectId) as TeamRow[]
}

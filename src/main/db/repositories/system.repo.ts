import { getDb } from '../connection'

export interface SystemRow {
  id: number
  project_id: number
  name: string
  is_active: number
  created_at: string
}

export function createSystem(input: { projectId: number; name: string }): SystemRow {
  const db = getDb()
  const info = db
    .prepare('INSERT INTO systems (project_id, name) VALUES (?, ?)')
    .run(input.projectId, input.name)
  return db.prepare('SELECT * FROM systems WHERE id = ?').get(info.lastInsertRowid) as SystemRow
}

export function listSystemsByProject(projectId: number): SystemRow[] {
  return getDb()
    .prepare('SELECT * FROM systems WHERE project_id = ? AND is_active = 1 ORDER BY created_at')
    .all(projectId) as SystemRow[]
}

export function deactivateSystem(id: number): void {
  getDb().prepare('UPDATE systems SET is_active = 0 WHERE id = ?').run(id)
}

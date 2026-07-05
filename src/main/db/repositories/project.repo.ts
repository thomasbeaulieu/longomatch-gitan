import { getDb } from '../connection'

export interface ProjectRow {
  id: number
  name: string
  video_path: string
  video_duration_ms: number | null
  video_fps: number | null
  video_width: number | null
  video_height: number | null
  created_at: string
  updated_at: string
  notes: string | null
}

export function createProject(input: {
  name: string
  videoPath: string
  durationMs: number
  fps: number
  width: number
  height: number
}): ProjectRow {
  const db = getDb()
  const info = db
    .prepare(
      `INSERT INTO projects (name, video_path, video_duration_ms, video_fps, video_width, video_height)
       VALUES (@name, @videoPath, @durationMs, @fps, @width, @height)`
    )
    .run(input)
  return getProject(info.lastInsertRowid as number)!
}

export function getProject(id: number): ProjectRow | undefined {
  return getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined
}

export function listProjects(): ProjectRow[] {
  return getDb().prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as ProjectRow[]
}

export function deleteProject(id: number): void {
  getDb().prepare('DELETE FROM projects WHERE id = ?').run(id)
}

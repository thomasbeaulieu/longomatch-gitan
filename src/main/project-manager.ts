import { app } from 'electron'
import { join } from 'path'
import { mkdirSync, rmSync } from 'fs'

export function getProjectDataDir(projectId: number): string {
  const dir = join(app.getPath('userData'), 'projects', String(projectId))
  mkdirSync(dir, { recursive: true })
  return dir
}

export function getProjectClipsDir(projectId: number): string {
  const dir = join(getProjectDataDir(projectId), 'clips')
  mkdirSync(dir, { recursive: true })
  return dir
}

export function deleteProjectDataDir(projectId: number): void {
  const dir = join(app.getPath('userData'), 'projects', String(projectId))
  rmSync(dir, { recursive: true, force: true })
}

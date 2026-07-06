import { app } from 'electron'
import { join } from 'path'
import { mkdirSync, rmSync } from 'fs'

function sanitizeFolderName(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]/g, '-')
  return cleaned.length > 0 ? cleaned : 'Projet'
}

export function getProjectDataDir(projectName: string): string {
  const dir = join(app.getPath('userData'), 'projects', sanitizeFolderName(projectName))
  mkdirSync(dir, { recursive: true })
  return dir
}

export function getProjectClipsDir(projectName: string): string {
  const dir = join(getProjectDataDir(projectName), 'clips')
  mkdirSync(dir, { recursive: true })
  return dir
}

export function deleteProjectDataDir(projectName: string): void {
  const dir = join(app.getPath('userData'), 'projects', sanitizeFolderName(projectName))
  rmSync(dir, { recursive: true, force: true })
}

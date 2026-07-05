import { ipcMain } from 'electron'
import { getDb, getDbPath } from '../db/connection'
import { IpcChannels } from '@shared/ipc-channels'
import type { DbPingResult } from '@shared/types'

export function registerDbIpcHandlers(): void {
  ipcMain.handle(IpcChannels.dbPing, (): DbPingResult => {
    const db = getDb()
    const rows = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all() as { name: string }[]

    return {
      ok: true,
      tables: rows.map((r) => r.name).sort(),
      dbPath: getDbPath()
    }
  })
}

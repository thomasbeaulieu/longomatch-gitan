import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc-channels'
import type { SeasonStatsResult } from '@shared/types'
import { listAllPlayerEvents, listAllPlayerShots } from '../db/repositories/season.repo'
import { computeSeasonPlayerStats } from '../stats/compute-season-stats'

export function registerSeasonIpcHandlers(): void {
  ipcMain.handle(IpcChannels.seasonStats, (): SeasonStatsResult => {
    const events = listAllPlayerEvents()
    const players = computeSeasonPlayerStats(events)

    const shotRows = listAllPlayerShots()
    const shots = shotRows.map((s) => ({
      playerName: `${s.first_name} ${s.last_name}`,
      x: s.x,
      y: s.y,
      made: s.event_type_is_made === null ? null : !!s.event_type_is_made
    }))

    return { players, shots }
  })
}

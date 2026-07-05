import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc-channels'
import type { ShotCreateInput, ShotDto } from '@shared/types'
import { createShot } from '../db/repositories/shot.repo'
import { toShotDto } from '../mappers'

export function registerShotIpcHandlers(): void {
  ipcMain.handle(IpcChannels.shotCreate, (_event, input: ShotCreateInput): ShotDto => {
    return toShotDto(createShot(input))
  })
}

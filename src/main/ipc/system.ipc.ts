import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc-channels'
import type { SystemCreateInput, SystemDto } from '@shared/types'
import { createSystem, deactivateSystem } from '../db/repositories/system.repo'
import { toSystemDto } from '../mappers'

export function registerSystemIpcHandlers(): void {
  ipcMain.handle(IpcChannels.systemCreate, (_event, input: SystemCreateInput): SystemDto => {
    return toSystemDto(createSystem(input))
  })

  ipcMain.handle(IpcChannels.systemDelete, (_event, id: number): void => {
    deactivateSystem(id)
  })
}

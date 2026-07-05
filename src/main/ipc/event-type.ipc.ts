import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc-channels'
import type { EventTypeCreateInput, EventTypeDto } from '@shared/types'
import { createCustomEventType } from '../db/repositories/event-type.repo'
import { toEventTypeDto } from '../mappers'

export function registerEventTypeIpcHandlers(): void {
  ipcMain.handle(
    IpcChannels.eventTypeCreate,
    (_event, input: EventTypeCreateInput): EventTypeDto => {
      return toEventTypeDto(createCustomEventType(input))
    }
  )
}

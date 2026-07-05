import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc-channels'
import type { DrawingCreateInput, DrawingDto } from '@shared/types'
import { createDrawing } from '../db/repositories/drawing.repo'
import { toDrawingDto } from '../mappers'

export function registerDrawingIpcHandlers(): void {
  ipcMain.handle(IpcChannels.drawingCreate, (_event, input: DrawingCreateInput): DrawingDto => {
    return toDrawingDto(createDrawing(input))
  })
}

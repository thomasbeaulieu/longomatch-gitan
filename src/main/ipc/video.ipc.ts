import { ipcMain, dialog, BrowserWindow } from 'electron'
import { IpcChannels } from '@shared/ipc-channels'

export function registerVideoIpcHandlers(): void {
  ipcMain.handle(IpcChannels.videoSelectFile, async (event): Promise<string | null> => {
    const win = BrowserWindow.fromWebContents(event.sender) ?? undefined
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openFile'],
      filters: [{ name: 'Vidéos', extensions: ['mp4', 'mov', 'mkv', 'avi', 'm4v'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle(IpcChannels.imageSelectFile, async (event): Promise<string | null> => {
    const win = BrowserWindow.fromWebContents(event.sender) ?? undefined
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })
}

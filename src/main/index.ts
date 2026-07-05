import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerDbIpcHandlers } from './ipc/db.ipc'
import { registerProjectIpcHandlers } from './ipc/project.ipc'
import { registerVideoIpcHandlers } from './ipc/video.ipc'
import { registerPlayerIpcHandlers } from './ipc/player.ipc'
import { registerEventIpcHandlers } from './ipc/event.ipc'
import { registerExportIpcHandlers } from './ipc/export.ipc'
import { registerShotIpcHandlers } from './ipc/shot.ipc'
import { registerDrawingIpcHandlers } from './ipc/drawing.ipc'
import { registerPlaylistIpcHandlers } from './ipc/playlist.ipc'
import { registerSystemIpcHandlers } from './ipc/system.ipc'
import { registerEventTypeIpcHandlers } from './ipc/event-type.ipc'
import { registerSeasonIpcHandlers } from './ipc/season.ipc'

app.setName('Longomatch - Version Gitan')

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.uslavalbasket.longomatch-gitan')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerDbIpcHandlers()
  registerProjectIpcHandlers()
  registerVideoIpcHandlers()
  registerPlayerIpcHandlers()
  registerEventIpcHandlers()
  registerExportIpcHandlers()
  registerShotIpcHandlers()
  registerDrawingIpcHandlers()
  registerPlaylistIpcHandlers()
  registerSystemIpcHandlers()
  registerEventTypeIpcHandlers()
  registerSeasonIpcHandlers()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

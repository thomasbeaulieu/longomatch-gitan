import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc-channels'
import type { PlaylistCreateInput, PlaylistDto, PlaylistAddItemInput, PlaylistItemDto } from '@shared/types'
import {
  createPlaylist,
  deletePlaylist,
  addPlaylistItem,
  removePlaylistItem,
  listPlaylistItems
} from '../db/repositories/playlist.repo'
import { toPlaylistDto, toPlaylistItemDto } from '../mappers'

export function registerPlaylistIpcHandlers(): void {
  ipcMain.handle(IpcChannels.playlistCreate, (_event, input: PlaylistCreateInput): PlaylistDto => {
    return toPlaylistDto(createPlaylist(input))
  })

  ipcMain.handle(IpcChannels.playlistDelete, (_event, id: number): void => {
    deletePlaylist(id)
  })

  ipcMain.handle(
    IpcChannels.playlistAddItem,
    (_event, input: PlaylistAddItemInput): PlaylistItemDto => {
      const existing = listPlaylistItems(input.playlistId)
      const sortOrder = existing.length
      return toPlaylistItemDto(addPlaylistItem({ ...input, sortOrder }))
    }
  )

  ipcMain.handle(IpcChannels.playlistRemoveItem, (_event, id: number): void => {
    removePlaylistItem(id)
  })
}

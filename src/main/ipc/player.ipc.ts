import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc-channels'
import type { PlayerCreateInput, PlayerCreateResult } from '@shared/types'
import { createPlayer, deactivatePlayer } from '../db/repositories/player.repo'
import { createPlaylist } from '../db/repositories/playlist.repo'
import { toPlayerDto, toPlaylistDto } from '../mappers'

export function registerPlayerIpcHandlers(): void {
  ipcMain.handle(
    IpcChannels.playerCreate,
    (_event, input: PlayerCreateInput): PlayerCreateResult => {
      const player = createPlayer(input)
      const playlist = createPlaylist({
        projectId: input.projectId,
        name: `Paniers ${player.first_name} ${player.last_name}`,
        autoPlayerId: player.id
      })
      return { player: toPlayerDto(player), playlist: toPlaylistDto(playlist) }
    }
  )

  ipcMain.handle(IpcChannels.playerDelete, (_event, id: number): void => {
    deactivatePlayer(id)
  })
}

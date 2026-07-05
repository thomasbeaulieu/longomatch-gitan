import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc-channels'
import type {
  EventCreateInput,
  EventCreateResult,
  GameEventDto,
  ClipUpdateInput,
  PlaylistItemDto
} from '@shared/types'
import { createEvent, getEventJoined, deleteEvent, updateEventClip } from '../db/repositories/event.repo'
import {
  getAutoPlaylistForPlayer,
  addPlaylistItem,
  listPlaylistItems
} from '../db/repositories/playlist.repo'
import { toGameEventDto, toPlaylistItemDto } from '../mappers'

const CLIP_LEAD_MS = 5000
const CLIP_TAIL_MS = 3000
const MADE_BASKET_CODES = new Set(['FG2_MADE', 'FG3_MADE'])

export function registerEventIpcHandlers(): void {
  ipcMain.handle(
    IpcChannels.eventCreate,
    (_event, input: EventCreateInput): EventCreateResult => {
      const created = createEvent({
        projectId: input.projectId,
        eventTypeId: input.eventTypeId,
        playerId: input.playerId,
        systemId: input.systemId,
        quarter: input.quarter,
        videoTimestampMs: input.videoTimestampMs,
        clipStartMs:
          input.clipStartMsOverride != null
            ? Math.max(0, input.clipStartMsOverride)
            : Math.max(0, input.videoTimestampMs - CLIP_LEAD_MS),
        clipEndMs: input.videoTimestampMs + CLIP_TAIL_MS
      })
      const joined = getEventJoined(created.id)!

      let autoPlaylistItem: PlaylistItemDto | null = null
      if (MADE_BASKET_CODES.has(joined.event_type_code) && joined.player_id != null) {
        const autoPlaylist = getAutoPlaylistForPlayer(input.projectId, joined.player_id)
        if (autoPlaylist) {
          const sortOrder = listPlaylistItems(autoPlaylist.id).length
          const item = addPlaylistItem({
            playlistId: autoPlaylist.id,
            eventId: created.id,
            sortOrder
          })
          autoPlaylistItem = toPlaylistItemDto(item)
        }
      }

      return { event: toGameEventDto(joined), autoPlaylistItem }
    }
  )

  ipcMain.handle(IpcChannels.eventDelete, (_event, id: number): void => {
    deleteEvent(id)
  })

  ipcMain.handle(IpcChannels.eventUpdateClip, (_event, input: ClipUpdateInput): GameEventDto => {
    updateEventClip(input.id, input.clipStartMs, input.clipEndMs)
    return toGameEventDto(getEventJoined(input.id)!)
  })
}

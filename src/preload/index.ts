import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IpcChannels } from '@shared/ipc-channels'
import type {
  DbPingResult,
  ProjectCreateInput,
  ProjectDto,
  ProjectFullDto,
  PlayerCreateInput,
  PlayerCreateResult,
  EventCreateInput,
  EventCreateResult,
  GameEventDto,
  ClipUpdateInput,
  ExportClipInput,
  ClipDto,
  ShotCreateInput,
  ShotDto,
  DrawingCreateInput,
  DrawingDto,
  PlaylistCreateInput,
  PlaylistDto,
  PlaylistAddItemInput,
  PlaylistItemDto,
  PlaylistExportInput,
  StatsExportInput,
  SystemCreateInput,
  SystemDto,
  EventTypeCreateInput,
  EventTypeDto,
  SeasonStatsResult
} from '@shared/types'

const houdApi = {
  dbPing: (): Promise<DbPingResult> => ipcRenderer.invoke(IpcChannels.dbPing),

  projectCreate: (input: ProjectCreateInput): Promise<ProjectFullDto> =>
    ipcRenderer.invoke(IpcChannels.projectCreate, input),
  projectList: (): Promise<ProjectDto[]> => ipcRenderer.invoke(IpcChannels.projectList),
  projectOpen: (id: number): Promise<ProjectFullDto> =>
    ipcRenderer.invoke(IpcChannels.projectOpen, id),
  projectDelete: (id: number): Promise<void> => ipcRenderer.invoke(IpcChannels.projectDelete, id),

  videoSelectFile: (): Promise<string | null> => ipcRenderer.invoke(IpcChannels.videoSelectFile),
  imageSelectFile: (): Promise<string | null> => ipcRenderer.invoke(IpcChannels.imageSelectFile),

  playerCreate: (input: PlayerCreateInput): Promise<PlayerCreateResult> =>
    ipcRenderer.invoke(IpcChannels.playerCreate, input),
  playerDelete: (id: number): Promise<void> => ipcRenderer.invoke(IpcChannels.playerDelete, id),

  eventCreate: (input: EventCreateInput): Promise<EventCreateResult> =>
    ipcRenderer.invoke(IpcChannels.eventCreate, input),
  eventDelete: (id: number): Promise<void> => ipcRenderer.invoke(IpcChannels.eventDelete, id),
  eventUpdateClip: (input: ClipUpdateInput): Promise<GameEventDto> =>
    ipcRenderer.invoke(IpcChannels.eventUpdateClip, input),

  exportClip: (input: ExportClipInput): Promise<ClipDto> =>
    ipcRenderer.invoke(IpcChannels.exportClip, input),

  shotCreate: (input: ShotCreateInput): Promise<ShotDto> =>
    ipcRenderer.invoke(IpcChannels.shotCreate, input),

  drawingCreate: (input: DrawingCreateInput): Promise<DrawingDto> =>
    ipcRenderer.invoke(IpcChannels.drawingCreate, input),

  playlistCreate: (input: PlaylistCreateInput): Promise<PlaylistDto> =>
    ipcRenderer.invoke(IpcChannels.playlistCreate, input),
  playlistDelete: (id: number): Promise<void> => ipcRenderer.invoke(IpcChannels.playlistDelete, id),
  playlistAddItem: (input: PlaylistAddItemInput): Promise<PlaylistItemDto> =>
    ipcRenderer.invoke(IpcChannels.playlistAddItem, input),
  playlistRemoveItem: (id: number): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.playlistRemoveItem, id),
  playlistExport: (input: PlaylistExportInput): Promise<{ filePath: string }> =>
    ipcRenderer.invoke(IpcChannels.playlistExport, input),

  statsExport: (input: StatsExportInput): Promise<{ filePath: string }> =>
    ipcRenderer.invoke(IpcChannels.statsExport, input),

  systemCreate: (input: SystemCreateInput): Promise<SystemDto> =>
    ipcRenderer.invoke(IpcChannels.systemCreate, input),
  systemDelete: (id: number): Promise<void> => ipcRenderer.invoke(IpcChannels.systemDelete, id),

  eventTypeCreate: (input: EventTypeCreateInput): Promise<EventTypeDto> =>
    ipcRenderer.invoke(IpcChannels.eventTypeCreate, input),

  seasonStats: (): Promise<SeasonStatsResult> => ipcRenderer.invoke(IpcChannels.seasonStats)
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('houd', houdApi)
} else {
  // @ts-ignore (fallback, not expected — sandbox/contextIsolation is always on)
  window.electron = electronAPI
  // @ts-ignore
  window.houd = houdApi
}

export type HoudApi = typeof houdApi

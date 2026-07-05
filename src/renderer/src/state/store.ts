import { create } from 'zustand'
import type {
  ProjectDto,
  PlayerDto,
  EventTypeDto,
  GameEventDto,
  ShotDto,
  DrawingDto,
  PlaylistDto,
  PlaylistItemDto,
  SystemDto,
  ProjectFullDto
} from '@shared/types'

interface AppState {
  view: 'home' | 'workspace' | 'season'
  currentProject: ProjectDto | null
  currentTeamId: number | null
  players: PlayerDto[]
  eventTypes: EventTypeDto[]
  events: GameEventDto[]
  shots: ShotDto[]
  drawings: DrawingDto[]
  playlists: PlaylistDto[]
  playlistItems: PlaylistItemDto[]
  systems: SystemDto[]
  activePlayerId: number | null
  activeSystemId: number | null
  systemStartMs: number | null
  currentQuarter: number

  goHome: () => void
  goSeason: () => void
  openProject: (data: ProjectFullDto) => void
  setActivePlayer: (id: number | null) => void
  setQuarter: (q: number) => void
  addPlayer: (p: PlayerDto) => void
  removePlayer: (id: number) => void
  addEvent: (e: GameEventDto) => void
  updateEvent: (e: GameEventDto) => void
  removeEvent: (id: number) => void
  addShot: (s: ShotDto) => void
  addDrawing: (d: DrawingDto) => void
  addPlaylist: (p: PlaylistDto) => void
  removePlaylist: (id: number) => void
  addPlaylistItem: (item: PlaylistItemDto) => void
  removePlaylistItem: (id: number) => void
  addSystem: (s: SystemDto) => void
  removeSystem: (id: number) => void
  startSystem: (id: number, startMs: number) => void
  clearActiveSystem: () => void
  addEventType: (t: EventTypeDto) => void
}

export const useAppStore = create<AppState>((set) => ({
  view: 'home',
  currentProject: null,
  currentTeamId: null,
  players: [],
  eventTypes: [],
  events: [],
  shots: [],
  drawings: [],
  playlists: [],
  playlistItems: [],
  systems: [],
  activePlayerId: null,
  activeSystemId: null,
  systemStartMs: null,
  currentQuarter: 1,

  goHome: () =>
    set({
      view: 'home',
      currentProject: null,
      currentTeamId: null,
      players: [],
      eventTypes: [],
      events: [],
      shots: [],
      drawings: [],
      playlists: [],
      playlistItems: [],
      systems: [],
      activePlayerId: null,
      activeSystemId: null,
      systemStartMs: null,
      currentQuarter: 1
    }),

  goSeason: () => set({ view: 'season' }),

  openProject: (data) =>
    set({
      view: 'workspace',
      currentProject: data.project,
      currentTeamId: data.team.id,
      players: data.players,
      eventTypes: data.eventTypes,
      events: data.events,
      shots: data.shots,
      drawings: data.drawings,
      playlists: data.playlists,
      playlistItems: data.playlistItems,
      systems: data.systems,
      activePlayerId: null,
      activeSystemId: null,
      systemStartMs: null,
      currentQuarter: 1
    }),

  setActivePlayer: (id) => set({ activePlayerId: id }),
  setQuarter: (q) => set({ currentQuarter: q }),
  addPlayer: (p) => set((s) => ({ players: [...s.players, p] })),
  removePlayer: (id) => set((s) => ({ players: s.players.filter((p) => p.id !== id) })),
  addEvent: (e) =>
    set((s) => ({
      events: [...s.events, e].sort((a, b) => a.videoTimestampMs - b.videoTimestampMs)
    })),
  updateEvent: (e) =>
    set((s) => ({
      events: s.events
        .map((existing) => (existing.id === e.id ? e : existing))
        .sort((a, b) => a.videoTimestampMs - b.videoTimestampMs)
    })),
  removeEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
  addShot: (shot) => set((s) => ({ shots: [...s.shots, shot] })),
  addDrawing: (d) => set((s) => ({ drawings: [...s.drawings, d] })),
  addPlaylist: (p) => set((s) => ({ playlists: [...s.playlists, p] })),
  removePlaylist: (id) =>
    set((s) => ({
      playlists: s.playlists.filter((p) => p.id !== id),
      playlistItems: s.playlistItems.filter((i) => i.playlistId !== id)
    })),
  addPlaylistItem: (item) => set((s) => ({ playlistItems: [...s.playlistItems, item] })),
  removePlaylistItem: (id) =>
    set((s) => ({ playlistItems: s.playlistItems.filter((i) => i.id !== id) })),
  addSystem: (sys) => set((s) => ({ systems: [...s.systems, sys] })),
  removeSystem: (id) =>
    set((s) => ({
      systems: s.systems.filter((sys) => sys.id !== id),
      activeSystemId: s.activeSystemId === id ? null : s.activeSystemId,
      systemStartMs: s.activeSystemId === id ? null : s.systemStartMs
    })),
  startSystem: (id, startMs) => set({ activeSystemId: id, systemStartMs: startMs }),
  clearActiveSystem: () => set({ activeSystemId: null, systemStartMs: null }),
  addEventType: (t) => set((s) => ({ eventTypes: [...s.eventTypes, t] }))
}))

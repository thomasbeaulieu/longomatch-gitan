export interface DbPingResult {
  ok: boolean
  tables: string[]
  dbPath: string
}

export interface ProjectDto {
  id: number
  name: string
  videoPath: string
  videoExists: boolean
  videoDurationMs: number | null
  videoFps: number | null
  videoWidth: number | null
  videoHeight: number | null
  createdAt: string
  updatedAt: string
}

export interface TeamDto {
  id: number
  projectId: number
  name: string
  isHome: boolean
}

export interface PlayerDto {
  id: number
  teamId: number
  firstName: string
  lastName: string
  jerseyNumber: number | null
  position: string | null
  photoPath: string | null
}

export interface EventTypeDto {
  id: number
  code: string
  label: string
  category: string
  points: number
  isMade: boolean | null
  requiresShotLocation: boolean
  color: string | null
  hotkey: string | null
  sortOrder: number
}

export interface SystemDto {
  id: number
  projectId: number
  name: string
}

export interface GameEventDto {
  id: number
  projectId: number
  eventTypeId: number
  playerId: number | null
  systemId: number | null
  quarter: number
  videoTimestampMs: number
  clipStartMs: number | null
  clipEndMs: number | null
  eventTypeCode: string
  eventTypeLabel: string
  eventTypeColor: string | null
  eventTypeCategory: string
  eventTypePoints: number
  eventTypeIsMade: boolean | null
  requiresShotLocation: boolean
  playerLabel: string | null
  systemName: string | null
}

export interface ShotDto {
  id: number
  eventId: number
  x: number
  y: number
}

export interface DrawingDto {
  id: number
  eventId: number
  shapeType: string
  dataJson: string
  color: string
  strokeWidth: number
}

export interface ClipDto {
  id: number
  projectId: number
  eventId: number | null
  filePath: string
  startMs: number
  endMs: number
}

export interface PlaylistDto {
  id: number
  projectId: number
  name: string
  autoPlayerId: number | null
}

export interface PlaylistItemDto {
  id: number
  playlistId: number
  eventId: number | null
  sortOrder: number
}

export interface ProjectFullDto {
  project: ProjectDto
  team: TeamDto
  players: PlayerDto[]
  eventTypes: EventTypeDto[]
  events: GameEventDto[]
  shots: ShotDto[]
  drawings: DrawingDto[]
  playlists: PlaylistDto[]
  playlistItems: PlaylistItemDto[]
  systems: SystemDto[]
}

export interface ProjectCreateInput {
  name: string
  videoPath: string
}

export interface PlayerCreateInput {
  projectId: number
  teamId: number
  firstName: string
  lastName: string
  jerseyNumber: number | null
  position: string | null
  photoPath: string | null
}

export interface PlayerCreateResult {
  player: PlayerDto
  playlist: PlaylistDto
}

export interface EventCreateResult {
  event: GameEventDto
  autoPlaylistItem: PlaylistItemDto | null
}

export interface EventCreateInput {
  projectId: number
  eventTypeId: number
  playerId: number | null
  systemId: number | null
  clipStartMsOverride: number | null
  quarter: number
  videoTimestampMs: number
}

export interface SystemCreateInput {
  projectId: number
  name: string
}

export interface EventTypeCreateInput {
  projectId: number
  label: string
  color: string
}

export interface ClipUpdateInput {
  id: number
  clipStartMs: number
  clipEndMs: number
}

export interface ExportClipInput {
  eventId: number
  overlayPngBase64?: string
}

export interface ShotCreateInput {
  eventId: number
  x: number
  y: number
}

export interface DrawingCreateInput {
  eventId: number
  shapeType: string
  dataJson: string
  color: string
  strokeWidth: number
}

export interface PlaylistCreateInput {
  projectId: number
  name: string
}

export interface PlaylistAddItemInput {
  playlistId: number
  eventId: number
}

export interface PlaylistExportInput {
  playlistId: number
}

export interface StatsExportInput {
  projectId: number
  format: 'csv' | 'xlsx'
}

export interface SeasonPlayerStatsRow {
  playerName: string
  matchesPlayed: number
  points: number
  fg2Made: number
  fg2Att: number
  fg3Made: number
  fg3Att: number
  ftMade: number
  ftAtt: number
  rebOff: number
  rebDef: number
  ast: number
  stl: number
  blk: number
  tov: number
  fouls: number
}

export interface SeasonShotPoint {
  playerName: string
  x: number
  y: number
  made: boolean | null
}

export interface SeasonStatsResult {
  players: SeasonPlayerStatsRow[]
  shots: SeasonShotPoint[]
}

import { existsSync } from 'fs'
import type {
  ProjectDto,
  TeamDto,
  PlayerDto,
  EventTypeDto,
  GameEventDto,
  ClipDto,
  ShotDto,
  DrawingDto,
  PlaylistDto,
  PlaylistItemDto,
  SystemDto
} from '@shared/types'
import type { ProjectRow } from './db/repositories/project.repo'
import type { TeamRow } from './db/repositories/team.repo'
import type { PlayerRow } from './db/repositories/player.repo'
import type { EventTypeRow } from './db/repositories/event-type.repo'
import type { EventJoinedRow } from './db/repositories/event.repo'
import type { ClipRow } from './db/repositories/clip.repo'
import type { ShotRow } from './db/repositories/shot.repo'
import type { DrawingRow } from './db/repositories/drawing.repo'
import type { PlaylistRow, PlaylistItemRow } from './db/repositories/playlist.repo'
import type { SystemRow } from './db/repositories/system.repo'

export function toProjectDto(row: ProjectRow): ProjectDto {
  return {
    id: row.id,
    name: row.name,
    videoPath: row.video_path,
    videoExists: existsSync(row.video_path),
    videoDurationMs: row.video_duration_ms,
    videoFps: row.video_fps,
    videoWidth: row.video_width,
    videoHeight: row.video_height,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function toTeamDto(row: TeamRow): TeamDto {
  return { id: row.id, projectId: row.project_id, name: row.name, isHome: !!row.is_home }
}

export function toPlayerDto(row: PlayerRow): PlayerDto {
  return {
    id: row.id,
    teamId: row.team_id,
    firstName: row.first_name,
    lastName: row.last_name,
    jerseyNumber: row.jersey_number,
    position: row.position,
    photoPath: row.photo_path
  }
}

export function toEventTypeDto(row: EventTypeRow): EventTypeDto {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    category: row.category,
    points: row.points,
    isMade: row.is_made === null ? null : !!row.is_made,
    requiresShotLocation: !!row.requires_shot_location,
    color: row.color,
    hotkey: row.hotkey,
    sortOrder: row.sort_order
  }
}

export function toGameEventDto(row: EventJoinedRow): GameEventDto {
  const playerLabel = row.player_first_name
    ? `${row.player_first_name} ${row.player_last_name}${
        row.player_jersey_number != null ? ' #' + row.player_jersey_number : ''
      }`
    : null

  return {
    id: row.id,
    projectId: row.project_id,
    eventTypeId: row.event_type_id,
    playerId: row.player_id,
    systemId: row.system_id,
    quarter: row.quarter,
    videoTimestampMs: row.video_timestamp_ms,
    clipStartMs: row.clip_start_ms,
    clipEndMs: row.clip_end_ms,
    eventTypeCode: row.event_type_code,
    eventTypeLabel: row.event_type_label,
    eventTypeColor: row.event_type_color,
    eventTypeCategory: row.event_type_category,
    eventTypePoints: row.event_type_points,
    eventTypeIsMade: row.event_type_is_made === null ? null : !!row.event_type_is_made,
    requiresShotLocation: !!row.event_type_requires_shot_location,
    playerLabel,
    systemName: row.system_name
  }
}

export function toSystemDto(row: SystemRow): SystemDto {
  return { id: row.id, projectId: row.project_id, name: row.name }
}

export function toShotDto(row: ShotRow): ShotDto {
  return { id: row.id, eventId: row.event_id, x: row.x, y: row.y }
}

export function toDrawingDto(row: DrawingRow): DrawingDto {
  return {
    id: row.id,
    eventId: row.event_id,
    shapeType: row.shape_type,
    dataJson: row.data_json,
    color: row.color,
    strokeWidth: row.stroke_width
  }
}

export function toPlaylistDto(row: PlaylistRow): PlaylistDto {
  return { id: row.id, projectId: row.project_id, name: row.name, autoPlayerId: row.auto_player_id }
}

export function toPlaylistItemDto(row: PlaylistItemRow): PlaylistItemDto {
  return {
    id: row.id,
    playlistId: row.playlist_id,
    eventId: row.event_id,
    sortOrder: row.sort_order
  }
}

export function toClipDto(row: ClipRow): ClipDto {
  return {
    id: row.id,
    projectId: row.project_id,
    eventId: row.event_id,
    filePath: row.file_path,
    startMs: row.start_ms,
    endMs: row.end_ms
  }
}

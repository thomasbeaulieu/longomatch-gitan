import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc-channels'
import type { ProjectCreateInput, ProjectFullDto } from '@shared/types'
import { createProject, listProjects, getProject, deleteProject } from '../db/repositories/project.repo'
import { deleteProjectDataDir } from '../project-manager'
import { createTeam, listTeamsByProject } from '../db/repositories/team.repo'
import { seedDefaultEventTypes, listEventTypes } from '../db/repositories/event-type.repo'
import { createPlayer, listPlayersByTeam } from '../db/repositories/player.repo'
import { DEFAULT_ROSTER } from '@shared/default-roster'
import { listEventsByProject } from '../db/repositories/event.repo'
import { listShotsByProject } from '../db/repositories/shot.repo'
import { listDrawingsByProject } from '../db/repositories/drawing.repo'
import {
  createPlaylist,
  listPlaylistsByProject,
  listPlaylistItemsByProject
} from '../db/repositories/playlist.repo'
import { listSystemsByProject } from '../db/repositories/system.repo'
import { probeVideo } from '../ffmpeg/probe'
import {
  toProjectDto,
  toTeamDto,
  toPlayerDto,
  toEventTypeDto,
  toGameEventDto,
  toShotDto,
  toDrawingDto,
  toPlaylistDto,
  toPlaylistItemDto,
  toSystemDto
} from '../mappers'

export function registerProjectIpcHandlers(): void {
  ipcMain.handle(
    IpcChannels.projectCreate,
    async (_event, input: ProjectCreateInput): Promise<ProjectFullDto> => {
      const meta = await probeVideo(input.videoPath)
      const projectRow = createProject({
        name: input.name,
        videoPath: input.videoPath,
        durationMs: meta.durationMs,
        fps: meta.fps,
        width: meta.width,
        height: meta.height
      })
      const teamRow = createTeam({ projectId: projectRow.id, name: 'US Laval Basket' })
      seedDefaultEventTypes(projectRow.id)

      const playerRows = DEFAULT_ROSTER.map((p) =>
        createPlayer({
          teamId: teamRow.id,
          firstName: p.firstName,
          lastName: p.lastName,
          jerseyNumber: null,
          position: p.position,
          photoPath: null
        })
      )

      const playlistRows = playerRows.map((player) =>
        createPlaylist({
          projectId: projectRow.id,
          name: `Paniers ${player.first_name} ${player.last_name}`,
          autoPlayerId: player.id
        })
      )

      return {
        project: toProjectDto(projectRow),
        team: toTeamDto(teamRow),
        players: playerRows.map(toPlayerDto),
        eventTypes: listEventTypes(projectRow.id).map(toEventTypeDto),
        events: [],
        shots: [],
        drawings: [],
        playlists: playlistRows.map(toPlaylistDto),
        playlistItems: [],
        systems: []
      }
    }
  )

  ipcMain.handle(IpcChannels.projectList, () => listProjects().map(toProjectDto))

  ipcMain.handle(IpcChannels.projectOpen, (_event, id: number): ProjectFullDto => {
    const projectRow = getProject(id)
    if (!projectRow) throw new Error(`Projet ${id} introuvable`)

    const [teamRow] = listTeamsByProject(id)
    if (!teamRow) throw new Error(`Aucune équipe pour le projet ${id}`)

    return {
      project: toProjectDto(projectRow),
      team: toTeamDto(teamRow),
      players: listPlayersByTeam(teamRow.id).map(toPlayerDto),
      eventTypes: listEventTypes(id).map(toEventTypeDto),
      events: listEventsByProject(id).map(toGameEventDto),
      shots: listShotsByProject(id).map(toShotDto),
      drawings: listDrawingsByProject(id).map(toDrawingDto),
      playlists: listPlaylistsByProject(id).map(toPlaylistDto),
      playlistItems: listPlaylistItemsByProject(id).map(toPlaylistItemDto),
      systems: listSystemsByProject(id).map(toSystemDto)
    }
  })

  ipcMain.handle(IpcChannels.projectDelete, (_event, id: number): void => {
    deleteProject(id)
    deleteProjectDataDir(id)
  })
}

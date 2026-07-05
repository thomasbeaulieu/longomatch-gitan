import { ipcMain } from 'electron'
import { join } from 'path'
import { writeFileSync, unlinkSync } from 'fs'
import { IpcChannels } from '@shared/ipc-channels'
import type {
  ExportClipInput,
  ClipDto,
  PlaylistExportInput,
  StatsExportInput
} from '@shared/types'
import { getEventJoined, listEventsByProject } from '../db/repositories/event.repo'
import { getProject } from '../db/repositories/project.repo'
import { createClip } from '../db/repositories/clip.repo'
import { listPlaylistItems } from '../db/repositories/playlist.repo'
import { listPlayersByTeam } from '../db/repositories/player.repo'
import { listTeamsByProject } from '../db/repositories/team.repo'
import { exportClip as runFfmpegExport, concatClips } from '../ffmpeg/clip-export'
import { getProjectClipsDir, getProjectDataDir } from '../project-manager'
import { toClipDto } from '../mappers'
import { computePlayerStatsRows } from '../stats/compute-stats'
import { writeStatsCsv, writeStatsXlsx } from '../stats/export-stats'

export function registerExportIpcHandlers(): void {
  ipcMain.handle(IpcChannels.exportClip, async (_event, input: ExportClipInput): Promise<ClipDto> => {
    const event = getEventJoined(input.eventId)
    if (!event) throw new Error('Event introuvable')

    const project = getProject(event.project_id)
    if (!project) throw new Error('Projet introuvable')

    if (event.clip_start_ms == null || event.clip_end_ms == null) {
      throw new Error("Cet event n'a pas de fenêtre de clip définie")
    }

    const clipsDir = getProjectClipsDir(project.id)
    const outputPath = join(clipsDir, `clip_${event.id}_${Date.now()}.mp4`)

    let overlayPngPath: string | undefined
    if (input.overlayPngBase64) {
      overlayPngPath = join(clipsDir, `overlay_${event.id}_${Date.now()}.png`)
      writeFileSync(overlayPngPath, Buffer.from(input.overlayPngBase64, 'base64'))
    }

    await runFfmpegExport({
      videoPath: project.video_path,
      startMs: event.clip_start_ms,
      endMs: event.clip_end_ms,
      outputPath,
      overlayPngPath
    })

    if (overlayPngPath) unlinkSync(overlayPngPath)

    const clipRow = createClip({
      projectId: project.id,
      eventId: event.id,
      filePath: outputPath,
      startMs: event.clip_start_ms,
      endMs: event.clip_end_ms,
      hasOverlay: !!overlayPngPath
    })

    return toClipDto(clipRow)
  })

  ipcMain.handle(
    IpcChannels.playlistExport,
    async (_event, input: PlaylistExportInput): Promise<{ filePath: string }> => {
      const items = listPlaylistItems(input.playlistId)
      if (items.length === 0) throw new Error('Playlist vide')

      const firstEvent = getEventJoined(items[0].event_id!)
      if (!firstEvent) throw new Error('Event introuvable')
      const project = getProject(firstEvent.project_id)
      if (!project) throw new Error('Projet introuvable')

      const clipsDir = getProjectClipsDir(project.id)
      const tempClipPaths: string[] = []

      for (const item of items) {
        if (item.event_id == null) continue
        const ev = getEventJoined(item.event_id)
        if (!ev || ev.clip_start_ms == null || ev.clip_end_ms == null) continue
        const tempPath = join(clipsDir, `_playlist_tmp_${item.id}_${Date.now()}.mp4`)
        await runFfmpegExport({
          videoPath: project.video_path,
          startMs: ev.clip_start_ms,
          endMs: ev.clip_end_ms,
          outputPath: tempPath
        })
        tempClipPaths.push(tempPath)
      }

      const outputPath = join(clipsDir, `playlist_${input.playlistId}_${Date.now()}.mp4`)
      const concatListPath = join(clipsDir, `_concat_${input.playlistId}_${Date.now()}.txt`)
      await concatClips({ clipPaths: tempClipPaths, outputPath, concatListPath })

      for (const p of tempClipPaths) unlinkSync(p)
      unlinkSync(concatListPath)

      return { filePath: outputPath }
    }
  )

  ipcMain.handle(
    IpcChannels.statsExport,
    async (_event, input: StatsExportInput): Promise<{ filePath: string }> => {
      const project = getProject(input.projectId)
      if (!project) throw new Error('Projet introuvable')

      const [team] = listTeamsByProject(input.projectId)
      const players = listPlayersByTeam(team.id)
      const events = listEventsByProject(input.projectId)
      const rows = computePlayerStatsRows(events, players)

      const dataDir = getProjectDataDir(input.projectId)
      const ext = input.format === 'xlsx' ? 'xlsx' : 'csv'
      const filePath = join(dataDir, `stats_${Date.now()}.${ext}`)

      if (input.format === 'xlsx') {
        await writeStatsXlsx(rows, filePath)
      } else {
        writeStatsCsv(rows, filePath)
      }

      return { filePath }
    }
  )
}

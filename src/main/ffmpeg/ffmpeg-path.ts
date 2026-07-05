import { app } from 'electron'
import { join } from 'path'
import ffmpegStatic from 'ffmpeg-static'
import ffprobeStatic from 'ffprobe-static'

const isWindows = process.platform === 'win32'

export function getFfmpegPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'ffmpeg', isWindows ? 'ffmpeg.exe' : 'ffmpeg')
  }
  return ffmpegStatic
}

export function getFfprobePath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'ffmpeg', isWindows ? 'ffprobe.exe' : 'ffprobe')
  }
  return ffprobeStatic.path
}

import { writeFileSync } from 'fs'
import { ffmpeg } from './index'

export interface ClipExportOptions {
  videoPath: string
  startMs: number
  endMs: number
  outputPath: string
  overlayPngPath?: string
}

export function exportClip(options: ClipExportOptions): Promise<void> {
  // Re-encode plutôt que -c copy : le stream copy snape la coupe sur la keyframe
  // précédente (GOP souvent >1s), ce qui décale fortement le début du clip.
  // Pour des clips courts (quelques secondes), le re-encode reste quasi instantané.
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(options.videoPath)
      .setStartTime(options.startMs / 1000)
      .setDuration((options.endMs - options.startMs) / 1000)

    if (options.overlayPngPath) {
      cmd
        .input(options.overlayPngPath)
        .complexFilter(['[0:v][1:v]overlay=0:0[outv]'])
        .outputOptions([
          '-map [outv]',
          '-map 0:a?',
          '-c:v libx264',
          '-preset veryfast',
          '-c:a aac',
          '-avoid_negative_ts make_zero'
        ])
    } else {
      cmd.outputOptions([
        '-c:v libx264',
        '-preset veryfast',
        '-c:a aac',
        '-avoid_negative_ts make_zero'
      ])
    }

    cmd
      .output(options.outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run()
  })
}

export interface ConcatOptions {
  clipPaths: string[]
  outputPath: string
  concatListPath: string
}

export function concatClips(options: ConcatOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const listContent = options.clipPaths
      .map((p) => `file '${p.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`)
      .join('\n')
    writeFileSync(options.concatListPath, listContent, 'utf-8')

    ffmpeg()
      .input(options.concatListPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .output(options.outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run()
  })
}

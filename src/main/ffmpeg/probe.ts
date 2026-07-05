import { ffmpeg } from './index'

export interface VideoMetadata {
  durationMs: number
  fps: number
  width: number
  height: number
}

function parseFrameRate(rate?: string): number {
  if (!rate) return 0
  const [num, den] = rate.split('/').map(Number)
  if (!den) return num
  return num / den
}

export function probeVideo(videoPath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, data) => {
      if (err) return reject(err)

      const videoStream = data.streams.find((s) => s.codec_type === 'video')
      if (!videoStream) return reject(new Error('Aucun flux vidéo trouvé dans ce fichier'))

      resolve({
        durationMs: Math.round((data.format.duration ?? 0) * 1000),
        fps: parseFrameRate(videoStream.avg_frame_rate ?? videoStream.r_frame_rate),
        width: videoStream.width ?? 0,
        height: videoStream.height ?? 0
      })
    })
  })
}

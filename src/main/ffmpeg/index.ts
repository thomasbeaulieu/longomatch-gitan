import ffmpeg from 'fluent-ffmpeg'
import { getFfmpegPath, getFfprobePath } from './ffmpeg-path'

ffmpeg.setFfmpegPath(getFfmpegPath())
ffmpeg.setFfprobePath(getFfprobePath())

export { ffmpeg }

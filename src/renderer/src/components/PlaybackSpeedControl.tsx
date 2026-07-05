import { useState, type ReactElement, type RefObject } from 'react'

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

function PlaybackSpeedControl({ videoRef }: Props): ReactElement {
  const [speed, setSpeed] = useState(1)

  function applySpeed(rate: number): void {
    setSpeed(rate)
    if (videoRef.current) videoRef.current.playbackRate = rate
  }

  return (
    <div className="playback-speed-control">
      <span className="playback-speed-label">Vitesse</span>
      {SPEEDS.map((s) => (
        <button
          key={s}
          className={speed === s ? 'speed-btn active' : 'speed-btn'}
          onClick={() => applySpeed(s)}
        >
          {s}x
        </button>
      ))}
    </div>
  )
}

export default PlaybackSpeedControl

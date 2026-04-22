import { useEffect } from 'react'
import { useMissionStore } from '../store/missionStore'

const FULL_MISSION_SECONDS = 60

export function useMissionPlayback() {
  const isPlaying = useMissionStore((s) => s.isPlaying)
  const playbackSpeed = useMissionStore((s) => s.playbackSpeed)

  useEffect(() => {
    if (!isPlaying) return

    let rafId = 0
    let lastTime = performance.now()

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000
      lastTime = now

      const s = useMissionStore.getState()
      const advance = (dt * s.playbackSpeed) / FULL_MISSION_SECONDS
      const next = s.currentT + advance

      if (next >= 1) {
        s.setTime(1)
        useMissionStore.setState({ isPlaying: false })
        return
      }

      s.setTime(next)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isPlaying, playbackSpeed])
}

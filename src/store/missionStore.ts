import { create } from 'zustand'

export type PlaybackSpeed = 1 | 2 | 5
export type RenderMode = 'hybrid' | 'cinematic'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

type MissionState = {
  currentT: number
  isPlaying: boolean
  playbackSpeed: PlaybackSpeed
  activeComponent: string | null
  autoRotate: boolean
  showLabels: boolean
  renderMode: RenderMode
  /**
   * Increments every time the camera should fly back to the default view
   * (on RESET). CameraRig depends on this in the flyTo memo so identical
   * target/radius pairs still trigger a re-aim.
   */
  cameraResetNonce: number
  setTime: (t: number) => void
  togglePlay: () => void
  setSpeed: (speed: PlaybackSpeed) => void
  setActiveComponent: (id: string | null) => void
  toggleAutoRotate: () => void
  setAutoRotate: (v: boolean) => void
  toggleLabels: () => void
  toggleRenderMode: () => void
  reset: () => void
}

export const useMissionStore = create<MissionState>((set) => ({
  currentT: 0,
  isPlaying: false,
  playbackSpeed: 1,
  activeComponent: null,
  autoRotate: !prefersReducedMotion,
  showLabels: true,
  renderMode: 'hybrid',
  cameraResetNonce: 0,
  setTime: (t) =>
    set(() => {
      const clamped = Math.max(0, Math.min(1, t))
      return { currentT: clamped }
    }),
  togglePlay: () =>
    set((s) => {
      if (!s.isPlaying && s.currentT >= 1) return { isPlaying: true, currentT: 0, autoRotate: false }
      // Starting playback disables auto-rotate so the mission's own keyed
      // banking can carry the motion without fighting a constant orbit.
      if (!s.isPlaying) return { isPlaying: true, autoRotate: false }
      return { isPlaying: false }
    }),
  setSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setActiveComponent: (activeComponent) => set({ activeComponent }),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleRenderMode: () =>
    set((s) => ({ renderMode: s.renderMode === 'hybrid' ? 'cinematic' : 'hybrid' })),
  reset: () =>
    set((s) => ({
      currentT: 0,
      isPlaying: false,
      activeComponent: null,
      autoRotate: !prefersReducedMotion,
      cameraResetNonce: s.cameraResetNonce + 1,
    })),
}))

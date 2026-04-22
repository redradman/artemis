import { create } from 'zustand'

export type PlaybackSpeed = 1 | 2 | 5

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
  setTime: (t: number) => void
  togglePlay: () => void
  setSpeed: (speed: PlaybackSpeed) => void
  setActiveComponent: (id: string | null) => void
  toggleAutoRotate: () => void
  setAutoRotate: (v: boolean) => void
  toggleLabels: () => void
  reset: () => void
}

export const useMissionStore = create<MissionState>((set) => ({
  currentT: 0,
  isPlaying: false,
  playbackSpeed: 1,
  activeComponent: null,
  autoRotate: !prefersReducedMotion,
  showLabels: true,
  setTime: (t) =>
    set(() => {
      const clamped = Math.max(0, Math.min(1, t))
      return { currentT: clamped }
    }),
  togglePlay: () =>
    set((s) => {
      if (!s.isPlaying && s.currentT >= 1) return { isPlaying: true, currentT: 0 }
      return { isPlaying: !s.isPlaying }
    }),
  setSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setActiveComponent: (activeComponent) => set({ activeComponent }),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  reset: () => set({ currentT: 0, isPlaying: false, activeComponent: null }),
}))

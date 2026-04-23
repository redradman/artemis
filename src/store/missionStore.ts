import { create } from 'zustand'

export type PlaybackSpeed = 1 | 2 | 3 | 5
export type RenderMode = 'space' | 'cinematic' | 'blueprint'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

type MissionState = {
  currentT: number
  isPlaying: boolean
  playbackSpeed: PlaybackSpeed
  activeComponent: string | null
  /**
   * True when the info panel was opened while the timeline was playing,
   * so the timeline auto-paused. Closing the panel (or pressing play)
   * should resume playback. Cleared once consumed.
   */
  resumeOnPanelClose: boolean
  /**
   * Which phase popover is currently open on the mission timeline, or
   * null if none. Mirrors activeComponent — opening auto-pauses if the
   * timeline was playing, closing (or hitting play) resumes.
   */
  openPhaseId: string | null
  resumeOnPopoverClose: boolean
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
  setRenderMode: (mode: RenderMode) => void
  setOpenPhase: (id: string | null) => void
  reset: () => void
}

export const useMissionStore = create<MissionState>((set) => ({
  currentT: 0,
  isPlaying: false,
  playbackSpeed: 1,
  activeComponent: null,
  resumeOnPanelClose: false,
  openPhaseId: null,
  resumeOnPopoverClose: false,
  autoRotate: !prefersReducedMotion,
  showLabels: true,
  renderMode: 'blueprint',
  cameraResetNonce: 0,
  setTime: (t) =>
    set(() => {
      const clamped = Math.max(0, Math.min(1, t))
      return { currentT: clamped }
    }),
  togglePlay: () =>
    set((s) => {
      // If any auto-pausing menu (info panel or phase popover) is open
      // when the user hits play, close it and resume — motion + open
      // menu content fighting for attention is exactly what the
      // pause-on-click behaviour is meant to avoid.
      const hasOpenMenu = s.activeComponent !== null || s.openPhaseId !== null
      if (!s.isPlaying && hasOpenMenu) {
        return {
          isPlaying: true,
          activeComponent: null,
          openPhaseId: null,
          resumeOnPanelClose: false,
          resumeOnPopoverClose: false,
          autoRotate: false,
          ...(s.currentT >= 1 ? { currentT: 0 } : {}),
        }
      }
      if (!s.isPlaying && s.currentT >= 1)
        return {
          isPlaying: true,
          currentT: 0,
          autoRotate: false,
          resumeOnPanelClose: false,
          resumeOnPopoverClose: false,
        }
      // Starting playback disables auto-rotate so the mission's own keyed
      // banking can carry the motion without fighting a constant orbit.
      if (!s.isPlaying)
        return {
          isPlaying: true,
          autoRotate: false,
          resumeOnPanelClose: false,
          resumeOnPopoverClose: false,
        }
      return { isPlaying: false, resumeOnPanelClose: false, resumeOnPopoverClose: false }
    }),
  setSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setActiveComponent: (activeComponent) =>
    set((s) => {
      // Opening the panel while playing: auto-pause and remember to
      // resume when it closes. Closing it while we had auto-paused:
      // resume. All other transitions pass through unchanged.
      if (activeComponent !== null && s.activeComponent === null && s.isPlaying) {
        return { activeComponent, isPlaying: false, resumeOnPanelClose: true }
      }
      if (activeComponent === null && s.resumeOnPanelClose) {
        return { activeComponent: null, isPlaying: true, resumeOnPanelClose: false }
      }
      return { activeComponent }
    }),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  setRenderMode: (renderMode) => set({ renderMode }),
  setOpenPhase: (openPhaseId) =>
    set((s) => {
      // Opening a phase popover while playing: auto-pause and remember
      // to resume when it closes. Closing (via X, click-outside, or
      // Escape) while we had auto-paused: resume. Other transitions —
      // e.g. switching from one open popover to another — just update
      // the id without touching playback.
      if (openPhaseId !== null && s.openPhaseId === null && s.isPlaying) {
        return { openPhaseId, isPlaying: false, resumeOnPopoverClose: true }
      }
      if (openPhaseId === null && s.resumeOnPopoverClose) {
        return { openPhaseId: null, isPlaying: true, resumeOnPopoverClose: false }
      }
      return { openPhaseId }
    }),
  reset: () =>
    set((s) => ({
      currentT: 0,
      isPlaying: false,
      activeComponent: null,
      resumeOnPanelClose: false,
      openPhaseId: null,
      resumeOnPopoverClose: false,
      autoRotate: !prefersReducedMotion,
      showLabels: true,
      renderMode: 'blueprint',
      playbackSpeed: 1,
      cameraResetNonce: s.cameraResetNonce + 1,
    })),
}))

import { useEffect, useRef, useState } from 'react'

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function useTweenedNumber(target: number, durationMs = 400): number {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const startRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    fromRef.current = value
    startRef.current = performance.now()
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    const step = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / durationMs)
      const k = easeOutCubic(t)
      setValue(fromRef.current + (target - fromRef.current) * k)
      if (t < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return value
}

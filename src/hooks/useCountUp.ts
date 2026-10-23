import { useEffect, useRef, useState } from 'react'

/** Animates from the previous value (or 0) up to `target` whenever it changes.
 * Returns null until the first real value arrives, so callers can keep
 * showing a loading placeholder instead of an animated "0". */
export function useCountUp(target: number | null, durationMs = 900): number | null {
  const [value, setValue] = useState<number | null>(null)
  const lastTarget = useRef(0)

  useEffect(() => {
    if (target === null) return

    const from = lastTarget.current
    const start = performance.now()
    let raf: number

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(from + (target! - from) * eased)
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        lastTarget.current = target!
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}

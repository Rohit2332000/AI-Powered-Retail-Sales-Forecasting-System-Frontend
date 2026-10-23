import { useEffect, useState } from 'react'

// Purely decorative animated sales-trend "horizon" spanning the full header
// width -- reinforces the sales-forecast theme with a bit of life. A glowing
// dot travels the line to suggest a live feed. aria-hidden, no information.
const PATH =
  'M0,86 C50,70 90,96 140,80 C190,64 220,100 270,82 ' +
  'C320,64 360,92 410,70 C460,48 500,78 550,58 ' +
  'C600,38 640,66 690,48 C740,30 780,56 830,40 ' +
  'C880,24 920,46 970,32 C1010,20 1050,40 1100,24 ' +
  'C1130,14 1160,28 1200,16'

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', listener)
    return () => query.removeEventListener('change', listener)
  }, [])

  return reduced
}

function TrendBackdrop() {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className="trend-backdrop" aria-hidden="true">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="70%" stopColor="var(--accent)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="1" />
          </linearGradient>
        </defs>

        <path d={`${PATH} L1200,120 L0,120 Z`} fill="url(#trendAreaFill)" />

        <path
          className={reducedMotion ? '' : 'trend-backdrop-path'}
          d={PATH}
          fill="none"
          stroke="url(#trendStroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {!reducedMotion && (
          <g>
            <circle r="9" fill="var(--accent)" opacity="0.35" className="trend-backdrop-glow">
              <animateMotion dur="7s" repeatCount="indefinite" path={PATH} rotate="auto" />
            </circle>
            <circle r="3.5" fill="var(--accent)">
              <animateMotion dur="7s" repeatCount="indefinite" path={PATH} rotate="auto" />
            </circle>
          </g>
        )}
      </svg>
    </div>
  )
}

export default TrendBackdrop

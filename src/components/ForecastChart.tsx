import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getForecastWithHistory } from '../api/forecast'
import type { TrendPoint } from '../api/types'

interface ForecastChartProps {
  productId: string
  storeId: string
}

function ForecastChart({ productId, storeId }: ForecastChartProps) {
  const [points, setPoints] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId || !storeId) {
      setPoints([])
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getForecastWithHistory(productId, storeId, 90)
      .then((response) => {
        if (!cancelled) setPoints(response.points)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load forecast data.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [productId, storeId])

  if (!productId || !storeId) {
    return (
      <div className="panel chart-panel empty-state">
        <p>Select a product and store to see the forecast.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="panel chart-panel empty-state">
        <span className="spinner" aria-label="Loading forecast" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="panel chart-panel empty-state">
        <p className="error-text">{error}</p>
      </div>
    )
  }

  // The history/forecast boundary is the last date with a real actual value,
  // not the real wall-clock "today" -- this dataset's calendar is simulated
  // and won't generally line up with whenever the dashboard happens to be viewed.
  const boundaryDate = [...points].reverse().find((point) => point.actual_units !== null)?.date

  return (
    <div className="panel chart-panel">
      <h2>Forecast vs. actuals</h2>
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={points} margin={{ top: 26, right: 24, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="predictedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--text)" fontSize={12} />
          <YAxis
            stroke="var(--text)"
            fontSize={12}
            label={{ value: 'Units sold', angle: -90, position: 'insideLeft', fill: 'var(--text)' }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--code-bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-h)',
            }}
          />
          <Legend />
          {boundaryDate && (
            <ReferenceLine
              x={boundaryDate}
              stroke="var(--accent)"
              strokeDasharray="4 4"
              label={{ value: 'Today', position: 'top', fill: 'var(--accent)' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="actual_units"
            name="Actual"
            stroke="#22c55e"
            strokeWidth={2.5}
            fill="url(#actualFill)"
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="predicted_units"
            name="Predicted"
            stroke="#f59e0b"
            strokeWidth={2.5}
            strokeDasharray="6 4"
            fill="url(#predictedFill)"
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ForecastChart

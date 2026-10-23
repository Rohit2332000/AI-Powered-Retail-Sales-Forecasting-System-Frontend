import { useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { explainForecast } from '../api/forecast'
import type { ForecastExplanation } from '../api/types'

interface ExplanationPanelProps {
  productId: string
  storeId: string
}

function formatPercent(value: number | null): string {
  if (value === null) return 'N/A'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function SummaryCards({ summary }: { summary: ForecastExplanation['forecast_summary'] }) {
  return (
    <div className="stat-cards">
      <div className="stat-card">
        <span className="stat-label">Avg predicted units/day</span>
        <span className="stat-value">{summary.avg_predicted_units.toFixed(1)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Total predicted units</span>
        <span className="stat-value">{summary.total_predicted_units.toFixed(1)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Vs. recent history</span>
        <span className="stat-value">{formatPercent(summary.vs_recent_history_pct_change)}</span>
      </div>
    </div>
  )
}

function ExplanationBody({ result }: { result: ForecastExplanation }) {
  return (
    <>
      <SummaryCards summary={result.forecast_summary} />
      <div className="markdown">
        <ReactMarkdown>{result.explanation}</ReactMarkdown>
      </div>
      {result.key_drivers.length > 0 && (
        <>
          <h3>Key drivers</h3>
          <ul>
            {result.key_drivers.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}
      {result.risks_or_opportunities.length > 0 && (
        <>
          <h3>Risks &amp; opportunities</h3>
          <ul>
            {result.risks_or_opportunities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}
      <p className="recommendation">
        <strong>Recommendation:</strong> {result.recommendation}
      </p>
      <p className="model-version">Model version: {result.model_version}</p>
    </>
  )
}

function describeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'The request timed out waiting for a response. Please try again.'
    }
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (error.response) return `Request failed (${error.response.status}).`
  }
  return 'Could not generate an explanation. Please try again.'
}

function ExplanationPanel({ productId, storeId }: ExplanationPanelProps) {
  const [generalResult, setGeneralResult] = useState<ForecastExplanation | null>(null)
  const [generalLoading, setGeneralLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  async function handleExplain() {
    setGeneralLoading(true)
    setGeneralError(null)
    try {
      const result = await explainForecast(productId, storeId)
      setGeneralResult(result)
    } catch (error) {
      setGeneralError(describeError(error))
    } finally {
      setGeneralLoading(false)
    }
  }

  return (
    <div className="panel explanation-panel">
      <h2>Explain this forecast</h2>

      <button type="button" className="counter" onClick={handleExplain} disabled={generalLoading}>
        {generalLoading ? 'Generating…' : 'Explain this forecast'}
      </button>

      {generalError && <p className="error-text">{generalError}</p>}
      {generalResult && <ExplanationBody result={generalResult} />}
    </div>
  )
}

export default ExplanationPanel

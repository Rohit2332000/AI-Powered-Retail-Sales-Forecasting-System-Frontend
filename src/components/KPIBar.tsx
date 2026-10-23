import { useCallback, useEffect, useState } from 'react'
import { getKPIs } from '../api/chat'
import type { KPISummary } from '../api/types'
import { useCountUp } from '../hooks/useCountUp'

function formatNumber(value: number | null): string {
  if (value === null) return '—'
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function CategoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="20" x2="5" y2="12" />
      <line x1="12" y1="20" x2="12" y2="6" />
      <line x1="19" y1="20" x2="19" y2="15" />
    </svg>
  )
}

function ProductIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 7v10l8 4 8-4V7z" />
      <path d="M4 7l8 4 8-4" />
      <line x1="12" y1="11" x2="12" y2="21" />
    </svg>
  )
}

function RiskIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 2 20h20z" />
      <line x1="12" y1="10" x2="12" y2="15" />
      <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function RevenueIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,17 9,11 13,15 21,6" />
      <polyline points="15,6 21,6 21,12" />
    </svg>
  )
}

function KPIBar() {
  const [kpis, setKpis] = useState<KPISummary | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    getKPIs()
      .then(setKpis)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const categoryUnits = useCountUp(kpis?.top_category.total_units ?? null)
  const productUnits = useCountUp(kpis?.top_product.total_units ?? null)
  const atRiskCount = useCountUp(kpis ? kpis.at_risk_count : null, 700)
  const revenue = useCountUp(kpis?.predicted_revenue.total_predicted_revenue ?? null, 1200)

  if (error) {
    return (
      <div className="banner error-banner kpi-error">
        <span>Could not load KPI summary.</span>
        <button type="button" className="chip" onClick={load} disabled={loading}>
          {loading ? 'Retrying…' : 'Retry'}
        </button>
      </div>
    )
  }

  return (
    <div className="kpi-bar">
      <div className="kpi-tile kpi-tile--category">
        <div className="kpi-icon">
          <CategoryIcon />
        </div>
        <div className="kpi-text">
          <span className="kpi-label">Top category</span>
          <span className="kpi-value">{kpis?.top_category.category ?? '…'}</span>
          {kpis?.top_category.total_units != null && (
            <span className="kpi-subvalue">{formatNumber(categoryUnits)} units</span>
          )}
        </div>
      </div>
      <div className="kpi-tile kpi-tile--product">
        <div className="kpi-icon">
          <ProductIcon />
        </div>
        <div className="kpi-text">
          <span className="kpi-label">Top product</span>
          <span className="kpi-value">{kpis?.top_product.product_name ?? '…'}</span>
          {kpis?.top_product.total_units != null && (
            <span className="kpi-subvalue">{formatNumber(productUnits)} units</span>
          )}
        </div>
      </div>
      <div className="kpi-tile kpi-tile--risk">
        <div className="kpi-icon">
          <RiskIcon />
        </div>
        <div className="kpi-text">
          <span className="kpi-label">At-risk products/stores</span>
          <span className="kpi-value">{atRiskCount !== null ? Math.round(atRiskCount) : '…'}</span>
          <span className="kpi-subvalue">trending down 10%+</span>
        </div>
      </div>
      <div className="kpi-tile kpi-tile--revenue">
        <div className="kpi-icon">
          <RevenueIcon />
        </div>
        <div className="kpi-text">
          <span className="kpi-label">Predicted revenue (30d)</span>
          <span className="kpi-value">{formatNumber(revenue)}</span>
          <span className="kpi-subvalue">approximate</span>
        </div>
      </div>
    </div>
  )
}

export default KPIBar

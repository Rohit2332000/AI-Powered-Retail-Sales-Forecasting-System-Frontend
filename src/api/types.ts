export interface Product {
  product_id: string
  product_name: string
  category: string
}

export interface Store {
  store_id: string
  store_name: string
  city: string
  region: string
}

export interface TrendPoint {
  date: string
  actual_units: number | null
  predicted_units: number | null
}

export interface ForecastHistoryResponse {
  product_id: string
  store_id: string
  history_days: number
  points: TrendPoint[]
}

export interface ForecastSummary {
  avg_predicted_units: number
  total_predicted_units: number
  vs_recent_history_pct_change: number | null
}

export interface ForecastExplanation {
  product_id: string
  store_id: string
  forecast_summary: ForecastSummary
  explanation: string
  key_drivers: string[]
  risks_or_opportunities: string[]
  recommendation: string
  model_version: string
}

export interface ChatTurnHistory {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  answer: string
  data: Record<string, unknown>
  functions_used: string[]
}

export interface TopCategoryStat {
  days: number
  category: string | null
  total_units: number | null
}

export interface TopProductStat {
  days: number
  product_id: string | null
  product_name: string | null
  total_units: number | null
}

export interface PredictedRevenueStat {
  total_predicted_units: number | null
  total_predicted_revenue: number | null
  note: string | null
}

export interface KPISummary {
  top_category: TopCategoryStat
  top_product: TopProductStat
  predicted_revenue: PredictedRevenueStat
  at_risk_count: number
}

export interface UploadedFileInfo {
  filename: string
  volume_path: string
}

export interface PipelineUploadResponse {
  files: UploadedFileInfo[]
  status: string
}

export interface PipelineTriggerResponse {
  run_id: number
  status: string
}

export interface PipelineUploadAndTriggerResponse {
  files: UploadedFileInfo[]
  run_id: number
  status: string
}

export interface PipelineStatusResponse {
  run_id: number
  life_cycle_state: string
  result_state: string | null
  state_message: string | null
}

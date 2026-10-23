import apiClient from './client'
import type { ForecastExplanation, ForecastHistoryResponse, Product, Store } from './types'

export async function getProducts(): Promise<Product[]> {
  // Opens its own Databricks connection server-side (a few seconds of
  // overhead on its own); give it more room than the client's 10s default.
  const { data } = await apiClient.get<Product[]>('/products', { timeout: 20000 })
  return data
}

export async function getStores(): Promise<Store[]> {
  const { data } = await apiClient.get<Store[]>('/stores', { timeout: 20000 })
  return data
}

export async function getForecastWithHistory(
  productId: string,
  storeId: string,
  historyDays = 90,
): Promise<ForecastHistoryResponse> {
  const { data } = await apiClient.get<ForecastHistoryResponse>('/forecast', {
    params: {
      product_id: productId,
      store_id: storeId,
      include_history: true,
      history_days: historyDays,
    },
  })
  return data
}

export async function explainForecast(
  productId: string,
  storeId: string,
  userQuestion?: string,
): Promise<ForecastExplanation> {
  // Multiple Databricks queries plus an LLM call routinely take well over the
  // client's default 10s timeout -- give this one significantly more room.
  const { data } = await apiClient.post<ForecastExplanation>(
    '/forecast/explain',
    {
      product_id: productId,
      store_id: storeId,
      user_question: userQuestion,
    },
    { timeout: 60000 },
  )
  return data
}

import apiClient from './client'
import type { ChatResponse, ChatTurnHistory, KPISummary } from './types'

// Both the free-text and quick-action calls hit the LLM tool-calling path
// (or, for quick actions, compute over real data without an LLM) and can
// take a while -- give them the same generous timeout as /forecast/explain.
const CHAT_TIMEOUT_MS = 60000

export async function sendChatMessage(
  message: string,
  history: ChatTurnHistory[] = [],
  storeId?: string,
  storeName?: string,
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>(
    '/chat',
    { message, history, store_id: storeId || null, store_name: storeName || null },
    { timeout: CHAT_TIMEOUT_MS },
  )
  return data
}

export async function sendQuickAction(
  action: string,
  params: Record<string, unknown> = {},
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>(
    '/chat/quick',
    { action, params },
    { timeout: CHAT_TIMEOUT_MS },
  )
  return data
}

export async function getKPIs(): Promise<KPISummary> {
  // /kpis runs 5 aggregate queries server-side; comfortably under the
  // default 10s client timeout in normal operation, but a cold/slow
  // Databricks warehouse can still exceed it, so give it extra room.
  const { data } = await apiClient.get<KPISummary>('/kpis', { timeout: 30000 })
  return data
}

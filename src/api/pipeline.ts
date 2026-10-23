import apiClient from './client'
import type {
  PipelineStatusResponse,
  PipelineTriggerResponse,
  PipelineUploadAndTriggerResponse,
  PipelineUploadResponse,
} from './types'

// Uploads (and the job trigger itself) can take a few seconds longer than
// the client's default 10s timeout -- same reasoning as the chat/explain
// endpoints elsewhere in this app.
const PIPELINE_TIMEOUT_MS = 60000

export async function uploadPipelineFiles(files: File[]): Promise<PipelineUploadResponse> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  const { data } = await apiClient.post<PipelineUploadResponse>('/pipeline/upload', formData, {
    timeout: PIPELINE_TIMEOUT_MS,
  })
  return data
}

export async function triggerPipeline(): Promise<PipelineTriggerResponse> {
  const { data } = await apiClient.post<PipelineTriggerResponse>(
    '/pipeline/trigger',
    null,
    { timeout: PIPELINE_TIMEOUT_MS },
  )
  return data
}


export async function uploadAndTriggerPipeline(
  files: File[],
): Promise<PipelineUploadAndTriggerResponse> {
  const formData = new FormData()

  files.forEach((file) => {
    if (file.name.startsWith('sales_transactions')) {
      formData.append('sales_transactions_file', file)
    } else if (file.name.startsWith('calendar_marketing_external')) {
      formData.append('calendar_marketing_file', file)
    }
  })

  const { data } = await apiClient.post<PipelineUploadAndTriggerResponse>(
    '/pipeline/upload-and-trigger',
    formData,
    { timeout: PIPELINE_TIMEOUT_MS },
  )

  return data
}


export async function getPipelineStatus(runId: number): Promise<PipelineStatusResponse> {
  const { data } = await apiClient.get<PipelineStatusResponse>(`/pipeline/status/${runId}`, {
    timeout: 20000,
  })
  return data
}

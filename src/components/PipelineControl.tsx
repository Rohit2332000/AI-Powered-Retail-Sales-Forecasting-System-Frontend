import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { getPipelineStatus, triggerPipeline, uploadAndTriggerPipeline } from '../api/pipeline'
import type { PipelineStatusResponse } from '../api/types'

interface FilePick {
  file: File
  error: string | null
}

const ALLOWED_PREFIXES = ['sales_transactions', 'calendar_marketing_external']
const POLL_INTERVAL_MS = 4000
const TERMINAL_STATES = ['TERMINATED', 'SKIPPED', 'INTERNAL_ERROR']

function describeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (error.response) return `Request failed (${error.response.status}).`
  }
  return 'Something went wrong. Please try again.'
}

function validateFilename(filename: string): string | null {
  if (!filename.toLowerCase().endsWith('.csv')) {
    return 'Only CSV files are accepted.'
  }
  if (!ALLOWED_PREFIXES.some((prefix) => filename.startsWith(prefix))) {
    return `Filename must start with one of: ${ALLOWED_PREFIXES.join(', ')}.`
  }
  return null
}

function statusLabel(status: PipelineStatusResponse): { text: string; tone: 'pending' | 'running' | 'success' | 'failed' } {
  const { life_cycle_state, result_state, state_message } = status

  if (life_cycle_state === 'TERMINATED') {
    if (result_state === 'SUCCESS') return { text: 'Success', tone: 'success' }
    return { text: `Failed: ${state_message || result_state || 'unknown error'}`, tone: 'failed' }
  }
  if (life_cycle_state === 'INTERNAL_ERROR') {
    return { text: `Failed: ${state_message || 'internal error'}`, tone: 'failed' }
  }
  if (life_cycle_state === 'SKIPPED') {
    return { text: 'Skipped', tone: 'failed' }
  }
  if (life_cycle_state === 'RUNNING' || life_cycle_state === 'TERMINATING') {
    return { text: 'Running…', tone: 'running' }
  }
  if (life_cycle_state === 'PENDING' || life_cycle_state === 'QUEUED') {
    return { text: 'Queued…', tone: 'pending' }
  }
  if (life_cycle_state === 'WAITING_FOR_RETRY') {
    return { text: 'Waiting to retry…', tone: 'pending' }
  }
  return { text: life_cycle_state, tone: 'pending' }
}

function PipelineControl() {
  const [filePicks, setFilePicks] = useState<FilePick[]>([])
  const [runId, setRunId] = useState<number | null>(null)
  const [status, setStatus] = useState<PipelineStatusResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  function startPolling(newRunId: number) {
    stopPolling()
    setRunId(newRunId)
    setStatus(null)
    setBusy(true)

    const poll = async () => {
      try {
        const result = await getPipelineStatus(newRunId)
        setStatus(result)
        if (TERMINAL_STATES.includes(result.life_cycle_state)) {
          stopPolling()
          setBusy(false)
        }
      } catch (error) {
        stopPolling()
        setBusy(false)
        setActionError(describeError(error))
      }
    }

    void poll()
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS)
  }

  useEffect(() => stopPolling, [])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    setFilePicks(selected.map((file) => ({ file, error: validateFilename(file.name) })))
  }

  const hasInvalidFile = filePicks.some((pick) => pick.error !== null)

  async function handleUploadAndTrigger() {
    if (filePicks.length === 0 || hasInvalidFile) return

    setActionError(null)
    setBusy(true)
    try {
      const result = await uploadAndTriggerPipeline(filePicks.map((pick) => pick.file))
      startPolling(result.run_id)
    } catch (error) {
      setBusy(false)
      setActionError(describeError(error))
    }
  }

  async function handleTriggerOnly() {
    setActionError(null)
    setBusy(true)
    try {
      const result = await triggerPipeline()
      startPolling(result.run_id)
    } catch (error) {
      setBusy(false)
      setActionError(describeError(error))
    }
  }

  const label = status ? statusLabel(status) : null

  return (
    <div className="panel pipeline-panel">
      <h2>Retrain Forecasting Model</h2>
      <p className="pipeline-hint pipeline-subtitle">
        Ingests sales data through Bronze → Silver → Gold, retrains the model, and generates a
        fresh 30-day forecast.
      </p>

      <div className="pipeline-actions">
        <div className="pipeline-action">
          <p className="pipeline-action-title">Upload New Data &amp; Retrain</p>
          <p className="pipeline-hint">
            CSV filename(s) must start with <code>sales_transactions</code> or{' '}
            <code>calendar_marketing_external</code>. Select both a sales file and a calendar
            file together, or just one -- whichever data is available.
          </p>
          <input type="file" accept=".csv" multiple onChange={handleFileChange} disabled={busy} />
          {filePicks.length > 0 && (
            <ul className="pipeline-file-list">
              {filePicks.map((pick, index) => (
                <li key={index} className={pick.error ? 'error-text' : undefined}>
                  {pick.file.name}
                  {pick.error ? ` -- ${pick.error}` : ''}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="counter"
            onClick={() => void handleUploadAndTrigger()}
            disabled={busy || filePicks.length === 0 || hasInvalidFile}
          >
            {busy ? 'Working…' : 'Upload & Retrain'}
          </button>
        </div>

        <div className="pipeline-action">
          <p className="pipeline-action-title">Retrain on Existing Data</p>
          <p className="pipeline-hint">
            Re-run training using the data already uploaded -- no new file needed.
          </p>
          <button type="button" className="counter" onClick={() => void handleTriggerOnly()} disabled={busy}>
            {busy ? 'Working…' : 'Retrain Model'}
          </button>
        </div>
      </div>

      {actionError && <p className="error-text">{actionError}</p>}

      {runId && (
        <div className="pipeline-status">
          <span>Training run #{runId}:</span>
          {label ? (
            <span className={`status-badge status-badge--${label.tone}`}>
              {label.tone === 'running' || label.tone === 'pending' ? <span className="spinner" /> : null}
              {label.text}
            </span>
          ) : (
            <span className="status-badge status-badge--pending">
              <span className="spinner" /> Checking…
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default PipelineControl

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { sendChatMessage, sendQuickAction } from '../api/chat'
import type { ChatTurnHistory } from '../api/types'

interface ChatPanelProps {
  categories: string[]
  selectedStoreId: string
  selectedStoreName: string
}

interface Turn {
  id: string
  role: 'user' | 'assistant'
  content: string
  error?: string
  pending?: boolean
}

interface QuickAction {
  id: string
  label: string
  question: string
  run: () => Promise<{ answer: string }>
}

function describeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (error.response) return `Request failed (${error.response.status}).`
  }
  return 'Something went wrong. Please try again.'
}

function ChatPanel({ categories, selectedStoreId, selectedStoreName }: ChatPanelProps) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')
  const [categoryA, setCategoryA] = useState('')
  const [categoryB, setCategoryB] = useState('')

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns])

  useEffect(() => {
    if (categories.length >= 2 && !categoryA && !categoryB) {
      setCategoryA(categories[0])
      setCategoryB(categories[1])
    }
  }, [categories, categoryA, categoryB])

  async function runTurn(question: string, task: () => Promise<{ answer: string }>) {
    if (busy) return
    setBusy(true)

    const userId = `${Date.now()}-u`
    const assistantId = `${Date.now()}-a`
    setTurns((prev) => [
      ...prev,
      { id: userId, role: 'user', content: question },
      { id: assistantId, role: 'assistant', content: '', pending: true },
    ])

    try {
      const result = await task()
      setTurns((prev) =>
        prev.map((turn) => (turn.id === assistantId ? { ...turn, content: result.answer, pending: false } : turn)),
      )
    } catch (error) {
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === assistantId ? { ...turn, pending: false, error: describeError(error) } : turn,
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  const storeScopeLabel = selectedStoreId ? ` at ${selectedStoreName || selectedStoreId}` : ' across all stores'

  const quickActions: QuickAction[] = [
    {
      id: 'top_category',
      label: 'Top selling category',
      question: `What is the top selling category${storeScopeLabel}?`,
      run: () => sendQuickAction('top_category', { store_id: selectedStoreId || undefined }),
    },
    {
      id: 'top_product',
      label: 'Top selling product',
      question: `What is the top selling product${storeScopeLabel}?`,
      run: () => sendQuickAction('top_product', { store_id: selectedStoreId || undefined }),
    },
    {
      id: 'underperforming_stores',
      label: 'Underperforming stores',
      question: 'Which stores are underperforming?',
      run: () => sendQuickAction('underperforming_stores'),
    },
    {
      id: 'trending_down_products',
      label: 'Products trending down',
      question: 'Which products are trending down?',
      run: () => sendQuickAction('trending_down_products'),
    },
    {
      id: 'predicted_revenue',
      label: 'Predicted revenue',
      question: 'What is the total predicted revenue?',
      run: () => sendQuickAction('predicted_revenue'),
    },
  ]

  function handleCompareCategories() {
    if (!categoryA || !categoryB) return
    void runTurn(`Compare ${categoryA} vs ${categoryB}`, () =>
      sendQuickAction('compare_categories', { category_a: categoryA, category_b: categoryB }),
    )
  }

  function handleStorePerformance() {
    if (!selectedStoreId) return
    void runTurn(`How is ${selectedStoreName || selectedStoreId} performing vs. its history?`, () =>
      sendQuickAction('store_performance', { store_id: selectedStoreId }),
    )
  }

  function handleSend() {
    const message = input.trim()
    if (!message || busy) return
    setInput('')

    const history: ChatTurnHistory[] = turns
      .filter((turn) => !turn.pending && !turn.error)
      .map((turn) => ({ role: turn.role, content: turn.content }))

    void runTurn(message, () => sendChatMessage(message, history, selectedStoreId, selectedStoreName))
  }

  return (
    <div className="panel chat-panel">
      <h2>Ask the analytics assistant</h2>
      <p className="scope-note">
        Scope: <strong>{selectedStoreId ? selectedStoreName || selectedStoreId : 'All stores'}</strong>
      </p>

      <div className="quick-actions">
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="chip"
            disabled={busy}
            onClick={() => void runTurn(action.question, action.run)}
          >
            {action.label}
          </button>
        ))}

        {selectedStoreId && (
          <button type="button" className="chip" disabled={busy} onClick={handleStorePerformance}>
            This store vs. its history
          </button>
        )}
      </div>

      {categories.length >= 2 && (
        <div className="compare-row">
          <select value={categoryA} onChange={(event) => setCategoryA(event.target.value)} disabled={busy}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <span>vs.</span>
          <select value={categoryB} onChange={(event) => setCategoryB(event.target.value)} disabled={busy}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button type="button" className="chip" disabled={busy} onClick={handleCompareCategories}>
            Compare
          </button>
        </div>
      )}

      <div className="conversation chat-conversation">
        {turns.length === 0 && (
          <p className="empty-hint">Ask a question above, or click a quick-question button to get started.</p>
        )}
        {turns.map((turn) => (
          <div key={turn.id} className={`chat-bubble chat-bubble--${turn.role}`}>
            {turn.pending ? (
              <span className="spinner" aria-label="Thinking" />
            ) : turn.error ? (
              <span className="error-text">{turn.error}</span>
            ) : (
              <ReactMarkdown>{turn.content}</ReactMarkdown>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        className="chat-input-row"
        onSubmit={(event) => {
          event.preventDefault()
          handleSend()
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a business question…"
          disabled={busy}
        />
        <button type="submit" className="counter" disabled={busy || !input.trim()}>
          {busy ? 'Thinking…' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default ChatPanel

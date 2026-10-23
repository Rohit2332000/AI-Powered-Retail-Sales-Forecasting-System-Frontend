import { useEffect, useMemo, useState } from 'react'
import { getProducts, getStores } from '../api/forecast'
import type { Product, Store } from '../api/types'
import ChatPanel from '../components/ChatPanel'
import TrendBackdrop from '../components/TrendBackdrop'

function AnalyticsChatPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState('')

  useEffect(() => {
    Promise.all([getProducts(), getStores()])
      .then(([productList, storeList]) => {
        setProducts(productList)
        setStores(storeList)
      })
      .catch(() => setLoadError('Could not connect to backend.'))
  }, [])

  const categories = useMemo(() => [...new Set(products.map((product) => product.category))], [products])
  const selectedStoreName = stores.find((store) => store.store_id === selectedStoreId)?.store_name ?? ''

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-top-row">
          <h1>Analytics Chat</h1>
        </div>
        <p className="subtitle">Ask business questions in plain language, answered from real Databricks data</p>
        <TrendBackdrop />
      </header>

      {loadError && <div className="banner error-banner">{loadError}</div>}

      {stores.length > 0 && (
        <div className="panel selector">
          <label className="selector-field">
            <span>Store (optional — enables store-specific questions)</span>
            <select value={selectedStoreId} onChange={(event) => setSelectedStoreId(event.target.value)}>
              <option value="">None selected</option>
              {stores.map((store) => (
                <option key={store.store_id} value={store.store_id}>
                  {store.store_name} ({store.city})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <ChatPanel categories={categories} selectedStoreId={selectedStoreId} selectedStoreName={selectedStoreName} />
    </div>
  )
}

export default AnalyticsChatPage

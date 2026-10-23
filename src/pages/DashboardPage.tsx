import { useEffect, useState } from 'react'
import { getProducts, getStores } from '../api/forecast'
import type { Product, Store } from '../api/types'
import ProductStoreSelector from '../components/ProductStoreSelector'
import ForecastChart from '../components/ForecastChart'
import ExplanationPanel from '../components/ExplanationPanel'
import KPIBar from '../components/KPIBar'
import PipelineControl from '../components/PipelineControl'
import TrendBackdrop from '../components/TrendBackdrop'

function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedStoreId, setSelectedStoreId] = useState('')

  useEffect(() => {
    Promise.all([getProducts(), getStores()])
      .then(([productList, storeList]) => {
        setProducts(productList)
        setStores(storeList)
      })
      .catch(() => setLoadError('Could not connect to backend.'))
  }, [])

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-top-row">
          <h1>Sales AI Forecast Tool</h1>
        </div>
        <p className="subtitle">Databricks-powered forecasts and explanations</p>
        <TrendBackdrop />
      </header>

      {loadError && <div className="banner error-banner">{loadError}</div>}

      <KPIBar />

      <PipelineControl />

      <ProductStoreSelector
        products={products}
        stores={stores}
        selectedProductId={selectedProductId}
        selectedStoreId={selectedStoreId}
        onSelectProduct={setSelectedProductId}
        onSelectStore={setSelectedStoreId}
      />

      <div className="dashboard-grid">
        <ForecastChart productId={selectedProductId} storeId={selectedStoreId} />

        {selectedProductId && selectedStoreId ? (
          <ExplanationPanel
            key={`${selectedProductId}-${selectedStoreId}`}
            productId={selectedProductId}
            storeId={selectedStoreId}
          />
        ) : (
          <div className="panel explanation-panel empty-state">
            <p>Select a product and store to explain the forecast.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage

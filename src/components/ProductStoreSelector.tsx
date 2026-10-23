import type { Product, Store } from '../api/types'

interface ProductStoreSelectorProps {
  products: Product[]
  stores: Store[]
  selectedProductId: string
  selectedStoreId: string
  onSelectProduct: (productId: string) => void
  onSelectStore: (storeId: string) => void
}

function ProductStoreSelector({
  products,
  stores,
  selectedProductId,
  selectedStoreId,
  onSelectProduct,
  onSelectStore,
}: ProductStoreSelectorProps) {
  return (
    <div className="panel selector">
      <label className="selector-field">
        <span>Product</span>
        <select value={selectedProductId} onChange={(event) => onSelectProduct(event.target.value)}>
          <option value="">Select a product…</option>
          {products.map((product) => (
            <option key={product.product_id} value={product.product_id}>
              {product.product_name} ({product.category})
            </option>
          ))}
        </select>
      </label>

      <label className="selector-field">
        <span>Store</span>
        <select value={selectedStoreId} onChange={(event) => onSelectStore(event.target.value)}>
          <option value="">Select a store…</option>
          {stores.map((store) => (
            <option key={store.store_id} value={store.store_id}>
              {store.store_name} ({store.city})
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default ProductStoreSelector

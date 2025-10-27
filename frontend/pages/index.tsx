import { useState } from 'react'
import axios from 'axios'
import styles from '@/styles/home.module.css'

interface Product {
  id: number
  name: string
  category: string
  price: number
  description: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category && !maxPrice) {
      setError('카테고리 또는 최대 가격을 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${apiBaseUrl}/api/recommend`, {
        category: category || null,
        max_price: maxPrice ? parseFloat(maxPrice) : null,
      })
      setProducts(response.data.recommendations)
      if (response.data.recommendations.length === 0) {
        setError('조건에 맞는 상품이 없습니다.')
      }
    } catch (err) {
      setError('상품을 가져올 수 없습니다. 백엔드가 실행 중인지 확인하세요.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetAll = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${apiBaseUrl}/api/products`)
      setProducts(response.data.products)
    } catch (err) {
      setError('상품을 가져올 수 없습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🛍️ Recommend Your Product</h1>
        <p>당신에게 딱 맞는 상품을 찾아보세요!</p>
      </header>

      <main className={styles.main}>
        <div className={styles.filterSection}>
          <form onSubmit={handleRecommend}>
            <div className={styles.formGroup}>
              <label htmlFor="category">카테고리 (선택사항)</label>
              <input
                type="text"
                id="category"
                placeholder="예: laptop, phone, tablet..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="maxPrice">최대 가격 (선택사항)</label>
              <input
                type="number"
                id="maxPrice"
                placeholder="예: 1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? '추천 중...' : '상품 추천받기'}
            </button>
            <button type="button" onClick={handleGetAll} disabled={loading}>
              전체 상품 보기
            </button>
          </form>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.productsSection}>
          {products.length > 0 ? (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <h3>{product.name}</h3>
                  <p className={styles.category}>카테고리: {product.category}</p>
                  <p className={styles.description}>{product.description}</p>
                  <p className={styles.price}>${product.price}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noProducts}>상품을 표시할 내용이 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  )
}

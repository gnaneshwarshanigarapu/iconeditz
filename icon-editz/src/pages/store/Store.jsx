import React, { useState, useEffect, useCallback } from 'react'
import ProductCard from '../../components/store/ProductCard'
import { useProducts } from '../../hooks/useProducts'

const PAGE_SIZE = 12

// A simple debounce hook to prevent API calls on every keystroke
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

const ProductCardSkeleton = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 animate-pulse">
    <div className="aspect-video w-full rounded-lg bg-gray-600"></div>
    <div className="mt-4 h-5 w-3/4 rounded bg-gray-500"></div>
    <div className="mt-2 h-4 w-1/4 rounded bg-gray-600"></div>
    <div className="mt-4 h-8 w-1/3 rounded bg-gray-500"></div>
  </div>
)

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`h-10 w-10 rounded-lg text-sm font-semibold transition-colors ${
            currentPage === page
              ? 'bg-primary text-white'
              : 'bg-surface hover:bg-white/10 text-text-muted'
          }`}
        >
          {page}
        </button>
      ))}
    </div>
  )
}

export default function Store() {
  const { getProducts } = useProducts()
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Hardcoded categories for now, as we removed them from the old context
  const publishedCategories = ['Preset', 'Template', 'LUTs', 'Editing Pack']
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const { products: fetchedProducts, count } = await getProducts({
          publishedOnly: true,
          page: currentPage,
          pageSize: PAGE_SIZE,
          category: selectedCategory,
          searchQuery: debouncedSearchQuery,
        })
        setProducts(fetchedProducts)
        setTotalPages(Math.ceil(count / PAGE_SIZE))
      } catch (err) {
        setError(err.message)
        // Gracefully handle the missing FTS column error
        if (err.message.includes('column "title_description_fts" does not exist')) {
            console.warn("Full-text search is not configured in Supabase. Falling back to client-side search. Please run the recommended SQL to create the index for better performance.")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [getProducts, currentPage, selectedCategory, debouncedSearchQuery])
  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
    setCurrentPage(1) // Reset to first page
  }
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page
  }

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page)
      window.scrollTo(0, 0) // Scroll to top on page change
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Digital <span className="text-primary">Assets</span>
        </h1>
        <p className="text-xl text-text-muted max-w-2xl mx-auto">
          Elevate your video editing with our premium presets, templates, and assets.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-surface border border-white/10 text-white rounded-lg pl-4 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="md:w-64 flex-shrink-0">
          <select
            className="w-full bg-surface border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
            value={selectedCategory}
            onChange={handleCategoryChange}
            disabled={loading}
          >
            <option value="All">All Categories</option>
            {publishedCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-red-500/20 text-red-400">
          <h3 className="text-xl font-medium text-white mb-2">Something went wrong</h3>
          <p className="text-text-muted">{error}</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-surface rounded-xl border border-white/5">
          <h3 className="text-xl font-medium text-white mb-2">No products found</h3>
          <p className="text-text-muted">Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
}

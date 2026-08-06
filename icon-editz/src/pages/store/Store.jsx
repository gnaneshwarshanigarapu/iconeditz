import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../../components/store/ProductCard'
import { useProductsQuery } from '../../hooks/useProductsQuery'
import { useCmsPage } from '../../services/cms'

const categories = ['All Assets', 'PSD', 'Wedding Invitation', 'After Effects', 'Premiere Pro', 'Photoshop', 'LUTs', 'Sound Packs']

const initialFilters = { query: '', category: 'All Assets', price: 'All', sort: 'Newest First' }

export default function Store() {
  const { data: products = [], isLoading: loading, error } = useProductsQuery()
  const { content } = useCmsPage('Store Page')
  const hero = content.Hero || {}
  const [filters, setFilters] = useState(initialFilters)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draft, setDraft] = useState(initialFilters)

  const displayed = useMemo(
    () =>
      [...products]
        .filter((item) => {
          const haystack = `${item.title} ${item.description} ${item.category}`.toLowerCase()
          const itemPrice = Number(item.discountPrice ?? item.discount_price ?? item.price ?? 0)
          return (
            haystack.includes(filters.query.toLowerCase()) &&
            (filters.category === 'All Assets' || item.category?.toLowerCase() === filters.category.toLowerCase()) &&
            (filters.price === 'All' || (filters.price === 'Free' ? itemPrice === 0 : itemPrice > 0))
          )
        })
        .sort((a, b) => {
          const aPrice = Number(a.discountPrice ?? a.discount_price ?? a.price ?? 0)
          const bPrice = Number(b.discountPrice ?? b.discount_price ?? b.price ?? 0)
          if (filters.sort === 'Price Low → High') return aPrice - bPrice
          if (filters.sort === 'Price High → Low') return bPrice - aPrice
          const aDate = new Date(a.created_at || 0)
          const bDate = new Date(b.created_at || 0)
          return filters.sort === 'Oldest First' ? aDate - bDate : bDate - aDate
        }),
    [products, filters]
  )

  const openDrawer = () => {
    setDraft(filters)
    setDrawerOpen(true)
  }
  const applyFilters = () => {
    setFilters(draft)
    setDrawerOpen(false)
  }
  const resetFilters = () => setDraft(initialFilters)

  return (
    <main className="relative mx-auto max-w-7xl px-3 pb-24 pt-24 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      {/* Top Banner Box */}
      <header className="rounded-2xl border border-white/10 bg-[#120a22]/90 p-5 sm:p-10 shadow-2xl backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold text-white sm:text-4xl lg:text-5xl">
          {hero.heading || 'Creative Assets Store'}
        </h1>
        <p className="mt-2 text-xs font-medium leading-relaxed text-white/60 sm:mt-3 sm:text-base">
          {hero.description || 'Premium LUTs, sound packs, motion templates and more - built for editors.'}
        </p>
      </header>

      {/* Horizontal Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = filters.category === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-sm ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-950/50 scale-105'
                  : 'border border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Mobile Filter Button */}
      <button
        type="button"
        onClick={openDrawer}
        className="flex h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/15 px-4 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 backdrop-blur-xl transition hover:bg-violet-500/25 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4 text-violet-200" />
        FILTERS & CATEGORIES
      </button>

      {/* Main Grid Layout (Sidebar + 2-Col Mobile / 4-Col Desktop Product Cards) */}
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        {/* Left Sidebar Filters */}
        <aside className="hidden h-fit rounded-2xl border border-white/10 bg-[#120a22]/90 p-5 shadow-xl backdrop-blur-xl lg:sticky lg:top-28 lg:block">
          <FilterSidebar filters={filters} setFilters={setFilters} />
        </aside>

        {/* Product Results Grid */}
        <ProductResults loading={loading} error={error?.message} products={displayed} />
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <MobileFilterDrawer
            draft={draft}
            setDraft={setDraft}
            onApply={applyFilters}
            onReset={resetFilters}
            onClose={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

function FilterSidebar({ filters, setFilters }) {
  const set = (field, value) => setFilters((current) => ({ ...current, [field]: value }))

  return (
    <div className="space-y-6 text-xs">
      <p className="font-mono font-bold uppercase tracking-widest text-white/40">
        FILTERS
      </p>

      {/* Search Assets */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
        <input
          value={filters.query}
          onChange={(e) => set('query', e.target.value)}
          placeholder="Search assets..."
          className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/40 focus:border-violet-500/50"
        />
      </div>

      {/* Sort By Radio Options */}
      <div className="space-y-3 pt-1 border-t border-white/10">
        <p className="font-bold text-white">Sort By</p>
        <div className="space-y-2">
          {['Newest First', 'Oldest First', 'Price Low → High', 'Price High → Low'].map((opt) => (
            <label
              key={opt}
              onClick={() => set('sort', opt)}
              className="flex items-center gap-2.5 cursor-pointer text-white/70 hover:text-white select-none"
            >
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                filters.sort === opt ? 'border-violet-500 bg-violet-500/20' : 'border-white/30'
              }`}>
                {filters.sort === opt && <div className="h-2 w-2 rounded-full bg-violet-400" />}
              </div>
              <span className={filters.sort === opt ? 'font-bold text-white' : ''}>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Radio Options */}
      <div className="space-y-3 pt-3 border-t border-white/10">
        <p className="font-bold text-white">Price</p>
        <div className="space-y-2">
          {['All', 'Free', 'Paid'].map((opt) => (
            <label
              key={opt}
              onClick={() => set('price', opt)}
              className="flex items-center gap-2.5 cursor-pointer text-white/70 hover:text-white select-none"
            >
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                filters.price === opt ? 'border-violet-500 bg-violet-500/20' : 'border-white/30'
              }`}>
                {filters.price === opt && <div className="h-2 w-2 rounded-full bg-violet-400" />}
              </div>
              <span className={filters.price === opt ? 'font-bold text-white' : ''}>{opt}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function MobileFilterDrawer({ draft, setDraft, onApply, onReset, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm lg:hidden"
      onClick={onClose}
    >
      <motion.section
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={(event) => event.stopPropagation()}
        className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[24px] border border-white/10 bg-[#140b22] p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Filters</h2>
          <button onClick={onClose} aria-label="Close filters" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <FilterSidebar filters={draft} setFilters={setDraft} />
        <div className="sticky bottom-0 mt-4 grid grid-cols-[1fr_auto] gap-3 border-t border-white/10 bg-[#140b22] pt-4">
          <button onClick={onApply} className="h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-xs font-bold text-white shadow-lg shadow-violet-950/40">
            Apply Filters
          </button>
          <button onClick={onReset} className="h-11 rounded-xl border border-white/15 px-4 text-xs font-bold text-white/80">
            Reset
          </button>
        </div>
      </motion.section>
    </motion.div>
  )
}

function ProductResults({ loading, error, products }) {
  if (loading) {
    return (
      <section className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="aspect-square animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        ))}
      </section>
    )
  }

  if (error) {
    return (
      <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-xs text-red-200">
        {error}
      </p>
    )
  }

  if (!products.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-xs text-white/60">
        No assets match these filters.
      </div>
    )
  }

  return (
    <section className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  )
}

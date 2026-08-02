import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../../components/store/ProductCard'
import { useProductsQuery } from '../../hooks/useProductsQuery'
import CmsPageContent from '../../components/CmsPageContent'

const categories = ['All Assets', 'PSD', 'Wedding Invitation', 'After Effects', 'Premiere Pro', 'Photoshop', 'LUTs', 'Sound Packs']
const prices = ['All', 'Free', 'Paid']
const sorts = ['Newest', 'Oldest', 'Price Low → High', 'Price High → Low']
const initialFilters = { query: '', category: 'All Assets', price: 'All', sort: 'Newest' }

export default function Store() {
  const { data: products = [], isLoading: loading, error } = useProductsQuery()
  const [filters, setFilters] = useState(initialFilters)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draft, setDraft] = useState(initialFilters)

  const displayed = useMemo(() => [...products]
    .filter((item) => {
      const haystack = `${item.title} ${item.description} ${item.category}`.toLowerCase()
      const itemPrice = Number(item.discountPrice ?? item.discount_price ?? item.price ?? 0)
      return haystack.includes(filters.query.toLowerCase())
        && (filters.category === 'All Assets' || item.category?.toLowerCase() === filters.category.toLowerCase())
        && (filters.price === 'All' || (filters.price === 'Free' ? itemPrice === 0 : itemPrice > 0))
    })
    .sort((a, b) => {
      const aPrice = Number(a.discountPrice ?? a.discount_price ?? a.price ?? 0)
      const bPrice = Number(b.discountPrice ?? b.discount_price ?? b.price ?? 0)
      if (filters.sort === 'Price Low → High') return aPrice - bPrice
      if (filters.sort === 'Price High → Low') return bPrice - aPrice
      const aDate = new Date(a.created_at || 0)
      const bDate = new Date(b.created_at || 0)
      return filters.sort === 'Oldest' ? aDate - bDate : bDate - aDate
    }), [products, filters])

  const openDrawer = () => { setDraft(filters); setDrawerOpen(true) }
  const applyFilters = () => { setFilters(draft); setDrawerOpen(false) }
  const resetFilters = () => setDraft(initialFilters)

  return <><CmsPageContent page="Store Page" fallbackTitle="Store" fallbackDescription="Premium creative assets." /><main className="relative mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-8">
    <header className="mb-10"><p className="text-sm font-semibold uppercase tracking-[.28em] text-violet-300">ICON EDITZ Marketplace</p><h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Premium creative assets.</h1><p className="mt-4 max-w-2xl text-white/60">Templates, edits, presets, and creative tools built to make your next project stand out.</p></header>

    <button onClick={openDrawer} className="mb-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/15 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 backdrop-blur-xl transition hover:bg-violet-500/25 lg:hidden"><SlidersHorizontal className="h-5 w-5 text-violet-200" />Filter &amp; Categories</button>

    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="hidden h-fit rounded-[24px] border border-white/10 bg-white/[.055] p-5 shadow-xl backdrop-blur-xl lg:sticky lg:top-28 lg:block">
        <FilterControls filters={filters} setFilters={setFilters} />
      </aside>
      <ProductResults loading={loading} error={error?.message} products={displayed} />
    </div>

    <AnimatePresence>
      {drawerOpen && <MobileFilterDrawer draft={draft} setDraft={setDraft} onApply={applyFilters} onReset={resetFilters} onClose={() => setDrawerOpen(false)} />}
    </AnimatePresence>
  </main></>
}

function FilterControls({ filters, setFilters }) {
  const set = (field, value) => setFilters((current) => ({ ...current, [field]: value }))
  return <>
    <div className="flex items-center gap-2 text-sm font-semibold text-white"><SlidersHorizontal className="h-4 w-4 text-violet-300" />Browse assets</div>
    <label className="relative mt-5 block"><Search className="absolute left-3 top-3 h-4 w-4 text-white/40" /><input value={filters.query} onChange={(event) => set('query', event.target.value)} placeholder="Search Assets" className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-violet-400/50" /></label>
    <Filter title="Category Filter" options={categories} selected={filters.category} onChange={(value) => set('category', value)} />
    <Filter title="Price Filter" options={prices} selected={filters.price} onChange={(value) => set('price', value)} />
    <label className="mt-6 block text-sm font-semibold text-white">Sort<select value={filters.sort} onChange={(event) => set('sort', event.target.value)} className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none">{sorts.map((option) => <option key={option}>{option}</option>)}</select></label>
  </>
}

function MobileFilterDrawer({ draft, setDraft, onApply, onReset, onClose }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm lg:hidden" onClick={onClose}>
    <motion.section initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }} onClick={(event) => event.stopPropagation()} className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[24px] border border-white/10 bg-[#140b22] p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold text-white">Filter &amp; Categories</h2><button onClick={onClose} aria-label="Close filters" className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white"><X className="h-5 w-5" /></button></div>
      <FilterControls filters={draft} setFilters={setDraft} />
      <div className="sticky bottom-0 mt-6 grid grid-cols-[1fr_auto] gap-3 border-t border-white/10 bg-[#140b22] pt-5"><button onClick={onApply} className="h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-sm font-semibold text-white shadow-lg shadow-violet-950/40">Apply Filters</button><button onClick={onReset} className="h-12 rounded-xl border border-white/15 px-5 text-sm font-semibold text-white/80">Reset</button></div>
    </motion.section>
  </motion.div>
}

function ProductResults({ loading, error, products }) {
  if (loading) return <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-[24px] bg-white/10" />)}</section>
  if (error) return <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">{error}</p>
  if (!products.length) return <div className="rounded-[24px] border border-white/10 bg-white/[.04] p-12 text-center text-white/55">No assets match these filters.</div>
  return <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</section>
}

function Filter({ title, options, selected, onChange }) {
  return <div className="mt-6"><p className="text-sm font-semibold text-white">{title}</p><div className="mt-3 space-y-1">{options.map((option) => <button key={option} type="button" onClick={() => onChange(option)} className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${selected === option ? 'bg-violet-500/20 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>{option}</button>)}</div></div>
}

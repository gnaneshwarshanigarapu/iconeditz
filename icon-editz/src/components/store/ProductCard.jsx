import React from 'react'
import { Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const image = product.image || product.thumbnail_path || product.thumbnail || '/assets/images/og-icon-editz.png'
  const salePrice = product.discountPrice ?? product.discount_price
  const price = Number(product.price || 0)
  const currentPrice = salePrice ?? price
  const isFree = Number(currentPrice) === 0
  const isSale = salePrice != null && Number(salePrice) < price
  const badge = product.badge || (isFree ? 'FREE!' : isSale ? 'SALE!' : product.is_new ? 'NEW!' : 'SALE!')
  const productPath = `/store/${product.slug || product.id}`

  const share = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    const url = `${window.location.origin}${productPath}`
    if (navigator.share) await navigator.share({ title: product.title, url })
    else await navigator.clipboard?.writeText(url)
  }

  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#120a22]/90 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-950/50">
      <Link to={productPath} className="absolute inset-0 z-0" aria-label={`View ${product.title}`} />

      {/* Square Thumbnail Image matching reference screenshot */}
      <div className="relative z-10 aspect-square w-full overflow-hidden bg-[#0a0518]">
        <img
          src={image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = '/assets/images/og-icon-editz.png'
          }}
          loading="lazy"
          decoding="async"
        />

        {/* Top Left Red SALE! Badge */}
        {badge && (
          <span className="absolute left-3 top-3 rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-rose-950/50">
            {badge}
          </span>
        )}

        {/* Top Right Share Circular Button */}
        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={share}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition hover:bg-violet-600/60"
            aria-label="Share product"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">
        {/* Category Pill */}
        <span className="w-fit rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
          {product.category || 'Asset'}
        </span>

        {/* Product Title */}
        <h3 className="mt-2.5 line-clamp-2 text-sm font-bold text-white leading-snug sm:text-base">
          {product.title}
        </h3>

        {/* Subtitle Description */}
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/55">
          {product.description || 'Premium creative asset for editors and content creators.'}
        </p>

        {/* Price Row */}
        <div className="mt-4 flex items-baseline gap-2">
          {isSale && (
            <span className="text-xs text-white/40 line-through">
              Rs {price.toFixed(2)}
            </span>
          )}
          <span className="text-lg font-extrabold text-white sm:text-xl">
            {isFree ? 'Free' : `Rs ${Number(currentPrice).toFixed(2)}`}
          </span>
        </div>

        {/* Full-width Pill Buy Now Button */}
        <div className="mt-4 pt-1">
          <Link
            to={productPath}
            className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-purple-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-950/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-violet-600/40 sm:text-sm"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </article>
  )
}

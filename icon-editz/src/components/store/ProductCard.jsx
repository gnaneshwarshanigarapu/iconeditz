import React from 'react'
import { Heart, Share2, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const image = product.image || product.thumbnail_path || product.thumbnail || '/assets/images/og-icon-editz.png'
  const salePrice = product.discountPrice ?? product.discount_price
  const price = Number(product.price || 0)
  const currentPrice = salePrice ?? price
  const isFree = Number(currentPrice) === 0
  const badge = product.badge || (isFree ? 'FREE' : salePrice && salePrice < price ? 'SALE' : product.is_new ? 'NEW' : null)
  const productPath = `/store/${product.slug || product.id}`

  const share = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    const url = `${window.location.origin}${productPath}`
    if (navigator.share) await navigator.share({ title: product.title, url })
    else await navigator.clipboard?.writeText(url)
  }

  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#120a22]/80 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-950/50">
      <Link to={productPath} className="absolute inset-0 z-0" aria-label={`View ${product.title}`} />

      {/* Thumbnail Container */}
      <div className="relative z-10 aspect-[16/10] w-full overflow-hidden bg-[#0d0718]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#120a22]/80 via-transparent to-transparent" />
        {badge && (
          <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-[#150B25]/90 px-3 py-0.5 text-[10px] font-bold tracking-wide text-white backdrop-blur">
            {badge}
          </span>
        )}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button
            type="button"
            onClick={share}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur transition hover:bg-violet-500/40"
            aria-label="Share product"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur transition hover:bg-violet-500/40"
            aria-label="Add to wishlist"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">
        <span className="w-fit rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
          {product.category || 'Asset'}
        </span>

        <h3 className="mt-2.5 line-clamp-1 text-base font-bold text-white sm:text-lg">
          {product.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/60 sm:text-sm">
          {product.description || 'Premium creative asset for your next project.'}
        </p>

        {/* Responsive Wrap Stats */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/50">
          <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
            <Star className="h-3 w-3 fill-current" />
            {product.rating || '5.0'}
          </span>
          <span>•</span>
          <span>{product.downloads || 0} downloads</span>
          <span>•</span>
          <span className="text-violet-300">{product.stock == null ? 'Digital' : `${product.stock} left`}</span>
        </div>

        {/* Bottom Price & Action */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3.5">
          <div>
            {salePrice != null && salePrice < price && (
              <p className="text-[11px] text-white/40 line-through">₹{price}</p>
            )}
            <p className="text-xl font-extrabold text-white sm:text-2xl">
              {isFree ? 'Free' : `₹${currentPrice}`}
            </p>
          </div>

          <Link
            to={productPath}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-xs font-bold text-white shadow-[0_0_16px_rgba(139,92,246,.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(168,85,247,.6)] sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </article>
  )
}

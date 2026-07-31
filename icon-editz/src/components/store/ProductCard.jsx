import React from 'react'
import { Heart, Share2, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const image = product.image || product.thumbnail_path || '/assets/images/og-icon-editz.png'
  const salePrice = product.discountPrice ?? product.discount_price
  const price = Number(product.price || 0)
  const currentPrice = salePrice ?? price
  const isFree = Number(currentPrice) === 0
  const badge = product.badge || (isFree ? 'FREE' : salePrice ? 'SALE' : product.is_new ? 'NEW' : null)
  const share = async (event) => { event.preventDefault(); event.stopPropagation(); const url = `${window.location.origin}/store/${product.id}`; if (navigator.share) await navigator.share({ title: product.title, url }); else await navigator.clipboard?.writeText(url) }

  return <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.055] shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-violet-400/35 hover:shadow-2xl hover:shadow-violet-950/40">
    <Link to={`/store/${product.id}`} className="absolute inset-0 z-0" aria-label={`View ${product.title}`} />
    <div className="relative z-10 aspect-[4/5] overflow-hidden bg-[#110b1d]">
      <img src={image} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(event) => { event.currentTarget.src = '/assets/images/og-icon-editz.png' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#120a1d]/70 via-transparent to-transparent" />
      {badge && <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-[#150B25]/85 px-3 py-1 text-xs font-bold tracking-wide text-white backdrop-blur">{badge}</span>}
      <div className="absolute right-3 top-3 flex gap-2"><button type="button" onClick={share} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur transition hover:bg-violet-500/35" aria-label="Share product"><Share2 className="h-4 w-4" /></button><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation() }} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur transition hover:bg-violet-500/35" aria-label="Add to wishlist"><Heart className="h-4 w-4" /></button></div>
    </div>
    <div className="relative z-10 flex flex-1 flex-col p-5"><span className="w-fit rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-200">{product.category || 'Asset'}</span><h3 className="mt-3 line-clamp-2 text-lg font-bold text-white">{product.title}</h3><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-white/55">{product.description || 'Premium creative asset for your next project.'}</p><div className="mt-4 flex items-center gap-3 text-xs text-white/45"><span className="inline-flex items-center gap-1 text-amber-300"><Star className="h-3.5 w-3.5 fill-current" />{product.rating || '—'}</span><span>{product.downloads || 0} downloads</span><span>{product.stock == null ? 'Digital' : `${product.stock} left`}</span></div><div className="mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-4"><div>{salePrice != null && <p className="text-xs text-white/40 line-through">₹{price}</p>}<p className="text-2xl font-bold text-white">{isFree ? 'Free' : `₹${currentPrice}`}</p></div><Link to={`/store/${product.id}`} className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_rgba(139,92,246,.35)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(168,85,247,.7)]">Buy Now</Link></div></div>
  </article>
}

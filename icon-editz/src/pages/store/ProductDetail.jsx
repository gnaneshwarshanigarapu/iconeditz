import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CheckoutModal from '../../components/store/CheckoutModal'
import { commerceData, metaEvent } from '../../lib/metaPixel'
import { trackGaCommerce } from '../../utils/tracking'
import { request } from '../../utils/api'

const fallbackImage = '/assets/images/og-icon-editz.png'

function NotFound({ reason }) {
  return <div className="mx-auto max-w-7xl px-4 py-32 text-center sm:px-6 lg:px-8"><h2 className="mb-4 text-3xl font-bold text-white">Product Not Found</h2><p className="mb-8 text-text-muted">{reason || 'The product does not exist or is not published.'}</p><Link to="/store" className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-hover">Back to Store</Link></div>
}

function Unpublished() {
  return <div className="mx-auto max-w-7xl px-4 py-32 text-center sm:px-6 lg:px-8"><h2 className="mb-4 text-3xl font-bold text-white">This product is not published.</h2><Link to="/store" className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-hover">Back to Store</Link></div>
}

export default function ProductDetail() {
  // This name intentionally matches StoreRoutes: /store/:productId.
  const { productId: id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [notFoundReason, setNotFoundReason] = useState('')
  const [unpublished, setUnpublished] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setNotFound(false)
    setNotFoundReason('')
    setProduct(null)
    setUnpublished(false)
    if (!id) { setNotFound(true); setNotFoundReason('The product URL is missing an ID.'); setLoading(false); return undefined }
    const url = `/api/products?id=${encodeURIComponent(id)}`
    request(url)
      .then((payload) => {
        return payload?.product
      })
      .then((item) => { if (active) { setProduct(item); setNotFound(!item); if (!item) setNotFoundReason('Product not found'); if (item && !item.adminPreview && (item.published !== true || item.status !== 'published')) setUnpublished(true) } })
      .catch((error) => {
        if (!active) return
        const reason = error.code === 'INVALID_UUID'
          ? 'The product URL contains an invalid ID.'
          : error.code === 'PRODUCT_DRAFT'
            ? 'This product is not published.'
            : error.code === 'PRODUCT_DELETED'
              ? 'This product has been deleted.'
              : error.status === 404 ? 'Product not found' : 'The product could not be loaded. Please try again.'
        setNotFound(true)
        setNotFoundReason(reason)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  // These effects must be declared before early returns to preserve hook order.
  useEffect(() => {
    if (!product || unpublished) return
    metaEvent('ViewContent', commerceData(product))
    trackGaCommerce('view_item', product)
  }, [product, unpublished])

  useEffect(() => {
    if (showCheckout && product && !unpublished) {
      metaEvent('AddToCart', commerceData(product))
      trackGaCommerce('add_to_cart', product)
    }
  }, [showCheckout, product, unpublished])

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-32 text-center text-text-muted sm:px-6 lg:px-8">Loading product…</div>
  if (notFound || !product) return <NotFound reason={notFoundReason} />
  if (unpublished) return <Unpublished />

  const title = product.title || 'Untitled product'
  const image = product.thumbnail_path || product.thumbnail || product.image || fallbackImage
  const demoVideo = product.demo_video || product.demoVideo
  const features = Array.isArray(product.features) && product.features.length ? product.features : ['Instant download', 'Detailed tutorial included', 'Lifetime access']
  const tags = Array.isArray(product.tags) ? product.tags : []
  const screenshots = Array.isArray(product.screenshots) ? product.screenshots.filter(Boolean) : []
  const price = Number(product.price || 0)
  const discountPrice = product.discount_price ?? product.discountPrice
  const payablePrice = Number(discountPrice ?? price)

  return <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
    <div className="mb-8"><Link to="/store" className="inline-flex items-center text-primary transition-colors hover:text-primary-hover"><svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Back to Store</Link></div>
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2"><div><div className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-surface-dark">{isPlaying && demoVideo ? <video src={demoVideo} className="h-full w-full object-cover" controls autoPlay onEnded={() => setIsPlaying(false)} /> : <><img src={image} alt={title} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = fallbackImage }} />{demoVideo && <button onClick={() => setIsPlaying(true)} className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/20" aria-label="Play demo video"><span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-white shadow-lg">▶</span></button>}</>}</div><div className="mt-8 rounded-xl border border-white/5 bg-surface p-6"><h3 className="mb-4 text-xl font-bold text-white">Features</h3><ul className="space-y-3 text-text-muted">{features.map((feature, index) => <li key={`${feature}-${index}`} className="flex items-center"><span className="mr-3 text-primary">✓</span>{String(feature)}</li>)}</ul></div></div>
      <div className="flex flex-col"><div className="mb-2"><span className="rounded-full border border-primary/20 bg-primary/20 px-3 py-1 text-sm font-medium text-primary">{product.category || 'Creative asset'}</span></div><h1 className="mb-4 text-3xl font-extrabold text-white md:text-4xl">{title}</h1><p className="mb-8 text-lg leading-relaxed text-text-muted">{product.description || 'Premium creative asset for your next project.'}</p><div className="mb-8"><h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-muted">Tags</h3><div className="flex flex-wrap gap-2">{tags.length ? tags.map((tag, index) => <span key={`${tag}-${index}`} className="rounded-md border border-white/10 bg-surface-dark px-3 py-1 text-sm text-text-muted">#{String(tag)}</span>) : <span className="text-sm text-text-muted">No tags added.</span>}</div></div><div className="mt-auto rounded-xl border border-white/10 bg-surface p-6 shadow-xl"><div className="mb-6 flex items-center justify-between gap-6"><span className="text-lg text-text-muted">Price</span><div className="text-right">{discountPrice != null && <span className="block text-lg text-text-muted line-through">Rs.{price}</span>}<span className="text-4xl font-bold text-white">Rs.{payablePrice}</span></div></div><button onClick={() => setShowCheckout(true)} className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover">Buy Now</button><p className="mt-4 text-center text-sm text-text-muted">Secure payment via Razorpay</p></div></div></div>
    {screenshots.length > 0 && <div className="mt-16"><h2 className="mb-6 text-2xl font-bold text-white">Screenshots</h2><div className="grid grid-cols-1 gap-6 md:grid-cols-3">{screenshots.map((screenshot, index) => <img key={`${screenshot}-${index}`} src={screenshot} alt={`${title} screenshot ${index + 1}`} className="aspect-video rounded-xl border border-white/10 bg-surface object-cover" onError={(event) => { event.currentTarget.style.display = 'none' }} />)}</div></div>}
    {showCheckout && <CheckoutModal product={product} onClose={() => setShowCheckout(false)} />}
  </div>
}

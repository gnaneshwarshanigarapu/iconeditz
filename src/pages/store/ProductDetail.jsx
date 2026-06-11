import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'

export default function ProductDetail() {
  const { productId } = useParams()
  const { getProduct } = useProducts()
  const product = getProduct(productId)
  const [isPlaying, setIsPlaying] = useState(false)

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Product Not Found</h2>
        <p className="text-text-muted mb-8">The product you're looking for doesn't exist or is not published.</p>
        <Link to="/store" className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Back to Store
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-8">
        <Link to="/store" className="text-primary hover:text-primary-hover inline-flex items-center transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Store
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="bg-surface-dark rounded-xl overflow-hidden border border-white/10 aspect-video relative group">
            {isPlaying && product.demoVideo ? (
              <video
                src={product.demoVideo}
                className="w-full h-full object-cover"
                controls
                autoPlay
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <>
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = 'https://via.placeholder.com/1280x720.png?text=Icon+Editz'
                  }}
                />
                {product.demoVideo && (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors"
                    aria-label="Play demo video"
                  >
                    <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="mt-8 bg-surface rounded-xl p-6 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-4">Features</h3>
            <ul className="space-y-3 text-text-muted">
              {(product.features?.length ? product.features : ['Instant download', 'Detailed tutorial included', 'Lifetime access']).map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-2">
            <span className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full border border-primary/20">
              {product.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{product.title}</h1>
          <p className="text-lg text-text-muted mb-8 leading-relaxed">{product.description}</p>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags?.map((tag) => (
                <span key={tag} className="bg-surface-dark text-text-muted border border-white/10 px-3 py-1 rounded-md text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto bg-surface rounded-xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between gap-6 mb-6">
              <span className="text-text-muted text-lg">Price</span>
              <div className="text-right">
                {product.discountPrice && <span className="block text-lg text-text-muted line-through">Rs.{product.price}</span>}
                <span className="text-4xl font-bold text-white">Rs.{product.discountPrice || product.price}</span>
              </div>
            </div>

            <button className="w-full bg-primary hover:bg-primary-hover text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-1 active:translate-y-0">
              Buy Now
            </button>
            <p className="text-center text-text-muted text-sm mt-4">Payment integration coming soon</p>
          </div>
        </div>
      </div>

      {product.screenshots?.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Screenshots</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.screenshots.map((screenshot) => (
              <img
                key={screenshot}
                src={screenshot}
                alt={`${product.title} screenshot`}
                className="aspect-video rounded-xl border border-white/10 object-cover bg-surface"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

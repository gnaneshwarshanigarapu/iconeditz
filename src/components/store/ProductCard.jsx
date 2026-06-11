import React from 'react'
import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const displayPrice = product.discountPrice || product.price

  return (
    <div className="bg-surface rounded-xl overflow-hidden shadow-lg border border-white/5 hover:border-primary/50 transition-all group flex flex-col h-full">
      <div className="relative aspect-video bg-surface-dark overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(event) => {
            event.currentTarget.src = 'https://via.placeholder.com/640x360.png?text=Icon+Editz'
          }}
        />
        <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-md font-medium">
          {product.category}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-text mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-text-muted text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>

        <div className="flex items-center justify-between gap-4 mt-auto pt-4 border-t border-white/10">
          <div>
            {product.discountPrice && <span className="block text-sm text-text-muted line-through">Rs.{product.price}</span>}
            <span className="text-2xl font-bold text-primary">Rs.{displayPrice}</span>
          </div>
          <Link
            to={`/store/${product.id}`}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

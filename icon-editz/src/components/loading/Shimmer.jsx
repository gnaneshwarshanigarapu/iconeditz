import React from 'react'

export default function Shimmer({ className = '', style = {} }) {
  return (
    <div
      className={`shimmer-purple rounded-xl ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

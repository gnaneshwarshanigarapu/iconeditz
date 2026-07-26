import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#05020a] px-4">
          <div className="max-w-xl rounded-[2rem] border border-primary/20 bg-white/5 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.32em] text-primary">Something went wrong</p>
            <h1 className="mt-4 text-3xl font-semibold text-white">The page could not be rendered.</h1>
            <p className="mt-4 text-base leading-8 text-text-muted">Please refresh the page or return home.</p>
            <a href="/" className="mt-8 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">Return Home</a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

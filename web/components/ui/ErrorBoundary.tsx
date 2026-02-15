'use client'
import React from 'react'

interface State { hasError: boolean; error?: Error; reloading?: boolean }

const reloadPage = () => {
  if (typeof window !== 'undefined' && window.location) {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(n => caches.delete(n))
      }).finally(() => {
        window.location.reload()
      })
    } else {
      window.location.reload()
    }
  }
}

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, State> {
  constructor(props: any) { 
    super(props); 
    this.state = { hasError: false }; 
  }
  
  static getDerivedStateFromError(error: Error): State { 
    return { hasError: true, error }; 
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError)
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleGlobalError)
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
    }
  }

  handleGlobalError = (event: ErrorEvent) => {
    this.handleChunkError(event.error || new Error(event.message))
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.handleChunkError(event.reason || new Error('Unhandled promise rejection'))
  }

  handleChunkError = (error: Error) => {
    const isChunkError = 
      error?.name === 'ChunkLoadError' || 
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('NetworkError') ||
      error?.message?.includes('network') ||
      error?.message?.includes('dynamically')

    if (isChunkError) {
      console.error('ChunkLoadError detected, reloading...', error)
      this.attemptReload()
    }
  }

  attemptReload = () => {
    if (typeof window === 'undefined') return
    
    const lastReload = sessionStorage.getItem('last-error-reload')
    const now = Date.now()
    
    if (!lastReload || now - parseInt(lastReload) > 5000) {
      sessionStorage.setItem('last-error-reload', now.toString())
      reloadPage()
    } else {
      this.setState({ hasError: true, reloading: false })
    }
  }

  handleManualReload = () => {
    sessionStorage.removeItem('last-error-reload')
    reloadPage()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#f9fafb]">
          <div className="text-5xl mb-4">🌱</div>
          <h1 className="text-xl font-bold mb-2 text-stone-800">Ceva nu a mers bine</h1>
          <p className="text-stone-500 mb-6">Te rugăm reîncarcă pagina.</p>
          <button 
            onClick={this.handleManualReload} 
            className="px-8 py-3 bg-[#22c55e] text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
          >
            Reîncarcă pagina
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

'use client'
import React from 'react'

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, State> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }

  componentDidCatch(error: Error) {
    const isChunkError = error.name === 'ChunkLoadError' || 
                         error.message?.includes('Loading chunk') || 
                         error.message?.includes('Unexpected token') ||
                         error.message?.includes('Failed to fetch');

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('last-error-reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem('last-error-reload', now.toString());
        window.location.reload();
      }
    }
  }

  handleManualReload = () => {
    if ('caches' in window) caches.keys().then(names => names.forEach(n => caches.delete(n)));
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#f9fafb]">
          <div className="text-5xl mb-4">🌱</div>
          <h1 className="text-xl font-bold mb-2">Ceva nu a mers bine</h1>
          <p className="text-gray-500 mb-6">O versiune nouă a fost publicată. Te rugăm reîncarcă pagina.</p>
          <button onClick={this.handleManualReload} className="px-8 py-3 bg-[#22c55e] text-white rounded-xl font-semibold">
            Reîncarcă pagina
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

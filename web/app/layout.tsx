import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/Toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { BeneficiaryProvider } from '@/contexts/BeneficiaryContext'
import { ModalOverlayProvider } from '@/contexts/ModalOverlayContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { AmbientBackground } from '@/components/ui/AmbientBackground'
import { HydrationGuard } from '@/components/ui/HydrationGuard'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: "Grădina cu Vorbe Bune",
  description: "Cultivă empatia prin cuvinte",
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Empatie',
  },
}

export const viewport: Viewport = {
  themeColor: '#22c55e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Catch chunk loading errors and auto-reload
              window.addEventListener('error', function(e) {
                // Log all errors for debugging
                console.log('Global error:', e.message, e.filename);
                
                // Check for chunk errors
                if (e.message && (
                  e.message.includes('chunk') ||
                  e.message.includes('Loading chunk') ||
                  e.message.includes('Failed to fetch') ||
                  e.message.includes('NetworkError') ||
                  e.message.includes('dynamically')
                )) {
                  var lastReload = sessionStorage.getItem('chunk-reload');
                  if (!lastReload || Date.now() - parseInt(lastReload) > 5000) {
                    sessionStorage.setItem('chunk-reload', Date.now().toString());
                    console.log('Chunk error detected, reloading...');
                    window.location.reload();
                  }
                }
                
                // Only suppress external script errors, not Next.js chunks
                if (e.filename && !e.filename.includes(location.hostname) && !e.filename.includes('_next/')) {
                  e.preventDefault();
                }
              }, true);

              // Catch unhandled promise rejections
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && (
                  e.reason.name === 'ChunkLoadError' ||
                  (e.reason.message && e.reason.message.includes('chunk')) ||
                  (e.reason.message && e.reason.message.includes('dynamically'))
                )) {
                  var lastReload = sessionStorage.getItem('chunk-reload');
                  if (!lastReload || Date.now() - parseInt(lastReload) > 5000) {
                    sessionStorage.setItem('chunk-reload', Date.now().toString());
                    console.log('Unhandled rejection chunk error, reloading...');
                    window.location.reload();
                  }
                }
              });
            `,
          }}
        />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" async></script>
      </head>
      <body className={`${plusJakartaSans.variable} font-sans antialiased`} suppressHydrationWarning>
        <AmbientBackground />
        <ErrorBoundary>
            <AuthProvider>
              <FavoritesProvider>
                <BeneficiaryProvider>
                  <ModalOverlayProvider>
                    <AppLayout>{children}</AppLayout>
                    <Toaster />
                  </ModalOverlayProvider>
                </BeneficiaryProvider>
              </FavoritesProvider>
            </AuthProvider>
        </ErrorBoundary>
        
        {/* Fallback for when JS completely fails */}
        <noscript>
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            fontFamily: 'system-ui, sans-serif',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
            <h1 style={{ color: '#1c1917', fontSize: '24px', marginBottom: '8px' }}>
              Grădina cu Vorbe Bune
            </h1>
            <p style={{ color: '#57534e', marginBottom: '16px' }}>
              Această aplicație necesită JavaScript pentru a funcționa.
            </p>
            <p style={{ color: '#78716c', fontSize: '14px' }}>
              Te rugăm să activezi JavaScript în setările browser-ului.
            </p>
          </div>
        </noscript>
      </body>
    </html>
  )
}

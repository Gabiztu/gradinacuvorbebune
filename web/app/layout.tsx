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
              window.addEventListener('error', function(e) {
                if (e.filename && !e.filename.includes(location.hostname)) {
                  e.preventDefault(); return false;
                }
                if (e.message && (e.message.includes('chunk') || e.message.includes('Unexpected token'))) {
                  var last = sessionStorage.getItem('chunk-reload');
                  if (!last || Date.now() - parseInt(last) > 10000) {
                    sessionStorage.setItem('chunk-reload', Date.now().toString());
                    window.location.reload();
                  }
                }
              }, true);

              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && (e.reason.name === 'ChunkLoadError' || (e.reason.message && e.reason.message.includes('dynamically')))) {
                  window.location.reload();
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
          <HydrationGuard>
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
          </HydrationGuard>
        </ErrorBoundary>
      </body>
    </html>
  )
}

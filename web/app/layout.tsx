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

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: 'Empatie - Companion Digital',
  description: 'Cuvinte motivaționale pentru copii și tineri',
  manifest: '/manifest.json',
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
    <html lang="ro" className="scroll-smooth">
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://code.iconify.design https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://xukhmcmpmfrjejyqdkwe.supabase.co;" />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" async></script>
      </head>
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <AmbientBackground />
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
      </body>
    </html>
  )
}

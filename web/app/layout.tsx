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
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" async></script>
      </head>
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <AmbientBackground />
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
      </body>
    </html>
  )
}

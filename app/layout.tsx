import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, Playfair_Display } from 'next/font/google'
import { ConsentGate } from '@/components/analytics'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ChromeGate, Footer, Header, SkipToContent } from '@/components/layout'
import { cn } from '@/lib/utils'
import { SITE_KEYWORDS } from '@/lib/seo'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://villaparadisetahiti.com'
  ),
  title: 'Villa Paradise Tahiti — Luxury Villa Rental',
  description:
    'A private luxury villa retreat in Tahiti, French Polynesia. Direct booking with curated experiences and concierge services.',
  keywords: [...SITE_KEYWORDS],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(cormorant.variable, playfair.variable, inter.variable)}
    >
      <body className="min-h-screen bg-pearl font-sans text-midnight antialiased">
        <AuthProvider>
          <ChromeGate>
            <SkipToContent />
            <Header />
          </ChromeGate>
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <ChromeGate hideOnBookingFlow>
            <Footer />
          </ChromeGate>
          <ConsentGate />
        </AuthProvider>
      </body>
    </html>
  )
}

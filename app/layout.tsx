import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, Playfair_Display } from 'next/font/google'
import { ConsentGate } from '@/components/analytics'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { CurrencyProvider } from '@/components/currency'
import { ChromeGate, Footer, Header, SkipToContent } from '@/components/layout'
import { sanityFetch } from '@/lib/sanity/fetcher'
import { settingsQuery, type Settings } from '@/lib/sanity'
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
  title: 'Villa Paradise Tahiti — Luxury Villa & Hotel Alternative in Tahiti',
  description:
    'A private luxury villa in Tahiti, French Polynesia — the elegant alternative to a hotel. Direct booking with curated experiences and concierge service.',
  keywords: [...SITE_KEYWORDS],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Currency: the USD → EUR rate is server-authoritative (read from settings and
  // handed to the provider). The visitor's currency CHOICE is read client-side
  // from a cookie inside the provider (the middleware doesn't forward arbitrary
  // cookies to the server render), so the rate is always correct and only the
  // symbol may briefly flash to EUR on a returning EUR visitor's first paint.
  const settings = await sanityFetch<Settings | null>(settingsQuery).catch(() => null)
  const usdToEurRate = settings?.usdToEurRate ?? 0.88

  return (
    <html
      lang="en"
      className={cn(cormorant.variable, playfair.variable, inter.variable)}
    >
      <body className="min-h-screen bg-pearl font-sans text-midnight antialiased">
        <AuthProvider>
          <CurrencyProvider rate={usdToEurRate}>
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
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

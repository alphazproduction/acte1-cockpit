import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Mono, Outfit } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ACTE 1 · Cockpit',
  description: 'Cockpit financier ACTE 1 — Forecast 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${dmSerif.variable} ${dmMono.variable} ${outfit.variable}`}>
      <body className="bg-bg-primary font-sans antialiased">
        <Sidebar />
        <main className="md:ml-[220px] min-h-screen px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  )
}

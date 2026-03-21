import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, DM_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { rootMetadata, rootViewport } from '@/lib/seo'
import './globals.css'

// Skill 推荐："Friendly SaaS" 字体 — Plus Jakarta Sans（friendly, modern, SaaS, clean）
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = rootMetadata
export const viewport: Viewport = rootViewport

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${dmMono.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Business Intelligence Dashboard',
    template: '%s | BI Dashboard'
  },
  description: 'Professional Business Intelligence Dashboard - SaaS Analytics Platform with real-time data visualization, multi-tenant architecture, and enterprise-grade monitoring.',
  keywords: [
    'business intelligence',
    'dashboard',
    'analytics',
    'data visualization',
    'charts',
    'metrics',
    'real-time',
    'enterprise'
  ],
  authors: [
    {
      name: 'Nibert Investments',
      url: 'https://github.com/nibertinvestments'
    }
  ],
  creator: 'Nibert Investments',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bi-dashboard.example.com',
    siteName: 'Business Intelligence Dashboard',
    title: 'Business Intelligence Dashboard',
    description: 'Professional Business Intelligence Dashboard with real-time analytics',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Business Intelligence Dashboard'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business Intelligence Dashboard',
    description: 'Professional Business Intelligence Dashboard with real-time analytics',
    images: ['/images/og-image.png'],
    creator: '@nibertinvestments'
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
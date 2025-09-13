import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Business Intelligence Dashboard',
  description: 'Professional Business Intelligence Dashboard - SaaS Analytics Platform with real-time data visualization, multi-tenant architecture, and enterprise-grade monitoring',
  keywords: [
    'business-intelligence',
    'dashboard',
    'analytics',
    'saas',
    'next.js',
    'typescript',
    'postgresql',
    'real-time',
    'multi-tenant'
  ],
  authors: [{ name: 'Nibert Investments', url: 'https://github.com/nibertinvestments' }],
  creator: 'Nibert Investments',
  publisher: 'Nibert Investments',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Business Intelligence Dashboard',
    description: 'Professional Business Intelligence Dashboard - SaaS Analytics Platform',
    siteName: 'BI Dashboard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business Intelligence Dashboard',
    description: 'Professional Business Intelligence Dashboard - SaaS Analytics Platform',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
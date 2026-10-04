import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ChurchProvider } from '@/lib/store';
import OfflineStatusBanner from '@/components/OfflineStatusBanner';
import PWARegister from '@/components/PWARegister';

export const metadata: Metadata = {
  title: 'Christ Family Centre Makurdi | Reporting Portal',
  description: 'Official reporting and executive oversight dashboard for Christ Family Centre Makurdi - C3 Community Churches, Service Teams, and Ministries.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CFC Makurdi',
  },
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a719e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900 antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full font-sans flex flex-col selection:bg-[#0a719e] selection:text-white">
        <ChurchProvider>
          <OfflineStatusBanner />
          {children}
          <PWARegister />
        </ChurchProvider>
      </body>
    </html>
  );
}

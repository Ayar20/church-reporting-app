import type { Metadata } from 'next';
import './globals.css';
import { ChurchProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Christ Family Centre Makurdi | Reporting Portal',
  description: 'Official reporting and executive oversight dashboard for Christ Family Centre Makurdi - C3 Community Churches, Service Teams, and Ministries.',
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
      </head>
      <body className="min-h-full font-sans flex flex-col selection:bg-amber-500 selection:text-white">
        <ChurchProvider>{children}</ChurchProvider>
      </body>
    </html>
  );
}

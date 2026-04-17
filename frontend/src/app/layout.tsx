import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import MobileTabBar from '@/components/MobileTabBar';
import Providers from '@/components/Providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  title: 'Marketplace — одежда и обувь',
  description: 'Локальный маркетплейс одежды и обуви',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${cormorant.variable}`}>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 overflow-hidden">
            {children}
          </main>
          <MobileTabBar />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#f0e8d8',
                border: '1px solid #2a2a2a',
                borderRadius: '10px',
              },
              success: {
                iconTheme: { primary: '#c9a96e', secondary: '#0a0a0a' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

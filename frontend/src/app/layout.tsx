import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import MobileTabBar from '@/components/MobileTabBar';
import Providers from '@/components/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Marketplace — одежда и обувь',
  description: 'Локальный маркетплейс одежды и обуви',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Providers>
          <Header />
          {/* pb-20 on mobile to avoid content hiding behind fixed tab bar */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
            {children}
          </main>
          <MobileTabBar />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}

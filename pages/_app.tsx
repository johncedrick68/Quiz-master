import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${inter.variable} font-sans min-h-screen bg-dark-900 text-slate-100 flex flex-col`}>
      <Component {...pageProps} />
    </main>
  );
}

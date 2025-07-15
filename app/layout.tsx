import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// Load Inter font
const inter = Inter({ subsets: ['latin'] });

// Page metadata (title & description)
export const metadata: Metadata = {
  title: 'Call Analysis Dashboard',
  description: 'Transcribe and evaluate call recordings easily.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <header style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)' }}>
            Call Analysis System
          </h1>
        </header>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}

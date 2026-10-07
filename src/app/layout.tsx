import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, Space_Mono } from 'next/font/google';
import { copy } from '@/content/copy';
import './globals.css';

// Self-hosted at build time (no requests to Google from the visitor's browser).
const display = Space_Grotesk({ subsets: ['latin', 'vietnamese'], variable: '--nf-display', display: 'swap' });
const body = Inter({ subsets: ['latin', 'vietnamese'], variable: '--nf-body', display: 'swap' });
const mono = Space_Mono({ subsets: ['latin', 'vietnamese'], weight: ['400', '700'], variable: '--nf-mono', display: 'swap' });

export const metadata: Metadata = {
  title: copy.site.title,
  description: copy.site.description,
  // TODO(asset): OG image 1200×630 and favicon.
  openGraph: { title: copy.site.title, description: copy.site.description, type: 'website' },
};

export const viewport: Viewport = { themeColor: '#06060E', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

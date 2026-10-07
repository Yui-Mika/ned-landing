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

/**
 * Text reveal guard (SPEC §14.4). Runs before first paint, only when JavaScript runs:
 * `is-motion` lets globals.css hide [data-reveal] until the reveal takes over (no flash of text
 * that then jumps). Without JS the class never appears and all copy is visible. Failsafe: if the app
 * never starts the reveal, the text is shown after 2.5 s anyway.
 */
const REVEAL_GUARD = `(function(){var d=document.documentElement;d.classList.add('is-motion');setTimeout(function(){d.classList.add('reveal-done')},2500);setTimeout(function(){d.classList.add('band-ready','intro-done')},6000)})();`;

/**
 * Dev-only test harness: `?__reduced` makes JS see prefers-reduced-motion (SPEC test 21), because the
 * preview browser can't emulate the OS setting. Not included in production builds.
 */
const DEV_REDUCED_MOTION = `(function(){if(location.search.indexOf('__reduced')<0)return;var m=window.matchMedia.bind(window);window.matchMedia=function(q){if(q.indexOf('prefers-reduced-motion')<0)return m(q);var on=q.indexOf('no-preference')<0;return{matches:on,media:q,onchange:null,addEventListener:function(){},removeEventListener:function(){},addListener:function(){},removeListener:function(){},dispatchEvent:function(){return false}}}})();`;

export const viewport: Viewport = { themeColor: '#06060E', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the head script adds classes to <html> before React hydrates.
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_GUARD }} />
        {process.env.NODE_ENV !== 'production' && <script dangerouslySetInnerHTML={{ __html: DEV_REDUCED_MOTION }} />}
      </head>
      <body>{children}</body>
    </html>
  );
}

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

/**
 * Dev-only test harness: `?__raf` keeps frames running while the preview pane is hidden (it pauses
 * requestAnimationFrame and ResizeObserver and reports the page hidden): frames run off a MessageChannel at ~60 fps,
 * ResizeObserver is polled once per frame, and the page reports itself visible. Used by the layout audit (src/dev/audit.ts). Not included in production builds.
 */
const DEV_FRAMES = `(function(){if(location.search.indexOf('__raf')<0)return;Object.defineProperty(Document.prototype,'hidden',{get:function(){return false}});Object.defineProperty(Document.prototype,'visibilityState',{get:function(){return 'visible'}});var q=[],n=0,last=0,on=false,mc=new MessageChannel();mc.port1.onmessage=function(){var t=performance.now();if(t-last<16){mc.port2.postMessage(0);return}last=t;on=false;var cbs=q;q=[];for(var i=0;i<cbs.length;i++){if(!cbs[i].x){try{cbs[i].f(t)}catch(e){setTimeout(function(){throw e})}}}};window.requestAnimationFrame=function(f){var o={f:f,x:false,id:++n};q.push(o);if(!on){on=true;mc.port2.postMessage(0)}return o.id};window.cancelAnimationFrame=function(id){for(var i=0;i<q.length;i++)if(q[i].id===id)q[i].x=true};var ros=[];window.ResizeObserver=function(cb){this.cb=cb;this.m=new Map();ros.push(this)};ResizeObserver.prototype.observe=function(el){this.m.set(el,'')};ResizeObserver.prototype.unobserve=function(el){this.m.delete(el)};ResizeObserver.prototype.disconnect=function(){this.m.clear()};(function poll(){for(var i=0;i<ros.length;i++){var o=ros[i],en=[];o.m.forEach(function(v,el){var r=el.getBoundingClientRect(),k=r.width+'x'+r.height;if(k!==v){o.m.set(el,k);var s=[{inlineSize:r.width,blockSize:r.height}];en.push({target:el,contentRect:new DOMRect(0,0,r.width,r.height),borderBoxSize:s,contentBoxSize:s,devicePixelContentBoxSize:s})}});if(en.length)try{o.cb(en,o)}catch(e){setTimeout(function(){throw e})}}window.requestAnimationFrame(poll)})()})();`;

// viewport-fit=cover: the page runs under the notch / home indicator; the top bar, copy and stage zone pad
// themselves with env(safe-area-inset-*) (globals.css, scene/zone.ts).
export const viewport: Viewport = { themeColor: '#06060E', colorScheme: 'dark', viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the head script adds classes to <html> before React hydrates.
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_GUARD }} />
        {process.env.NODE_ENV !== 'production' && <script dangerouslySetInnerHTML={{ __html: DEV_REDUCED_MOTION }} />}
        {process.env.NODE_ENV !== 'production' && <script dangerouslySetInnerHTML={{ __html: DEV_FRAMES }} />}
      </head>
      <body>{children}</body>
    </html>
  );
}

'use client'
// ============================================
// Analytics Scripts — GA4 + Facebook Pixel + TikTok Pixel
// Only loads when IDs are set in env vars
// Path: src/components/AnalyticsScripts.tsx
// ============================================

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const GA_ID       = process.env.NEXT_PUBLIC_GA_ID
const FB_PIXEL    = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
const TIKTOK_PIXEL = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID

export default function AnalyticsScripts() {
  const pathname = usePathname()

  // Track page views on route change
  useEffect(() => {
    if (GA_ID && (window as any).gtag) {
      ;(window as any).gtag('config', GA_ID, { page_path: pathname })
    }
    if (FB_PIXEL && (window as any).fbq) {
      ;(window as any).fbq('track', 'PageView')
    }
    if (TIKTOK_PIXEL && (window as any).ttq) {
      ;(window as any).ttq.page()
    }
  }, [pathname])

  return (
    <>
      {/* Google Analytics 4 */}
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { page_path: window.location.pathname });
            `}
          </Script>
        </>
      )}

      {/* Facebook Pixel */}
      {FB_PIXEL && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* TikTok Pixel */}
      {TIKTOK_PIXEL && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
              ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
              ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
              ttq._o=ttq._o||{};ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript";
              n.async=!0;n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];
              e.parentNode.insertBefore(n,e)};
              ttq.load('${TIKTOK_PIXEL}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}
    </>
  )
}

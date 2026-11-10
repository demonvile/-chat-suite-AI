import React, { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export interface AnalyticsConfig {
  gaId?: string; // Google Analytics 4 Measurement ID e.g. G-XXXXXXX
  gscVerificationTag?: string; // Google Search Console HTML tag value
  clarityId?: string; // Microsoft Clarity Project ID
  metaPixelId?: string; // Meta (Facebook) Pixel ID
}

export const AnalyticsScript: React.FC<AnalyticsConfig> = ({
  gaId = 'G-CHATSUITE2026',
  gscVerificationTag = 'chatsuite-gsc-verification-code-2026',
  clarityId = 'clarity-chatsuite-id',
  metaPixelId = '123456789012345'
}) => {
  useEffect(() => {
    // 1. Google Search Console Meta Verification Tag
    if (gscVerificationTag) {
      let gscMeta = document.querySelector('meta[name="google-site-verification"]');
      if (!gscMeta) {
        gscMeta = document.createElement('meta');
        gscMeta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(gscMeta);
      }
      gscMeta.setAttribute('content', gscVerificationTag);
    }

    // 2. Google Analytics 4 Loader
    if (gaId && !document.getElementById('ga-script')) {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', gaId, { send_page_view: true });

      const gaScript = document.createElement('script');
      gaScript.id = 'ga-script';
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(gaScript);
    }

    // 3. Microsoft Clarity Session Recording
    if (clarityId && !document.getElementById('clarity-script')) {
      const clarityScript = document.createElement('script');
      clarityScript.id = 'clarity-script';
      clarityScript.type = 'text/javascript';
      clarityScript.text = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `;
      document.head.appendChild(clarityScript);
    }

    // 4. Meta Pixel Script Loader
    if (metaPixelId && !document.getElementById('meta-pixel-script')) {
      const pixelScript = document.createElement('script');
      pixelScript.id = 'meta-pixel-script';
      pixelScript.text = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${metaPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(pixelScript);
    }
  }, [gaId, gscVerificationTag, clarityId, metaPixelId]);

  return null;
};

// Growth & Lead Event Tracker Utility Function
export const trackGrowthEvent = (eventName: string, params?: Record<string, any>) => {
  console.log(`[Growth Analytics] Event: ${eventName}`, params);

  // Send to GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }

  // Send to Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, params);
  }

  // Send to Microsoft Clarity
  if (typeof window.clarity === 'function') {
    window.clarity('set', eventName, JSON.stringify(params || {}));
  }
};

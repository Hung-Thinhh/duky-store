"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Utility function to send custom Facebook Pixel events from Client Components.
 * @param name Event name (e.g., 'AddToCart', 'InitiateCheckout', 'Purchase', or custom event)
 * @param options Additional options/parameters for the event
 */
export const fbqEvent = (
  name: string,
  options?: any,
  eventOptions?: { eventID?: string }
) => {
  if (typeof window !== "undefined" && window.fbq) {
    if (eventOptions) {
      window.fbq("track", name, options, eventOptions);
    } else {
      window.fbq("track", name, options);
    }
  }
};

function FacebookPixelEvents({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  return null;
}

export default function FacebookPixel({ pixelId }: { pixelId?: string }) {
  if (!pixelId) return null;

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt="facebook-pixel"
        />
      </noscript>
      <Suspense fallback={null}>
        <FacebookPixelEvents pixelId={pixelId} />
      </Suspense>
    </>
  );
}

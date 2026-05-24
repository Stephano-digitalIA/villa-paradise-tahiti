'use client'

/**
 * Hotjar loader — Phase F2.
 *
 * Standard Hotjar Tracking Code wrapped in a `next/script` with the
 * `afterInteractive` strategy so it never blocks First Paint.
 *
 * Behaviour by mode:
 *   - no `NEXT_PUBLIC_HOTJAR_ID`  → component renders `null` (mock-safe).
 *   - consent declined            → not rendered by `<ConsentGate />`.
 *   - consent accepted            → tracker snippet injected once.
 *
 * Like `<GoogleAnalytics />`, this component is mounted by
 * `<ConsentGate />` only after consent, so no internal gating needed.
 */

import Script from 'next/script'

const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID

export function Hotjar() {
  if (!HOTJAR_ID) return null

  // `hjid` must be a number in the Hotjar snippet — coerce/validate the env value.
  const hjid = Number.parseInt(HOTJAR_ID, 10)
  if (!Number.isFinite(hjid) || hjid <= 0) return null

  return (
    <Script id="hotjar" strategy="afterInteractive">
      {`
(function(h,o,t,j,a,r){
  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
  h._hjSettings={hjid:${hjid},hjsv:6};
  a=o.getElementsByTagName('head')[0];
  r=o.createElement('script');r.async=1;
  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
  a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
    </Script>
  )
}

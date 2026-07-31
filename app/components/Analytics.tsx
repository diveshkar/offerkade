import Script from 'next/script';

// Google Analytics 4. Loads ONLY when NEXT_PUBLIC_GA_ID is set (e.g. "G-XXXXXXX"),
// so it stays completely off until you add your Measurement ID. Once live, GA4
// records each pageview with the visitor's country — used later to see which
// offers attract foreign visitors (for Google Ads targeting).
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}

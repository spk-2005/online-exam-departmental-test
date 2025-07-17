

import Script from "next/script";

import "@/styles/globals.css";
import '@/styles/instructioins.css'; // adjust your css import path accordingly
export default function App({ Component, pageProps }) {
  return (<>
  
  <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-5194FX0QZR"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5194FX0QZR', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

  <Component {...pageProps} /></>);
}

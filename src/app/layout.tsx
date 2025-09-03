
import type { Metadata } from 'next';
import './globals.css';
import { MetaPixel } from '@/components/meta-pixel';
import { N8NTracker } from '@/components/n8n-tracker';
import { Suspense } from 'react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Mounjaro Quiz',
  description: 'A quiz about Mounjaro, inspired by European formulas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-W3V9W2R');`}
        </Script>
        {/* Vturb preloading scripts */}
        <script dangerouslySetInnerHTML={{ __html: `!function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);` }}></script>
        <link rel="preload" href="https://scripts.converteai.net/ac8b95fd-dbe1-4fe7-aa68-0fad06c9ea3d/players/68b7c566d95b2222fd24bec2/v4/player.js" as="script" />
        <link rel="preload" href="https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js" as="script" />
        <link rel="preload" href="https://cdn.converteai.net/ac8b95fd-dbe1-4fe7-aa68-0fad06c9ea3d/68b7c536c11c9be3d9542c58/main.m3u8" as="fetch" />
        <link rel="dns-prefetch" href="https://cdn.converteai.net" />
        <link rel="dns-prefetch" href="https://scripts.converteai.net" />
        <link rel="dns-prefetch" href="https://images.converteai.net" />
        <link rel="dns-prefetch" href="https://api.vturb.com.br" />

      </head>
      <body className="font-body antialiased">
        <Suspense fallback={null}>
          <N8NTracker />
          <MetaPixel />
        </Suspense>
        {children}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W3V9W2R"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
      </body>
    </html>
  );
}

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
      </head>
      <body className="font-body antialiased">
        <Suspense fallback={null}>
          <N8NTracker />
        </Suspense>
        {children}
        <MetaPixel />
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
